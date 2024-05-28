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
  ModalOverlay,
  Tag,
  Text,
  useToast
} from '@chakra-ui/react'

import {
  addComSupplier,
  recheckHealth,
  updateComSupplier
} from 'graphQL/Mutation'
import { AutomationRuleCreate } from 'graphQL/Mutation'

const SupplierModal = ({ id, isOpen, onClose, refetch, data, activeRow }) => {
  const toast = useToast()
  const params = useParams()
  const navigate = useNavigate()
  const sbomId = params.sbomid
  const productId = params.productid

  const { status, component } = activeRow || ''
  const { friendlyId, shortDesc } = activeRow?.organizationRule?.rule || ''

  const [orgName, setOrgName] = useState('')
  const [orgUrl, setOrgUrl] = useState('')
  const [isValidUrl, setIsValidUrl] = useState('')
  const [supName, setSupName] = useState('')
  const [nameError, setNameError] = useState('')
  const [supEmail, setSupEmail] = useState('')
  const [emailError, setEmailError] = useState('')

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

  const [createSupplier] = useMutation(addComSupplier)
  const [updateSupplier] = useMutation(updateComSupplier)
  const [healthRecheck] = useMutation(recheckHealth)

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

  const handleSave = async () => {
    await createSupplier({
      variables: {
        name: orgName,
        url: orgUrl,
        contactName: supName,
        contactEmail: supEmail,
        componentId: component?.id || id
      }
    })
      .then((res) => {
        res?.data && refetch()
        if (friendlyId) {
          healthRecheck({
            variables: {
              sbomId: sbomId,
              checkId: friendlyId,
              compId: component?.id
            }
          })
        }
      })
      .finally(() => onClose())
  }

  const handleUpdate = async () => {
    await updateSupplier({
      variables: {
        name: orgName,
        url: orgUrl,
        contactName: supName,
        contactEmail: supEmail,
        id: data && data.suppliers && data.suppliers[0].id
      }
    })
      .then((res) => res.data && refetch())
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
      value: orgName
    },
    {
      subject: 'component',
      field: 'component_supplier_url',
      value: orgUrl
    },
    {
      subject: 'component',
      field: 'component_supplier_contact_name',
      value: supName
    },
    {
      subject: 'component',
      field: 'component_supplier_contact_email',
      value: supEmail
    }
  ]

  const handleRuleCreate = async () => {
    if (status === 'resolved') {
      localStorage.setItem('activeProdTab', 2)
      navigate(`/vendor/products/${params.productgroupid}/env/${productId}`)
    } else {
      await createRule({
        variables: {
          name: shortDesc,
          active: true,
          projectId: productId,
          automationConditionsAttributes: conditionsAttributes,
          automationActionsAttributes: actionsAttributes
        }
      }).then((res) => {
        const errors = res?.data?.automationRuleCreate?.errors
        if (errors?.length > 0) {
          console.log(errors[0])
        } else {
          toast({
            description: 'Rule added successfully',
            duration: 3000,
            status: 'success',
            position: 'top'
          })
          onClose()
        }
      })
    }
  }

  const isInvalid =
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
      <Modal isOpen={isOpen} onClose={onClose} motionPreset='slideInBottom'>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {data && data.suppliers?.length > 0 ? 'Edit' : 'Add'} Supplier
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
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
              <FormControl isRequired>
                <FormLabel fontSize={'sm'}>Organization Name</FormLabel>
                <Input
                  placeholder='Enter organization name'
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                />
              </FormControl>
              {/* ORG URL */}
              <FormControl
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
              <FormControl isInvalid={supName !== '' && nameError !== ''}>
                <FormLabel fontSize={'sm'}>Contact Name</FormLabel>
                <Input
                  placeholder='Enter supplier name'
                  value={supName}
                  onChange={onSupplierChange}
                />
                <FormErrorMessage>{nameError}</FormErrorMessage>
              </FormControl>
              {/* SUPPLIER EMAIL */}
              <FormControl
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
                hidden={friendlyId ? false : true}
                fontSize={'sm'}
                colorScheme='blue'
                mr={'auto'}
                onClick={handleRuleCreate}
                isDisabled={isInvalid}
              >
                {status === 'resolved' ? 'View Rule' : 'Save as Rule'}
              </Button>
              <Button colorScheme='gray' onClick={onClose}>
                Cancel
              </Button>
              <Button
                colorScheme='blue'
                isDisabled={isInvalid}
                hidden={status === 'resolved'}
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

export default SupplierModal
