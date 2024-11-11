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
  Input
} from '@chakra-ui/react'

import LynkModal from 'components/LynkModal'

import useCustomToast from 'hooks/useCustomToast'
import { useGlobalQueryContext } from 'hooks/useGlobalQueryContext'
import { useProductUrlContext } from 'hooks/useProductUrlContext'

import { supplierCreate, supplierUpdate } from 'graphQL/Mutation'
import { AutomationRuleCreate } from 'graphQL/Mutation'

import { BiShieldPlus } from 'react-icons/bi'

const PriSupplierModal = (props) => {
  const { isOpen, onClose, activeRow, ruleExists, recheck } = props

  const params = useParams()
  const sbomId = params.sbomid
  const productId = params.productid
  const navigate = useNavigate()
  const { showToast } = useCustomToast()
  const { isFreeTier } = useGlobalQueryContext()
  const { generateProductDetailPageUrlFromCurrentUrl } = useProductUrlContext()

  const { status } = activeRow || ''
  const resolved = status === 'resolved'
  const { friendlyId, shortDesc } = activeRow?.organizationRule?.rule || ''

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

  const data = activeRow?.sbom ? activeRow?.sbom?.suppliers : activeRow

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  const containsSpace = /\s/.test(formData?.url)

  const handleCheckUrl = () => {
    if (!validateUrl(formData?.url)) {
      setIsValidUrl('Please enter a valid URL')
    }
  }

  const isInvalid = formData?.url !== '' && !validateUrl(formData?.url)

  const [createSupplier, { loading: crLoading }] = useMutation(supplierCreate, {
    onCompleted: () => (friendlyId ? recheck() : null)
  })
  const [updateSupplier, { loading: upLoading }] = useMutation(supplierUpdate, {
    onCompleted: () => (friendlyId ? recheck() : null)
  })

  const [createRule, { loading: rlLoading }] = useMutation(AutomationRuleCreate)

  const handleSave = () => {
    if (resolved) {
      onClose()
    } else {
      createSupplier({
        variables: {
          sbomId: sbomId,
          url: formData?.url,
          name: formData?.name,
          contactName: formData?.contactName,
          contactEmail: formData?.contactEmail
        }
      }).then((res) => {
        if (res?.data) {
          showToast({
            description: 'Supplier added successfully',
            status: 'success'
          })
          onClose()
        }
      })
    }
  }

  const handleUpdate = () => {
    updateSupplier({
      variables: {
        url: formData?.url,
        name: formData?.name,
        contactName: formData?.contactName,
        contactEmail: formData?.contactEmail,
        id: data?.length > 0 && data[0].id
      }
    }).then((res) => {
      if (res?.data) {
        showToast({
          description: 'Supplier updated successfully',
          status: 'success'
        })
        onClose()
      }
    })
  }

  const conditionsAttributes = [
    {
      subject: 'version',
      operator: 'not_exists',
      field: 'version_supplier_name',
      value: undefined
    },
    {
      subject: 'version',
      operator: 'not_exists',
      field: 'version_supplier_url',
      value: undefined
    },
    {
      subject: 'version',
      operator: 'not_exists',
      field: 'version_supplier_contact_name',
      value: undefined
    },
    {
      subject: 'version',
      operator: 'not_exists',
      field: 'version_supplier_contact_email',
      value: undefined
    }
  ]

  const actionsAttributes = [
    {
      subject: 'version',
      field: 'version_supplier_name',
      value: formData?.name || undefined
    },
    {
      subject: 'version',
      field: 'version_supplier_url',
      value: formData?.url || undefined
    },
    {
      subject: 'version',
      field: 'version_supplier_contact_name',
      value: formData?.contactName || undefined
    },
    {
      subject: 'version',
      field: 'version_supplier_contact_email',
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

  useEffect(() => {
    if (data?.length > 0) {
      setFormData(() => ({
        name: data[0]?.name,
        url: data[0]?.url,
        contactName: data[0]?.contactName,
        contactEmail: data[0]?.contactEmail
      }))
    } else {
      setFormData(initialData)
    }
  }, [data, initialData])

  return (
    <>
      <LynkModal
        isOpen={isOpen}
        onClose={onClose}
        hidden={resolved}
        Icon={BiShieldPlus}
        disabled={isInvalid || crLoading || upLoading}
        title={`Add ${friendlyId ? 'SBOM' : ''} Supplier`}
        buttonText={data?.length > 0 > 0 ? 'Update' : 'Save'}
        onSubmit={data?.length > 0 ? handleUpdate : handleSave}
        leftFooterContent={
          !isFreeTier && (
            <Button
              mr={'auto'}
              fontSize={'sm'}
              variant='ghost'
              isLoading={rlLoading}
              onClick={handleRuleCreate}
              hidden={friendlyId ? false : true}
              colorScheme={ruleExists ? 'green' : 'blue'}
              isDisabled={
                isInvalid || crLoading || upLoading || !formData?.name
              }
            >
              {ruleExists ? 'View' : 'Save as'} Rule
            </Button>
          )
        }
      >
        <Flex width={'100%'} direction={'column'} gap={4}>
          {/* ORG NAME */}
          <FormControl isRequired isDisabled={resolved}>
            <FormLabel fontSize={'sm'}>Organization Name</FormLabel>
            <Input
              name='name'
              autoComplete='off'
              onChange={handleChange}
              value={formData?.name}
              placeholder='Enter organization name'
            />
          </FormControl>
          {/* ORG URL */}
          <FormControl
            isDisabled={resolved}
            isInvalid={isInvalid || containsSpace}
          >
            <FormLabel fontSize={'sm'}>URL</FormLabel>
            <Input
              name='url'
              autoComplete='off'
              onChange={handleChange}
              placeholder='Enter URL'
              onBlur={handleCheckUrl}
              value={formData?.url}
            />
            <FormErrorMessage>{isValidUrl}</FormErrorMessage>
          </FormControl>
          {/* SUPPLIER NAME */}
          <FormControl isDisabled={resolved}>
            <FormLabel fontSize={'sm'}>Contact Name</FormLabel>
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
            <FormLabel fontSize={'sm'}>Contact Email</FormLabel>
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

export default PriSupplierModal
