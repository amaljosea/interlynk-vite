import { useMutation } from '@apollo/client'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { validateEmail, validateUrl } from 'utils'

import {
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay
} from '@chakra-ui/react'

import { useProductUrlContext } from 'hooks/useProductUrlContext'

import { recheckHealth, supplierCreate, supplierUpdate } from 'graphQL/Mutation'
import { AutomationRuleCreate } from 'graphQL/Mutation'

const PriSupplierModal = ({
  isOpen,
  onClose,
  refetch,
  suppliers,
  activeRow,
  ruleExists
}) => {
  const params = useParams()
  const sbomId = params.sbomid
  const productId = params.productid
  const navigate = useNavigate()
  const { generateProductDetailPageUrlFromCurrentUrl } = useProductUrlContext()

  const { status, sbom } = activeRow || ''
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

  const isInvalid =
    orgName === '' ||
    supplierError !== '' ||
    (supEmail !== '' && !validateEmail(supEmail)) ||
    (orgUrl !== '' && !validateUrl(orgUrl))

  const [createSupplier] = useMutation(supplierCreate)
  const [updateSupplier] = useMutation(supplierUpdate)
  const [healthRecheck] = useMutation(recheckHealth)

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
    createSupplier({
      variables: {
        name: orgName,
        url: orgUrl,
        contactName: supName,
        contactEmail: supEmail,
        sbomId: sbomId
      }
    })
      .then((res) => {
        res?.data && refetch()
        if (friendlyId) {
          healthRecheck({
            variables: { sbomId: sbomId, checkId: friendlyId }
          })
        }
      })
      .finally(() => onClose())
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
    })
      .then((res) => res?.data && refetch())
      .finally(() => onClose())
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

  const handleRuleCreate = async () => {
    if (ruleExists) {
      localStorage.setItem('activeProdTab', 2)
      navigate(generateProductDetailPageUrlFromCurrentUrl())
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
    if (status === 'resolved' && sbom?.suppliers?.length > 0) {
      const { suppliers } = sbom
      setOrgName(suppliers[0]?.name)
      setOrgUrl(suppliers[0]?.url)
      setSupName(suppliers[0]?.contactName)
      setSupEmail(suppliers[0]?.contactEmail)
    }
  }, [sbom, status])

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add {friendlyId ? 'SBOM' : ''} Supplier</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Flex width={'100%'} direction={'column'} gap={4}>
              {/* ORG NAME */}
              <FormControl isRequired isDisabled={resolved}>
                <FormLabel fontSize={'sm'}>Organization Name</FormLabel>
                <Input
                  placeholder='Enter organization name'
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                />
              </FormControl>
              {/* ORG URL */}
              <FormControl
                isDisabled={resolved}
                isInvalid={
                  (orgUrl !== '' && !validateUrl(orgUrl)) || containsSpace
                }
              >
                <FormLabel fontSize={'sm'}>URL</FormLabel>
                <Input
                  placeholder='Enter URL'
                  value={orgUrl}
                  onBlur={handleCheckUrl}
                  onChange={onUrlChange}
                />
                <FormErrorMessage>{isValidUrl}</FormErrorMessage>
              </FormControl>
              {/* SUPPLIER NAME */}
              <FormControl isInvalid={supplierError} isDisabled={resolved}>
                <FormLabel fontSize={'sm'}>Contact Name</FormLabel>
                <Input
                  placeholder='Enter supplier name'
                  value={supName}
                  onChange={onSupplierChange}
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
                  placeholder='Enter supplier email'
                  value={supEmail}
                  onBlur={handleCheckEmail}
                  onChange={(e) => {
                    setSupEmail(e.target.value)
                    setEmailError('')
                  }}
                />
                <FormErrorMessage>{emailError}</FormErrorMessage>
              </FormControl>
            </Flex>
          </ModalBody>
          <ModalFooter>
            <Flex
              gap={2}
              width={'100%'}
              justifyContent={'flex-end'}
              alignItems={'center'}
            >
              <Button
                mr={'auto'}
                fontSize={'sm'}
                isDisabled={isInvalid || isDisabled}
                onClick={handleRuleCreate}
                hidden={friendlyId ? false : true}
                colorScheme={ruleExists ? 'green' : 'blue'}
              >
                {ruleExists ? 'View' : 'Save as'} Rule
              </Button>
              <Button colorScheme='gray' mr={3} onClick={onClose}>
                Cancel
              </Button>
              <Button
                colorScheme='blue'
                isDisabled={isInvalid || isDisabled}
                hidden={resolved}
                onClick={suppliers?.length > 0 ? handleUpdate : handleSave}
              >
                {suppliers?.length > 0 ? 'Update' : 'Save'}
              </Button>
            </Flex>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

export default PriSupplierModal
