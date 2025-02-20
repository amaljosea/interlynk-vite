import { useMutation } from '@apollo/client'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ProductDetailsTabs } from 'utils/TabsObjects'
import { validatePhoneNumber } from 'utils/formValidationUtils'

import { Button, Flex, FormControl, FormLabel, Input } from '@chakra-ui/react'

import EnvironmentSelector from 'components/EnvironmentSelector'
import LynkAlert from 'components/LynkAlert'
import LynkModal from 'components/LynkModal'

import useCustomToast from 'hooks/useCustomToast'
import { useGlobalQueryContext } from 'hooks/useGlobalQueryContext'
import { usePaginatedQuery } from 'hooks/usePaginatedQuery'
import { useProductUrlContext } from 'hooks/useProductUrlContext'
import useQueryParam from 'hooks/useQueryParam'

import { AutomationRuleCreate, authorCreate } from 'graphQL/Mutation'
import { GetCheckResults } from 'graphQL/Queries'

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

const AuthorModal = ({ isOpen, onClose, ruleExists, recheck }) => {
  const params = useParams()
  const navigate = useNavigate()
  const activeTab = useQueryParam('tab')
  const { showToast } = useCustomToast()
  const { isFreeTier } = useGlobalQueryContext()
  const { generateProductDetailPageUrlFromCurrentUrl } = useProductUrlContext()

  const [selectedEnvironments, setSelectedEnvironments] = useState([])

  const [createRule, { loading: ruleLoading }] =
    useMutation(AutomationRuleCreate)
  const [createAuthor, { loading }] = useMutation(authorCreate, {
    onCompleted: () => recheck()
  })

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

  const resolved = status === 'resolved'

  const { AUTOMATION_RULES } = ProductDetailsTabs
  const link = generateProductDetailPageUrlFromCurrentUrl({
    paramsObj: {
      tab: AUTOMATION_RULES
    }
  })

  const initialData = {
    name: '',
    email: '',
    phone: ''
  }
  const [authorData, setAuthorData] = useState(initialData)
  const [error, setError] = useState('')

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

  const handleAddAuthor = async (applyRule) => {
    try {
      const res = await createAuthor({
        variables: {
          sbomId: params?.sbomid,
          name: authorData?.name || undefined,
          email: authorData?.email || undefined,
          phone: authorData?.phone || undefined
        }
      })

      if (res?.data?.authorCreate?.errors?.length > 0) {
        setError(res?.data?.authorCreate?.errors[0])
      }

      showToast({
        description: 'Author added successfully',
        status: 'success'
      })

      if (applyRule) {
        await handleRuleCreate()
      }
    } finally {
      onClose()
    }
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
          showToast({
            description: `Unable to create rule for one or more projects. Please try again.`,
            status: 'error'
          })
        } else {
          showToast({
            description: 'Rule added successfully.',
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

  const handleAutomation = async () => {
    if (resolved) {
      await handleRuleCreate().then(() => onClose())
    } else {
      handleAddAuthor(true)
    }
  }

  const handleClose = () => {
    setAuthorData(initialData)
    setError('')
    onClose()
  }

  const isValidPhoneNumber =
    authorData?.phone && !validatePhoneNumber(authorData?.phone)

  const RuleAction = () => {
    return (
      <Button
        fontSize={'sm'}
        variant='ghost'
        isLoading={ruleLoading}
        loadingText='Loading...'
        onClick={handleAutomation}
        hidden={friendlyId ? false : true}
        isDisabled={authorData?.name === ''}
        colorScheme={ruleExists ? 'green' : 'blue'}
        title={`${ruleExists ? 'View' : 'Save as'} Rule`}
      >
        {ruleExists ? 'View' : 'Save as'} Rule
      </Button>
    )
  }

  useEffect(() => {
    if (sbom?.authors?.length > 0) {
      const { name, email } = sbom.authors[0]
      setAuthorData((prev) => ({ ...prev, name, email }))
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
      hideCancelButton={ruleLoading}
      hidden={resolved || ruleLoading}
      onSubmit={() => handleAddAuthor(false)}
      leftFooterContent={!isFreeTier && <RuleAction />}
    >
      <Flex direction={'column'} alignItems={'flex-start'} gap={3}>
        {error && <LynkAlert msg={error} />}
        <FormControl isRequired isDisabled={resolved}>
          <FormLabel htmlFor='name'>Name</FormLabel>
          <TextInput
            type='text'
            name={'name'}
            placeholder='Add name'
            value={authorData?.name}
            onChange={handleChange}
          />
        </FormControl>
        <FormControl isDisabled={resolved}>
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
        <FormControl isInvalid={isValidPhoneNumber} isDisabled={resolved}>
          <FormLabel htmlFor='phone'>Phone</FormLabel>
          <Input
            type='tel'
            name='phone'
            onBlur={onPhoneBlur}
            onChange={handleChange}
            value={authorData?.phone}
            placeholder='Add phone number'
          />
        </FormControl>
        {!ruleExists && (
          <EnvironmentSelector
            fixed={resolved}
            ruleExists={ruleExists}
            environments={selectedEnvironments}
            setEnvironments={setSelectedEnvironments}
          />
        )}
      </Flex>
    </LynkModal>
  )
}

export default AuthorModal
