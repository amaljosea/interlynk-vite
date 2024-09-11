import { useMutation, useQuery } from '@apollo/client'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ProductDetailsTabs } from 'utils/TabsObjects'

import { Button, Flex, FormControl, FormLabel, Input } from '@chakra-ui/react'

import LynkError from 'components/LynkError'
import LynkModal from 'components/LynkModal'

import { useGlobalQueryContext } from 'hooks/useGlobalQueryContext'
import { usePaginatedQuery } from 'hooks/usePaginatedQuery'
import { useProductUrlContext } from 'hooks/useProductUrlContext'
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
      placeholder={placeholder}
    />
  )
}

const AuthorModal = ({ isOpen, onClose }) => {
  const params = useParams()
  const navigate = useNavigate()
  const activeTab = useQueryParam('tab')
  const { isFreeTier } = useGlobalQueryContext()
  const { generateProductDetailPageUrlFromCurrentUrl } = useProductUrlContext()

  const [createRule, { loading: ruleLoading }] =
    useMutation(AutomationRuleCreate)
  const [createAuthor, { loading }] = useMutation(authorCreate)

  const { data } = useQuery(GetExistingRules, {
    skip: isOpen ? false : true,
    variables: {
      id: params?.productid,
      checkIdentifier: friendlyId
    }
  })

  const ruleExists = data?.project?.automationRules?.nodes?.length > 0

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

  const initialData = {
    name: '',
    email: ''
  }
  const [authorData, setAuthorData] = useState(initialData)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setAuthorData((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  const handleAddAuthor = () => {
    createAuthor({
      variables: {
        name: authorData?.name,
        email: authorData?.email,
        sbomId: params?.sbomid
      }
    }).then((res) => {
      if (res?.data?.authorCreate?.errors?.length > 0) {
        setError(res?.data?.authorCreate?.errors[0])
      } else {
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

  const handleRuleCreate = () => {
    if (ruleExists) {
      navigate(link)
    } else {
      createRule({
        variables: {
          active: true,
          name: shortDesc,
          projectId: params?.productid,
          checkIdentifier: friendlyId,
          automationConditionsAttributes: conditionsAttributes,
          automationActionsAttributes: actionsAttributes
        }
      }).then((res) => {
        const errors = res?.data?.automationRuleCreate?.errors
        if (errors?.length > 0) {
          console.log(errors[0])
        } else {
          handleAddAuthor()
        }
      })
    }
  }

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
      onClose={onClose}
      isLoading={loading}
      buttonText={'Save'}
      title={`Add Author`}
      onSubmit={handleAddAuthor}
      hidden={status === 'resolved'}
      leftFooterContent={
        !isFreeTier && (
          <Button
            fontSize={'sm'}
            onClick={handleRuleCreate}
            isLoading={ruleLoading}
            hidden={friendlyId ? false : true}
            colorScheme={ruleExists ? 'green' : 'blue'}
          >
            {ruleExists ? 'View' : 'Save as'} Rule
          </Button>
        )
      }
    >
      <Flex direction={'column'} alignItems={'flex-start'} gap={3}>
        {error && <LynkError error={error} />}
        <FormControl isRequired isReadOnly={status === 'resolved'}>
          <FormLabel htmlFor='name'>Name</FormLabel>
          <TextInput
            type='text'
            name={'name'}
            placeholder='Add name'
            value={authorData?.name}
            onChange={handleChange}
          />
        </FormControl>
        <FormControl isRequired isReadOnly={status === 'resolved'}>
          <FormLabel htmlFor='email'>Email</FormLabel>
          <Input
            type='email'
            name='email'
            onChange={handleChange}
            value={authorData?.email}
            placeholder='Add email address'
          />
        </FormControl>
      </Flex>
    </LynkModal>
  )
}

export default AuthorModal
