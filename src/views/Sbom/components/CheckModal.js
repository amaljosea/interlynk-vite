import { useLazyQuery, useMutation } from '@apollo/client'
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
  Stack,
  Tag,
  Text,
  Tooltip
} from '@chakra-ui/react'
import LicenseField from 'components/Licenses/LicenseField'
import { GetComponentData } from 'graphQL/Queries'
import {
  UpdateComponent,
  recheckHealth,
  CreateAutomation
} from 'graphQL/Mutation'
import { useEffect, useState, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { useGlobalState } from 'hooks/useGlobalState'

const CheckModal = ({
  activeCheck,
  isOpen,
  onClose,
  refetch,
  shortDesc,
  checkId,
  filterRefetch,
  componentId
}) => {
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const productId = queryParams.get('id')
  const sbomId = queryParams.get('sbom')

  const compRef = useRef()

  // GET COMPONENT DATA
  const [getCompData, { data }] = useLazyQuery(GetComponentData, {
    fetchPolicy: 'network-only'
  })

  const { setActiveSbomTab, prodCompState, dispatch } = useGlobalState()
  const {
    field,
    direction,
    spdxLicenses,
    expLicense,
    customLicenses,
    totalComp,
    licenseType
  } = prodCompState
  const { prodCheckDispatch } = dispatch

  const now = new Date()
  const currentTime = now.toISOString().slice(0, 16)
  const [timestamp, setTimestamp] = useState(currentTime)
  const [comp, setComp] = useState('')
  const [compType, setCompType] = useState('')
  const [componentList, setComponentList] = useState([])
  const [activeComp, setActiveComp] = useState(null)
  const [isValid, setIsValid] = useState(true)
  const [error, setError] = useState('')

  const [healthRecheck] = useMutation(recheckHealth, {
    onCompleted: () => refetch()
  })

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
  }, [isOpen])

  const onFilterRefetch = () => {
    filterRefetch({
      projectId: productId,
      sbomId: sbomId
    }).then((res) =>
      prodCheckDispatch({
        type: 'ADD_FILTER_HEADS',
        payload: res.data.sbom.filters
      })
    )
  }

  const handleComUpdate = async () => {
    try {
      await updateComponent({
        variables: {
          id: activeComp.id,
          sbomId: sbomId,
          primary: true
        }
      })
        .then((res) => {
          if (res.data) {
            refetch({
              projectId: productId,
              sbomId: sbomId
            })
            localStorage.setItem(
              'currentSBOM',
              JSON.stringify({
                version: activeComp?.version,
                id: sbomId
              })
            )
            onFilterRefetch()
            if (checkId) {
              healthRecheck({
                variables: {
                  checkId: checkId,
                  sbomId: sbomId
                }
              })
            }
          }
        })
        .finally(() => {
          setActiveSbomTab(0)
          onClose()
        })
    } catch (error) {
      console.log('Mutation error', error)
    }
  }

  const onLicenseUpdate = async () => {
    try {
      await updateComponent({
        variables: {
          id: componentId,
          sbomId: sbomId,
          licenses: {
            licensesExp: expLicense || '',
          }
        }
      })
        .then((res) => {
          if (res.data) {
            onFilterRefetch()
          }
          if (checkId) {
            prodCheckDispatch({ type: 'FETCH_DATA_SUCCESS' })
            healthRecheck({
              variables: {
                compId: componentId,
                checkId: checkId,
                sbomId: sbomId
              }
            })
          }
        })
        .finally(() => onClose())
    } catch (error) {
      console.log('Mutation error', error)
    }
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

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!isInvalidLicense) {
      if (shortDesc === 'Document has a primary component') {
        handleComUpdate()
      } else if (
        shortDesc === 'Component has license/s specified' ||
        shortDesc === 'Componet has deprecated license/s' ||
        shortDesc === 'Component has restrictive licenses specified'
      ) {
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

  const [createAutoCheck] = useMutation(CreateAutomation)

  const isInvalidLicense =
    (shortDesc === 'Component has license/s specified' ||
      shortDesc === 'Componet has deprecated license/s' ||
      shortDesc === 'Component has restrictive licenses specified') &&
    spdxLicenses.length === 0 &&
    expLicense === '' &&
    customLicenses.length === 0

  const onSaveRule = async () => {
    if (activeComp) {
      await createAutoCheck({
        variables: {
          projectId: productId,
          applicable: 'component',
          condition: 'missing',
          attr: 'primary',
          enabled: true,
          compName: activeComp.name,
          compVersion: activeComp.version,
          set: JSON.stringify({ value: true }, null, 2)
        }
      }).then((res) => res.data && handleComUpdate())
    } else {
      await createAutoCheck({
        variables: {
          projectId: productId,
          applicable: 'component',
          condition: 'missing',
          attr: licenseType,
          enabled: true,
          compName: activeCheck?.component?.name,
          compVersion: activeCheck?.component?.version,
          set: JSON.stringify(
            {
              value: expLicense
            },
            null,
            2
          )
        }
      }).then((res) => res.data && onLicenseUpdate())
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
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

            {activeCheck && (
              <Flex
                width='100%'
                direction={'row'}
                alignItems={'center'}
                justifyContent={'flex-start'}
                wrap={'wrap'}
                gap={2}
                mb={6}
              >
                <Text fontWeight={'medium'} wordBreak={'break-all'}>
                  {activeCheck?.component?.name}
                </Text>
                <Tag colorScheme='blue'>{activeCheck?.component?.version}</Tag>
              </Flex>
            )}
            {shortDesc === 'Document has a primary component' && (
              <Flex
                flexDirection={'column'}
                alignItems={'flex-start'}
                gap={4}
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
              <LicenseField isValid={isValid} setIsValid={setIsValid} />
            )}
          </ModalBody>

          <ModalFooter>
            <Flex
              width={'100%'}
              justifyContent={'space-between'}
              alignItems={'center'}
            >
              <Button fontSize={'sm'} colorScheme='blue' onClick={onSaveRule}>
                Save Rule
              </Button>
              <Stack direction={'row'} spacing={2} alignItems={'center'}>
                <Button fontSize={'sm'} onClick={onClose}>
                  Close
                </Button>
                <Button fontSize={'sm'} colorScheme='blue' type='submit'>
                  Save
                </Button>
              </Stack>
            </Flex>
          </ModalFooter>
        </ModalContent>
      </form>
    </Modal>
  )
}

export default CheckModal
