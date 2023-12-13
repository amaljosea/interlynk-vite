import { useLazyQuery, useMutation } from '@apollo/client'
import { InfoIcon } from '@chakra-ui/icons'
import {
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
  Text,
  Tooltip
} from '@chakra-ui/react'
import LicenseField from 'components/LicenseField'
import GlobalContext from 'context/GlobalContext'
import { GetComponentData } from 'graphQL/Queries'
import {
  UpdateComponent,
  recheckHealth,
  CreateAutomation
} from 'graphQL/Mutation'
import { useContext, useEffect, useState, useRef } from 'react'
import { useLocation } from 'react-router-dom'

const CheckModal = ({
  activeCheck,
  isOpen,
  onClose,
  refetch,
  shortDesc,
  checkId,
  filterRefetch,
  componentId,
  setPageIndex
}) => {
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const productId = queryParams.get('p')
  const sbomId = queryParams.get('sbom')

  const compRef = useRef()

  // GET COMPONENT DATA
  const [getCompData, { data }] = useLazyQuery(GetComponentData, {
    fetchPolicy: 'network-only'
  })

  const {
    licenseType,
    spdxLicense,
    licenseExp,
    setCheckFilters,
    setActiveProdTab,
    customLicense,
    compField,
    compDirection,
    setLicenseType
  } = useContext(GlobalContext)

  const now = new Date()
  const currentTime = now.toISOString().slice(0, 16)
  const [timestamp, setTimestamp] = useState(currentTime)
  const [comp, setComp] = useState('')
  const [compType, setCompType] = useState('')
  const [componentList, setComponentList] = useState([])
  const [activeComp, setActiveComp] = useState(null)

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
          field: compField,
          direction: compDirection
        }
      }).then(
        (res) => res.data && setComponentList(res.data.sbom.components.nodes)
      )
    }
  }, [])

  const onFilterRefetch = () => {
    filterRefetch({
      projectId: productId,
      sbomId: sbomId
    }).then((res) => setCheckFilters(res.data.sbom.filters))
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
          setActiveProdTab(0)
          window.location.reload()
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
            licenses: licenseType === 'license_spdx' ? spdxLicense : undefined,
            licensesExp: licenseType === 'license_exp' ? licenseExp : undefined,
            licensesCustom:
              licenseType === 'license_custom' ? customLicense : undefined
          }
        }
      })
        .then((res) => {
          if (res.data) {
            onFilterRefetch()
          }
          if (checkId) {
            setPageIndex(1)
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
      console.log('filterData', filterData)
      setComponentList(filterData)
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
  }

  const [createAutoCheck] = useMutation(CreateAutomation)

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
              value:
                licenseType === 'license_spdx'
                  ? spdxLicense
                  : licenseType === 'license_exp'
                  ? licenseExp
                  : licenseType === 'license_custom'
                  ? customLicense
                  : ''
            },
            null,
            2
          )
        }
      }).then((res) => res.data && onLicenseUpdate())
    }
  }

  const isInvalidLicense =
    (licenseType === 'license_spdx' && spdxLicense.length === 0) ||
    (licenseType === 'license_exp' && licenseExp === '') ||
    (licenseType === 'license_custom' && customLicense.length === 0)

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <form onSubmit={handleSubmit}>
        <ModalContent>
          <ModalHeader>{heading(shortDesc)}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
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
                    height={'300px'}
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
                            setLicenseType('')
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
              <LicenseField data={activeCheck.component} />
            )}
          </ModalBody>

          <ModalFooter>
            <Flex
              width={'100%'}
              justifyContent={'space-between'}
              alignItems={'center'}
            >
              <Button
                fontSize={'sm'}
                colorScheme='blue'
                onClick={onSaveRule}
                disabled={isInvalidLicense}
              >
                Save Rule
              </Button>
              <Stack direction={'row'} spacing={2} alignItems={'center'}>
                <Button fontSize={'sm'} onClick={onClose}>
                  Close
                </Button>
                <Button
                  fontSize={'sm'}
                  colorScheme='blue'
                  type='submit'
                  disabled={isInvalidLicense}
                >
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
