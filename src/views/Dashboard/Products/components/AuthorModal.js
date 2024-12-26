import { useMutation, useQuery } from '@apollo/client'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { validatePhoneNumber } from 'utils'
import { ProductDetailsTabs } from 'utils/TabsObjects'

import {
  Button,
  Checkbox,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Skeleton,
  VStack
} from '@chakra-ui/react'

import LynkAlert from 'components/LynkAlert'
import LynkModal from 'components/LynkModal'

import useCustomToast from 'hooks/useCustomToast'
import { useGlobalQueryContext } from 'hooks/useGlobalQueryContext'
import { usePaginatedQuery } from 'hooks/usePaginatedQuery'
import { useProductUrlContext } from 'hooks/useProductUrlContext'
import { useProjectGroup } from 'hooks/useProjectGroup'
import useQueryParam from 'hooks/useQueryParam'

import { AutomationRuleCreate, authorCreate } from 'graphQL/Mutation'
import { GetCheckResults, GetExistingRules } from 'graphQL/Queries'

import { FaUserPlus } from 'react-icons/fa6'

const TextInput = ({ name, value, onChange, placeholder }) => {
  return (
    <Input
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      autoComplete={'off'}
      placeholder={placeholder}
    />
  )
}

const AuthorModal = ({ isOpen, onClose }) => {
  const params = useParams()
  const navigate = useNavigate()
  const activeTab = useQueryParam('tab')
  const { showToast } = useCustomToast()
  const { isFreeTier } = useGlobalQueryContext()
  const { generateProductDetailPageUrlFromCurrentUrl } = useProductUrlContext()

  const [options, setOptions] = useState([])
  const [defaultEnv, setDefaultEnv] = useState('')
  const [selectedEnvironments, setSelectedEnvironments] = useState([])

  const { projects, loading: envLoading } = useProjectGroup({
    projectGroupId: params.productgroupid
  })

  const [createRule, { loading: ruleLoading }] =
    useMutation(AutomationRuleCreate)
  const [createAuthor, { loading }] = useMutation(authorCreate)

  const { nodes } = usePaginatedQuery(GetCheckResults, {
    skip: activeTab === 'checks' ? false : true,
    selector: 'sbom.checkResults',
    variables: {
      sbomId: params?.sbomid,
      projectId: params?.productid,
      field: 'CHECK_RESULTS_UPDATED_AT',
      direction: 'DESC',
      checkId: ['SB-HC-7']
    }
  })

  const { status, organizationRule, sbom } = nodes?.length ? nodes[0] : []
  const { friendlyId, shortDesc } = organizationRule?.rule || ''

  const { AUTOMATION_RULES } = ProductDetailsTabs
  const link = generateProductDetailPageUrlFromCurrentUrl({
    paramsObj: {
      tab: AUTOMATION_RULES
    }
  })

  const { data } = useQuery(GetExistingRules, {
    skip: isOpen ? false : true,
    variables: {
      id: params?.productid,
      checkIdentifier: friendlyId
    }
  })

  const ruleExists = data?.project?.automationRules?.nodes?.length > 0

  const initialData = {
    name: '',
    email: '',
    phone: ''
  }
  const [authorData, setAuthorData] = useState(initialData)
  const [error, setError] = useState('')

  const handleCheckboxChange = (env, isChecked) => {
    if (env.value === defaultEnv.value) {
      // Default option cannot be unchecked
      return
    }

    if (isChecked) {
      setSelectedEnvironments((prev) => [...prev, env])
    } else {
      setSelectedEnvironments((prev) =>
        prev.filter((item) => item.value !== env.value)
      )
    }
  }

  useEffect(() => {
    const defaultOption = projects.find(
      (project) => project.id === params.productgroupid
    )
    if (defaultOption) {
      const defaultEnvObj = {
        value: defaultOption.id,
        label: defaultOption.name
      }
      setDefaultEnv(defaultEnvObj)
      setSelectedEnvironments([defaultEnvObj])
    }

    const otherOptions = projects
      .filter((project) => project.id !== params.productgroupid)
      .map((project) => ({
        value: project.id,
        label: project.name
      }))
    setOptions(otherOptions)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [envLoading])

  const handleChange = (e) => {
    const { name, value } = e.target
    setAuthorData((prev) => ({
      ...prev,
      [name]: value
    }))
    setError('')
  }

  const onPhoneBlur = (e) => {
    const { value } = e.target
    if (value !== '' && !validatePhoneNumber(value)) {
      setError('Please enter a valid number')
    } else {
      setError('')
    }
  }

  const handleAddAuthor = () => {
    createAuthor({
      variables: {
        sbomId: params?.sbomid,
        name: authorData?.name,
        email: authorData?.email,
        phone: authorData?.phone
      }
    }).then((res) => {
      if (res?.data?.authorCreate?.errors?.length > 0) {
        setError(res?.data?.authorCreate?.errors[0])
      } else {
        showToast({
          description: 'Author added successfully',
          status: 'success'
        })
        setAuthorData(initialData)
        onClose()
      }
    })
  }

  const conditionsAttributes = [
    {
      subject: 'version',
      operator: 'not_exists',
      field: 'version_author_name',
      value: undefined
    },
    {
      subject: 'version',
      operator: 'not_exists',
      field: 'version_author_email',
      value: undefined
    }
  ]

  const actionsAttributes = [
    {
      subject: 'version',
      field: 'version_author_name',
      value: authorData?.name
    },
    {
      subject: 'version',
      field: 'version_author_email',
      value: authorData?.email
    }
  ]

  const handleRuleCreate = async () => {
    if (ruleExists) {
      navigate(link)
    } else {
      const projectIds = selectedEnvironments?.map((option) => option.value)

      const mutationPromises = projectIds.map((id) =>
        createRule({
          variables: {
            active: true,
            name: shortDesc,
            projectId: id,
            checkIdentifier: friendlyId,
            automationConditionsAttributes: conditionsAttributes,
            automationActionsAttributes: actionsAttributes
          }
        })
      )

      try {
        const results = await Promise.all(mutationPromises)
        const allErrors = results.flatMap(
          (res) => res?.data?.automationRuleCreate?.errors || []
        )

        if (allErrors.length > 0) {
          onClose()
          showToast({
            description: `Unable to create rule for one or more projects. Please try again.`,
            status: 'error'
          })
        } else {
          handleAddAuthor()
          showToast({
            description: 'Rule added successfully for all selected projects.',
            status: 'success'
          })
        }
      } catch (error) {
        console.error('Error during rule creation:', error)
        showToast({
          description: 'An unexpected error occurred while creating the rule.',
          status: 'error'
        })
      }
    }
  }

  const handleClose = () => {
    setAuthorData(initialData)
    setError('')
    onClose()
  }

  const isValidPhoneNumber =
    authorData?.phone && !validatePhoneNumber(authorData?.phone)

  useEffect(() => {
    if (sbom?.authors?.length > 0) {
      const { name, email } = sbom.authors[0]
      setAuthorData({ name, email })
    }
  }, [sbom?.authors])

  return (
    <LynkModal
      isOpen={isOpen}
      Icon={FaUserPlus}
      isLoading={loading}
      buttonText={'Save'}
      title={`Add Author`}
      onClose={handleClose}
      onSubmit={handleAddAuthor}
      hidden={status === 'resolved'}
      leftFooterContent={
        !isFreeTier && (
          <Button
            fontSize={'sm'}
            variant='ghost'
            onClick={handleRuleCreate}
            hidden={friendlyId ? false : true}
            isLoading={ruleLoading || loading}
            colorScheme={ruleExists ? 'green' : 'blue'}
            title={`${ruleExists ? 'View' : 'Save as'} Rule`}
            isDisabled={!authorData?.name || !authorData?.email}
          >
            {ruleExists ? 'View' : 'Save as'} Rule
          </Button>
        )
      }
    >
      <Flex direction={'column'} alignItems={'flex-start'} gap={3}>
        {error && <LynkAlert msg={error} />}
        <FormControl isRequired isDisabled={status === 'resolved'}>
          <FormLabel htmlFor='name'>Name</FormLabel>
          <TextInput
            type='text'
            name={'name'}
            placeholder='Add name'
            value={authorData?.name}
            onChange={handleChange}
          />
        </FormControl>
        <FormControl isDisabled={status === 'resolved'}>
          <FormLabel htmlFor='email'>Email</FormLabel>
          <Input
            type='email'
            name='email'
            autoComplete={'off'}
            onChange={handleChange}
            value={authorData?.email}
            placeholder='Add email address'
          />
        </FormControl>
        <FormControl isInvalid={isValidPhoneNumber}>
          <FormLabel htmlFor='phone'>Phone</FormLabel>
          <Input
            type='text'
            name='phone'
            onBlur={onPhoneBlur}
            onChange={handleChange}
            value={authorData?.phone}
            placeholder='Add phone number'
          />
        </FormControl>
        {!ruleExists && (
          <FormControl mt={5}>
            <FormLabel>
              Select Environments - only applicable for saving as rule
            </FormLabel>
            {envLoading ? (
              <VStack align='start'>
                {/* Loading Skeletons */}
                <Skeleton height='16px' width='150px' />
                <Skeleton height='16px' width='150px' />
                <Skeleton height='16px' width='150px' />
              </VStack>
            ) : (
              <VStack align='start'>
                {/* Default Environment */}
                <Checkbox
                  isChecked
                  isDisabled
                  value={defaultEnv?.value}
                  onChange={() => {}}
                >
                  {defaultEnv?.label}
                </Checkbox>
                {/* Other Environments */}
                {options.map((option) => (
                  <Checkbox
                    key={option.value}
                    isChecked={selectedEnvironments?.some(
                      (env) => env.value === option.value
                    )}
                    onChange={(e) =>
                      handleCheckboxChange(option, e.target.checked)
                    }
                  >
                    {option.label}
                  </Checkbox>
                ))}
              </VStack>
            )}
          </FormControl>
        )}
      </Flex>
    </LynkModal>
  )
}

export default AuthorModal
