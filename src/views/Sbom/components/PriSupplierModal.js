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

  const { status, sbom } = activeRow || ''
  const { suppliers } = sbom || ''
  const { friendlyId, shortDesc } = activeRow?.organizationRule?.rule || ''
  const resolved = status === 'resolved'

  const [orgName, setOrgName] = useState('')
  const [orgUrl, setOrgUrl] = useState('')
  const [isValidUrl, setIsValidUrl] = useState('')
  const [supName, setSupName] = useState('')
  const [supEmail, setSupEmail] = useState('')
  const [emailError, setEmailError] = useState('')
  const [supplierError, setSupplierError] = useState('')
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
      setSupplierError('Input must be between 4 and 256 characters')
    } else {
      setSupplierError('')
    }
  }

  const handleCheckUrl = () => {
    if (!validateUrl(orgUrl)) {
      setIsValidUrl('Please enter a valid URL')
    }
  }

  const handleCheckEmail = () => {
    if (!validateEmail(supEmail)) {
      setEmailError('Email is invalid')
    }
  }

  const onUrlChange = (e) => {
    const { value } = e.target
    setOrgUrl(value)
    setIsValidUrl('')
  }

  const isInvalid = orgUrl !== '' && !validateUrl(orgUrl)

  const [createSupplier] = useMutation(supplierCreate, {
    onCompleted: () => recheck()
  })
  const [updateSupplier] = useMutation(supplierUpdate, {
    onCompleted: () => recheck()
  })

  useEffect(() => {
    if (suppliers && suppliers.length > 0) {
      setOrgName(suppliers[0].name || '')
      setOrgUrl(suppliers[0].url || '')
      setSupName(suppliers[0].contactName || '')
      setSupEmail(suppliers[0].contactEmail || '')
    }
  }, [suppliers])

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
          sbomId: sbomId
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
        name: orgName,
        url: orgUrl,
        contactName: supName,
        contactEmail: supEmail,
        id: suppliers[0].id
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

  const [createRule] = useMutation(AutomationRuleCreate)

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
      value: orgName || undefined
    },
    {
      subject: 'version',
      field: 'version_supplier_url',
      value: orgUrl || undefined
    },
    {
      subject: 'version',
      field: 'version_supplier_contact_name',
      value: supName || undefined
    },
    {
      subject: 'version',
      field: 'version_supplier_contact_email',
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
    if (sbom?.suppliers?.length > 0) {
      const { suppliers } = sbom
      setOrgName(suppliers[0]?.name)
      setOrgUrl(suppliers[0]?.url)
      setSupName(suppliers[0]?.contactName)
      setSupEmail(suppliers[0]?.contactEmail)
    }
  }, [sbom])

  return (
    <>
      <LynkModal
        isOpen={isOpen}
        onClose={onClose}
        hidden={resolved}
        title={`Add ${friendlyId ? 'SBOM' : ''} Supplier`}
        buttonText={suppliers?.length > 0 ? 'Update' : 'Save'}
        disabled={isInvalid || isDisabled}
        onSubmit={suppliers?.length > 0 ? handleUpdate : handleSave}
        Icon={BiShieldPlus}
        leftFooterContent={
          !isFreeTier && (
            <Button
              fontSize={'sm'}
              variant='ghost'
              mr={'auto'}
              isDisabled={isInvalid || isDisabled}
              onClick={handleRuleCreate}
              hidden={friendlyId ? false : true}
              colorScheme={ruleExists ? 'green' : 'blue'}
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
              value={orgName}
              autoComplete='off'
              placeholder='Enter organization name'
              onChange={(e) => setOrgName(e.target.value)}
            />
          </FormControl>
          {/* ORG URL */}
          <FormControl
            isDisabled={resolved}
            isInvalid={(orgUrl !== '' && !validateUrl(orgUrl)) || containsSpace}
          >
            <FormLabel fontSize={'sm'}>URL</FormLabel>
            <Input
              value={orgUrl}
              autoComplete='off'
              onChange={onUrlChange}
              placeholder='Enter URL'
              onBlur={handleCheckUrl}
            />
            <FormErrorMessage>{isValidUrl}</FormErrorMessage>
          </FormControl>
          {/* SUPPLIER NAME */}
          <FormControl isInvalid={supplierError} isDisabled={resolved}>
            <FormLabel fontSize={'sm'}>Contact Name</FormLabel>
            <Input
              value={supName}
              autoComplete='no'
              onChange={onSupplierChange}
              placeholder='Enter supplier name'
            />
            <FormErrorMessage>{supplierError}</FormErrorMessage>
          </FormControl>
          {/* SUPPLIER EMAIL */}
          <FormControl
            isDisabled={resolved}
            isInvalid={supEmail !== '' && !validateEmail(supEmail)}
          >
            <FormLabel fontSize={'sm'}>Contact Email</FormLabel>
            <Input
              type='email'
              value={supEmail}
              autoComplete='off'
              onBlur={handleCheckEmail}
              placeholder='Enter supplier email'
              onChange={(e) => {
                setSupEmail(e.target.value)
                setEmailError('')
              }}
            />
            <FormErrorMessage>{emailError}</FormErrorMessage>
          </FormControl>
        </Flex>
      </LynkModal>
    </>
  )
}

export default PriSupplierModal
