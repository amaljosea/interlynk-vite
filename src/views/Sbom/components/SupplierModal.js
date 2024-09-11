import { useMutation } from '@apollo/client'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { validateEmail, validateUrl } from 'utils'
import { ProductDetailsTabs } from 'utils/TabsObjects'

import {
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Tag,
  Text
} from '@chakra-ui/react'

import LynkModal from 'components/LynkModal'

import { useProductUrlContext } from 'hooks/useProductUrlContext'

import {
  AutomationRuleCreate,
  addComSupplier,
  updateComSupplier
} from 'graphQL/Mutation'
import { recheckHealth } from 'graphQL/Mutation'

import { BiCube } from 'react-icons/bi'

const SupplierModal = ({
  id,
  data,
  isOpen,
  onClose,
  activeRow,
  ruleExists,
  isFreeTier
}) => {
  const params = useParams()
  const productId = params.productid
  const navigate = useNavigate()
  const { generateProductDetailPageUrlFromCurrentUrl } = useProductUrlContext()

  const [recheck] = useMutation(recheckHealth)
  const [createSupplier] = useMutation(addComSupplier)
  const [updateSupplier] = useMutation(updateComSupplier)

  const { status, component } = activeRow || ''
  const { name, version } = component || ''
  const { friendlyId, shortDesc } = activeRow?.organizationRule?.rule || ''
  const resolved = status === 'resolved'

  const [orgName, setOrgName] = useState('')
  const [orgUrl, setOrgUrl] = useState('')
  const [isValidUrl, setIsValidUrl] = useState('')
  const [supName, setSupName] = useState('')
  const [nameError, setNameError] = useState('')
  const [supEmail, setSupEmail] = useState('')
  const [emailError, setEmailError] = useState('')
  const [isDisabled, setIsDisabled] = useState(false)

  const disableButtonTemporarily = () => {
    setIsDisabled(true)
    setTimeout(() => {
      setIsDisabled(false)
    }, 3000)
  }

  const containsSpace = /\s/.test(orgUrl)

  const onSupplierChange = (e) => {
    const { value } = e.target
    setSupName(value)
    if ((value.length > 0 && value.length < 4) || value.length > 256) {
      setNameError('Input must be between 4 and 256 characters')
    } else {
      setNameError('')
    }
  }

  const { suppliers } = data || ''

  useEffect(() => {
    if (data && data?.suppliers?.length > 0) {
      const { suppliers } = data
      setOrgName(suppliers[0].name || '')
      setOrgUrl(suppliers[0].url || '')
      setSupName(suppliers[0].contactName || '')
      setSupEmail(suppliers[0].contactEmail || '')
    }
  }, [data])

  const handleRecheck = () => {
    recheck({
      variables: {
        sbomId: params?.sbomid,
        friendlyCheckId: friendlyId,
        componentId: component?.id
      }
    })
  }

  const handleSave = () => {
    disableButtonTemporarily()
    if (resolved) {
      onClose()
    } else {
      createSupplier({
        variables: {
          name: orgName,
          url: orgUrl,
          contactName: supName,
          contactEmail: supEmail,
          componentId: component?.id || id
        }
      })
        .then(() => friendlyId && handleRecheck())
        .finally(() => onClose())
    }
  }

  const handleUpdate = () => {
    disableButtonTemporarily()
    updateSupplier({
      variables: {
        name: orgName,
        url: orgUrl,
        contactName: supName,
        contactEmail: supEmail,
        id: data && data.suppliers && data.suppliers[0].id
      }
    })
      .then(() => friendlyId && handleRecheck())
      .finally(() => onClose())
  }

  const handleCheckEmail = () => {
    if (!validateEmail(supEmail)) {
      setEmailError('Email is invalid')
    }
  }

  const handleCheckUrl = () => {
    if (!validateUrl(orgUrl)) {
      setIsValidUrl('Please enter a valid URL')
    }
  }

  const onUrlChange = (e) => {
    const { value } = e.target
    setOrgUrl(value)
    setIsValidUrl('')
  }

  const [createRule] = useMutation(AutomationRuleCreate)

  const conditionsAttributes = [
    {
      subject: 'component',
      operator: 'is',
      field: 'component_name',
      value: component?.name
    },
    {
      subject: 'component',
      operator: 'is',
      field: 'component_version',
      value: component?.version
    },
    {
      subject: 'component',
      operator: 'not_exists',
      field: 'component_supplier_name',
      value: undefined
    },
    {
      subject: 'component',
      operator: 'not_exists',
      field: 'component_supplier_url',
      value: undefined
    },
    {
      subject: 'component',
      operator: 'not_exists',
      field: 'component_supplier_contact_name',
      value: undefined
    },
    {
      subject: 'component',
      operator: 'not_exists',
      field: 'component_supplier_contact_email',
      value: undefined
    }
  ]

  const actionsAttributes = [
    {
      subject: 'component',
      field: 'component_supplier_name',
      value: orgName || undefined
    },
    {
      subject: 'component',
      field: 'component_supplier_url',
      value: orgUrl || undefined
    },
    {
      subject: 'component',
      field: 'component_supplier_contact_name',
      value: supName || undefined
    },
    {
      subject: 'component',
      field: 'component_supplier_contact_email',
      value: supEmail || undefined
    }
  ]

  const filterActions = actionsAttributes?.filter(
    (item) => item?.value !== undefined
  )

  const { AUTOMATION_RULES } = ProductDetailsTabs

  const link = generateProductDetailPageUrlFromCurrentUrl({
    paramsObj: {
      tab: AUTOMATION_RULES
    }
  })

  const handleRuleCreate = async () => {
    if (ruleExists) {
      navigate(link)
    } else {
      disableButtonTemporarily()
      await createRule({
        variables: {
          active: true,
          name: shortDesc,
          projectId: productId,
          checkComponent: name,
          checkVersion: version,
          checkIdentifier: friendlyId,
          automationConditionsAttributes: conditionsAttributes,
          automationActionsAttributes: filterActions
        }
      }).then((res) => {
        const errors = res?.data?.automationRuleCreate?.errors
        if (errors?.length > 0) {
          console.log(errors[0])
        } else {
          handleSave()
        }
      })
    }
  }

  const isInvalid =
    isDisabled ||
    orgName === '' ||
    nameError !== '' ||
    (supEmail !== '' && !validateEmail(supEmail)) ||
    (orgUrl !== '' && !validateUrl(orgUrl))

  useEffect(() => {
    if (status === 'resolved' && component?.suppliers?.length > 0) {
      const { suppliers } = component
      setOrgName(suppliers[0]?.name)
      setOrgUrl(suppliers[0]?.url)
      setSupName(suppliers[0]?.contactName)
      setSupEmail(suppliers[0]?.contactEmail)
    }
  }, [component, status])

  return (
    <>
      <LynkModal
        isOpen={isOpen}
        onClose={onClose}
        onSubmit={suppliers?.length > 0 ? handleUpdate : handleSave}
        title={`${data && data.suppliers?.length > 0 ? 'Edit' : 'Add'} Supplier`}
        Icon={BiCube}
        disabled={isInvalid}
        hidden={resolved}
        buttonText={suppliers?.length > 0 ? 'Update' : 'Save'}
        leftFooterContent={
          !isFreeTier && (
            <Button
              fontSize={'sm'}
              variant='ghost'
              mr={'auto'}
              isDisabled={isInvalid}
              onClick={handleRuleCreate}
              hidden={friendlyId ? false : true}
              colorScheme={ruleExists ? 'green' : 'blue'}
            >
              {ruleExists ? 'View' : 'Save as'} Rule
            </Button>
          )
        }
      >
        {data && (
          <Flex
            width='99%'
            direction={'row'}
            alignItems={'center'}
            justifyContent={'flex-start'}
            flexWrap={'wrap'}
            gap={2}
            mb={4}
          >
            <Text fontWeight={'medium'} wordBreak={'break-all'}>
              {data.name}
            </Text>
            <Tag colorScheme='blue'>{data.version}</Tag>
          </Flex>
        )}
        <Flex
          hidden={component ? false : true}
          width='100%'
          direction={'row'}
          alignItems={'center'}
          justifyContent={'flex-start'}
          wrap={'wrap'}
          gap={2}
          mb={6}
        >
          <Text wordBreak={'break-all'}>{component?.name || '-'}</Text>
          <Tag colorScheme='blue'>{component?.version || '-'}</Tag>
        </Flex>
        <Flex width={'100%'} direction={'column'} gap={4}>
          {/* ORG NAME */}
          <FormControl isRequired isDisabled={resolved}>
            <FormLabel fontSize={12}>Organization Name</FormLabel>
            <Input
              placeholder='Enter organization name'
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              fontSize={14}
            />
          </FormControl>
          {/* ORG URL */}
          <FormControl
            isDisabled={resolved}
            isInvalid={(orgUrl !== '' && !validateUrl(orgUrl)) || containsSpace}
          >
            <FormLabel fontSize={12}>URL</FormLabel>
            <Input
              placeholder='Enter URL'
              value={orgUrl}
              onBlur={handleCheckUrl}
              onChange={onUrlChange}
              fontSize={14}
            />
            <FormErrorMessage>{isValidUrl}</FormErrorMessage>
          </FormControl>
          {/* SUPPLIER NAME */}
          <FormControl
            isInvalid={supName !== '' && nameError !== ''}
            isDisabled={resolved}
          >
            <FormLabel fontSize={12}>Contact Name</FormLabel>
            <Input
              placeholder='Enter supplier name'
              value={supName}
              onChange={onSupplierChange}
              fontSize={14}
            />
            <FormErrorMessage>{nameError}</FormErrorMessage>
          </FormControl>
          {/* SUPPLIER EMAIL */}
          <FormControl
            isDisabled={resolved}
            isInvalid={supEmail !== '' && !validateEmail(supEmail)}
          >
            <FormLabel f fontSize={12}>
              Contact Email
            </FormLabel>
            <Input
              placeholder='Enter supplier email'
              value={supEmail}
              onBlur={handleCheckEmail}
              onChange={(e) => {
                setSupEmail(e.target.value)
                setEmailError('')
              }}
              fontSize={14}
            />
            <FormErrorMessage>{emailError}</FormErrorMessage>
          </FormControl>
        </Flex>
      </LynkModal>
    </>
  )
}

export default SupplierModal
