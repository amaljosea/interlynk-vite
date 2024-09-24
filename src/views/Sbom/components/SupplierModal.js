import { useMutation } from '@apollo/client'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { validateUrl } from 'utils'
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

import { useGlobalQueryContext } from 'hooks/useGlobalQueryContext'
import { useProductUrlContext } from 'hooks/useProductUrlContext'

import { AutomationRuleCreate, addComSupplier } from 'graphQL/Mutation'

import { BiCube } from 'react-icons/bi'

const SupplierModal = (props) => {
  const { isOpen, onClose, activeRow, ruleExists, recheck } = props

  const params = useParams()
  const productId = params.productid
  const navigate = useNavigate()
  const { isFreeTier } = useGlobalQueryContext()
  const { generateProductDetailPageUrlFromCurrentUrl } = useProductUrlContext()

  const [createSupplier, { loading }] = useMutation(addComSupplier, {
    onCompleted: () => recheck()
  })
  const [createRule, { loading: rlLoading }] = useMutation(AutomationRuleCreate)

  const { status, component } = activeRow || ''
  const { name, version, suppliers } = component || ''

  const { friendlyId, shortDesc } = activeRow?.organizationRule?.rule || ''
  const resolved = status === 'resolved'

  const initialData = useMemo(
    () => ({
      name: '',
      url: '',
      contactName: '',
      contactEmail: ''
    }),
    []
  )
  const [formData, setFormData] = useState(initialData)
  const [isValidUrl, setIsValidUrl] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  const containsSpace = /\s/.test(formData?.url)

  const handleSave = () => {
    createSupplier({
      variables: {
        url: formData?.url,
        name: formData?.name,
        componentId: component?.id,
        contactName: formData?.contactName,
        contactEmail: formData?.contactEmail
      }
    }).finally(() => onClose())
  }

  const handleCheckUrl = () => {
    if (!validateUrl(formData?.url)) {
      setIsValidUrl('Please enter a valid URL')
    }
  }

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
      value: formData?.name || undefined
    },
    {
      subject: 'component',
      field: 'component_supplier_url',
      value: formData?.url || undefined
    },
    {
      subject: 'component',
      field: 'component_supplier_contact_name',
      value: formData?.contactName || undefined
    },
    {
      subject: 'component',
      field: 'component_supplier_contact_email',
      value: formData?.contactEmail || undefined
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
          component?.suppliers?.length > 0 ? onClose() : handleSave()
        }
      })
    }
  }

  const isInvalid = formData?.url !== '' && !validateUrl(formData?.url)

  useEffect(() => {
    if (component?.suppliers?.length > 0) {
      setFormData(() => ({
        name: component?.suppliers[0]?.name,
        url: component?.suppliers[0]?.url,
        contactName: component?.suppliers[0]?.contactName,
        contactEmail: component?.suppliers[0]?.contactEmail
      }))
    } else {
      setFormData(initialData)
    }
  }, [component, initialData])

  return (
    <>
      <LynkModal
        Icon={BiCube}
        isOpen={isOpen}
        hidden={resolved}
        onClose={onClose}
        onSubmit={handleSave}
        title={`Add Supplier`}
        disabled={isInvalid || loading}
        buttonText={suppliers?.length > 0 ? 'Update' : 'Save'}
        leftFooterContent={
          !isFreeTier && (
            <Button
              mr={'auto'}
              fontSize={'sm'}
              variant='ghost'
              onClick={handleRuleCreate}
              isLoading={rlLoading || loading}
              hidden={friendlyId ? false : true}
              isDisabled={isInvalid || formData?.name === ''}
              colorScheme={ruleExists ? 'green' : 'blue'}
            >
              {ruleExists ? 'View' : 'Save as'} Rule
            </Button>
          )
        }
      >
        <Flex mb={6} gap={2} width='100%' alignItems={'center'}>
          <Text wordBreak={'break-word'}>{component?.name || '-'}</Text>
          <Tag colorScheme='blue'>{component?.version || '-'}</Tag>
        </Flex>
        <Flex width={'100%'} direction={'column'} gap={4}>
          {/* ORG NAME */}
          <FormControl isRequired isDisabled={resolved}>
            <FormLabel fontSize={12}>Organization Name</FormLabel>
            <Input
              name='name'
              autoComplete='off'
              value={formData?.name}
              onChange={handleChange}
              placeholder='Enter organization name'
            />
          </FormControl>
          {/* ORG URL */}
          <FormControl
            isDisabled={resolved}
            isInvalid={isInvalid || containsSpace}
          >
            <FormLabel fontSize={12}>URL</FormLabel>
            <Input
              name='url'
              autoComplete='off'
              value={formData?.url}
              onChange={handleChange}
              placeholder='Enter URL'
              onBlur={handleCheckUrl}
            />
            <FormErrorMessage>{isValidUrl}</FormErrorMessage>
          </FormControl>
          {/* SUPPLIER NAME */}
          <FormControl isDisabled={resolved}>
            <FormLabel fontSize={12}>Contact Name</FormLabel>
            <Input
              minLength={4}
              maxLength={256}
              autoComplete='no'
              name='contactName'
              onChange={handleChange}
              value={formData?.contactName}
              placeholder='Enter supplier name'
            />
          </FormControl>
          {/* SUPPLIER EMAIL */}
          <FormControl isDisabled={resolved}>
            <FormLabel fontSize={12}>Contact Email</FormLabel>
            <Input
              type='email'
              autoComplete='off'
              name='contactEmail'
              onChange={handleChange}
              value={formData?.contactEmail}
              placeholder='Enter supplier email'
            />
          </FormControl>
        </Flex>
      </LynkModal>
    </>
  )
}

export default SupplierModal
