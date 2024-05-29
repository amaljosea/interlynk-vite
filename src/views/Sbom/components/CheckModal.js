import { useLazyQuery, useMutation } from '@apollo/client'
import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'

import { InfoIcon } from '@chakra-ui/icons'
import {
  Alert,
  AlertDescription,
  AlertIcon,
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Icon,
  Input,
  List,
  ListItem,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  Tag,
  Text,
  Tooltip,
  useToast
} from '@chakra-ui/react'

import LicenseField from 'components/Licenses/LicenseField'

import { useGlobalState } from 'hooks/useGlobalState'

import {
  AutomationRuleCreate,
  UpdateComponent,
  recheckHealth
} from 'graphQL/Mutation'
import { GetComponentData } from 'graphQL/Queries'

const CheckModal = ({ isOpen, onClose, refetch, activeRow, componentId }) => {
  const toast = useToast()
  const params = useParams()
  const productId = params.productid
  const sbomId = params.sbomid

  const { status, component } = activeRow || ''
  const { friendlyId, shortDesc } = activeRow?.organizationRule?.rule || ''

  const compRef = useRef()

  // GET COMPONENT DATA
  const [getCompData, { data }] = useLazyQuery(GetComponentData, {
    fetchPolicy: 'network-only'
  })

  const [createRule] = useMutation(AutomationRuleCreate)

  const { prodCompState } = useGlobalState()
  const { field, direction, spdxLicenses, expLicense, customLicenses } =
    prodCompState

  const now = new Date()
  const currentTime = now.toISOString().slice(0, 16)
  const [timestamp, setTimestamp] = useState(currentTime)
  const [comp, setComp] = useState('')
  const [compType, setCompType] = useState('')
  const [componentList, setComponentList] = useState([])
  const [activeComp, setActiveComp] = useState(null)
  const [isValid, setIsValid] = useState(true)
  const [error, setError] = useState('')

  const [healthRecheck] = useMutation(recheckHealth)

  const [updateComponent] = useMutation(UpdateComponent)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (compRef.current && !compRef.current.contains(event.target)) {
        setComponentList([])
      }
    }

    document.addEventListener('click', handleClickOutside)

    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [])

  useEffect(() => {
    if (isOpen) {
      getCompData({
        variables: {
          projectId: productId,
          sbomId: sbomId,
          first: 100,
          field: field,
          direction: direction
        }
      }).then(
        (res) => res.data && setComponentList(res.data.sbom.components.nodes)
      )
    }
  }, [direction, field, getCompData, isOpen, productId, sbomId])

  const handleComUpdate = async () => {
    await updateComponent({
      variables: {
        id: activeComp.id,
        sbomId: sbomId,
        primary: true
      }
    })
      .then(() => {
        if (friendlyId) {
          healthRecheck({
            variables: {
              checkId: friendlyId,
              sbomId: sbomId
            }
          }).then((res) => res?.data && refetch())
        }
      })
      .finally(() => onClose())
  }

  const onLicenseUpdate = async () => {
    await updateComponent({
      variables: {
        id: componentId,
        sbomId: sbomId,
        licenses: {
          licensesExp: expLicense || ''
        }
      }
    })
      .then(() => {
        if (friendlyId) {
          healthRecheck({
            variables: {
              compId: componentId,
              checkId: friendlyId,
              sbomId: sbomId
            }
          }).then((res) => res?.data && refetch())
        }
      })
      .finally(() => onClose())
  }

  const handleComponentChange = (e) => {
    const value = e.target.value
    setComp(value)
    if (value === '') {
      setComponentList([])
    } else {
      const filterData = data?.sbom.components.nodes.filter((str) =>
        str.name.includes(value)
      )
      setComponentList(filterData ? filterData : [])
    }
  }

  const heading = (name) => {
    switch (name) {
      case 'Document creation timestamp':
        return 'Timestamp'
      case 'Document has a primary component':
        return 'Primary Component'
      case 'Component has a type':
        return 'Component Type'
      case 'Component has a valid type':
        return 'Component Type'
      case 'Component has license/s specified':
        return 'Component License'
      case 'Componet has deprecated license/s':
        return 'Component License'
      case 'Component has restrictive licenses specified':
        return 'Component License'
    }
  }

  const isPrimary = shortDesc === 'Document has a primary component'
  const isComponentLicense =
    shortDesc === 'Component has license/s specified' ||
    shortDesc === 'Componet has deprecated license/s' ||
    shortDesc === 'Component has restrictive licenses specified'

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!isInvalidLicense) {
      if (isPrimary) {
        handleComUpdate()
      } else if (isComponentLicense) {
        onLicenseUpdate()
      } else {
        onClose()
      }
    } else {
      setError('Please add value')
      setTimeout(() => {
        setError('')
      }, 2000)
    }
  }

  const getConditionsAttributes = () => {
    if (isComponentLicense) {
      return [
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
        }
      ]
    }
  }

  const getActionsAttributes = () => {
    if (isComponentLicense) {
      return [
        {
          subject: 'component',
          field: 'component_licenses_exp',
          value: expLicense
        }
      ]
    }
  }

  const handleRuleCreate = async () => {
    await createRule({
      variables: {
        name: shortDesc,
        active: true,
        projectId: productId,
        automationConditionsAttributes: getConditionsAttributes(),
        automationActionsAttributes: getActionsAttributes()
      }
    }).then((res) => {
      const errors = res?.data?.automationRuleCreate?.errors
      if (errors?.length > 0) {
        setError(errors[0])
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

  const isInvalidLicense =
    (shortDesc === 'Component has license/s specified' ||
      shortDesc === 'Componet has deprecated license/s' ||
      shortDesc === 'Component has restrictive licenses specified') &&
    spdxLicenses.length === 0 &&
    expLicense === '' &&
    customLicenses.length === 0

  return (
    <Modal isOpen={isOpen} onClose={onClose} motionPreset='slideInBottom'>
      <ModalOverlay />
      <form onSubmit={handleSubmit}>
        <ModalContent>
          <ModalHeader>{heading(shortDesc)}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {error !== '' && (
              <Alert status='error' borderRadius={4} mb={5}>
                <AlertIcon />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
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
              <Text fontWeight={'medium'} wordBreak={'break-all'}>
                {component?.name || '-'}
              </Text>
              <Tag colorScheme='blue'>{component?.version || '-'}</Tag>
            </Flex>
            {shortDesc === 'Document has a primary component' && (
              <Flex
                gap={4}
                flexDirection={'column'}
                alignItems={'flex-start'}
                position={'relative'}
              >
                <FormControl isRequired>
                  <FormLabel>Select</FormLabel>
                  <Input value={comp} onChange={handleComponentChange} />
                </FormControl>

                {comp !== '' && componentList.length > 0 && (
                  <Box
                    position='absolute'
                    zIndex='1'
                    width='100%'
                    top={10}
                    mt='8'
                    bg='white'
                    border='1px solid #ccc'
                    minH={'auto'}
                    maxH={'300px'}
                    overflowY={'scroll'}
                    borderRadius={4}
                    ref={compRef}
                  >
                    <List>
                      {componentList.map((item, index) => (
                        <ListItem
                          key={index}
                          cursor='pointer'
                          fontSize={'sm'}
                          onClick={() => {
                            setActiveComp(item)
                            setComp(item.name)
                            setComponentList([])
                          }}
                          p='2'
                          _hover={{ background: 'gray.100' }}
                        >
                          <Text>{item.name}</Text>
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}
              </Flex>
            )}

            {shortDesc === 'Document creation timestamp' && (
              <FormControl isRequired>
                <FormLabel>Created At</FormLabel>
                <Input
                  placeholder='Select Time'
                  size='md'
                  type='datetime-local'
                  value={timestamp}
                  onChange={(e) => console.log(e.target.value)}
                />
              </FormControl>
            )}

            {(shortDesc === 'Component has a type' ||
              shortDesc === 'Component has a valid type') && (
              <FormControl>
                <FormLabel fontSize={'sm'}>
                  <Flex flexDirection={'row'} alignItems={'center'} gap={2.5}>
                    <Text>Type</Text>
                    <Tooltip label='Component Type'>
                      <Icon as={InfoIcon} color={'blue.500'} />
                    </Tooltip>
                  </Flex>
                </FormLabel>
                <Select
                  id='type'
                  name='type'
                  size='sm'
                  value={compType}
                  onChange={(e) => setCompType(e.target.value)}
                >
                  <option value=''>-- Select --</option>
                  <option value='application'>Application</option>
                  <option value='library'>Library</option>
                  <option value='operating-system'>Operating System</option>
                  <option value='firmware'>Firmware</option>
                  <option value='file'>File</option>
                  <option value='device'>Device</option>
                  <option value='container'>Container</option>
                  <option value='framework'>Framework</option>
                  <option value='source'>Source</option>
                  <option value='archive'>Archive</option>
                  <option value='install'>Install</option>
                  <option value='other'>Other</option>
                  <option value='unspecified'>Unspecified</option>
                </Select>
              </FormControl>
            )}

            {(shortDesc === 'Component has license/s specified' ||
              shortDesc === 'Componet has deprecated license/s' ||
              shortDesc === 'Component has restrictive licenses specified') && (
              <LicenseField
                sbomView={false}
                isValid={isValid}
                setIsValid={setIsValid}
                license={status === 'resolved' ? component?.licensesExp : ''}
              />
            )}
          </ModalBody>

          <ModalFooter>
            <Flex
              gap={2}
              width={'100%'}
              justifyContent={'flex-end'}
              alignItems={'center'}
            >
              <Button
                fontSize={'sm'}
                colorScheme='blue'
                mr={'auto'}
                onClick={handleRuleCreate}
              >
                Save as Rule
              </Button>
              <Button fontSize={'sm'} onClick={onClose}>
                Close
              </Button>
              <Button
                fontSize={'sm'}
                colorScheme='blue'
                type='submit'
                hidden={status === 'resolved'}
              >
                Save
              </Button>
            </Flex>
          </ModalFooter>
        </ModalContent>
      </form>
    </Modal>
  )
}

export default CheckModal
