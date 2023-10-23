import { useMutation } from '@apollo/client'
import { QuestionIcon } from '@chakra-ui/icons'
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
  Text,
  Tooltip
} from '@chakra-ui/react'
import { UpdateComponent, recheckHealth } from 'graphQL/Mutation'
import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import MultiSelect from 'react-select'
import { licenseOptions } from 'variables/licenses'

const CheckModal = ({
  isOpen,
  onClose,
  refetch,
  shortDesc,
  components,
  checkId,
  totalRows,
  filterRefetch
}) => {
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const productId = queryParams.get('p')
  const sbomId = queryParams.get('sbom')

  const now = new Date()
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  // const currentTime = `${hours}:${minutes}`
  const currentTime = now.toISOString().slice(0, 16)

  const [timestamp, setTimestamp] = useState(currentTime)
  const [comp, setComp] = useState('')
  const [compId, setCompId] = useState('')
  const [compType, setCompType] = useState('')
  const [licenseList, setLicenseList] = useState([])
  const [selectedLicenses, setSelectedLicenses] = useState([])
  const [componentData, setComponentData] = useState([])

  const [healthRecheck] = useMutation(recheckHealth, {
    onCompleted: () => {
      refetch({
        projectId: productId,
        sbomId: sbomId,
        first: totalRows,
        last: undefined,
        after: undefined,
        before: undefined,
        category: undefined,
        severity: undefined,
        status: undefined,
        field: 'UPDATED_AT',
        direction: 'DESC'
      })
    }
  })
  const [updateComponent] = useMutation(UpdateComponent)

  const handleComUpdate = async () => {
    try {
      await updateComponent({
        variables: {
          id: compId,
          sbomId: sbomId,
          primary: true
        }
      })
        .then(() => {
          healthRecheck({
            variables: {
              checkId: checkId ? checkId : undefined,
              sbomId: sbomId
            }
          })
          filterRefetch({
            projectId: productId,
            sbomId: sbomId
          })
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
      setComponentData([])
    } else if (components && components.length > 0) {
      setComponentData(components.filter((str) => str.name.startsWith(value)))
    }
  }

  const licenses = licenseOptions.map((option) => ({
    value: option.licenseId,
    label: option.name
  }))

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
    } else {
      onClose()
    }
  }

  const onLicenseChange = (selected) => {
    setLicenseList(selected)
    const selectedIds = selected.map((option) => option.value) // Extracting IDs
    setSelectedLicenses(selectedIds)
  }

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
                  <Text fontSize={'sm'} mt={2} color={'red.400'}>
                    {!components && 'No components found'}
                  </Text>
                </FormControl>

                {componentData && componentData.length > 0 && (
                  <Box
                    position='absolute'
                    zIndex='1'
                    width='100%'
                    top={12}
                    mt='8'
                    bg='white'
                    border='1px solid #ccc'
                    height={'300px'}
                    overflowY={'scroll'}
                  >
                    <List>
                      {componentData
                        .filter((item) => item.name.includes(comp))
                        .map((item, index) => (
                          <ListItem
                            key={index}
                            cursor='pointer'
                            onClick={() => {
                              setCompId(item.id)
                              setComp(item.name)
                              setComponentData([])
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
                      <Icon as={QuestionIcon} color={'blue.500'} />
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
                  <option value='operating_system'>Operating system</option>
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
              <FormControl>
                <FormLabel fontSize={'sm'}>
                  <Flex flexDirection={'row'} alignItems={'center'} gap={2.5}>
                    <Text>Licenses</Text>
                    <Tooltip label='List of licenses applicable to the component'>
                      <Icon as={QuestionIcon} color={'blue.500'} />
                    </Tooltip>
                  </Flex>
                </FormLabel>
                <MultiSelect
                  styles={{
                    control: (baseStyles, state) => ({
                      ...baseStyles,
                      borderColor: state.isFocused ? 'inherit' : 'inherit',
                      '&:hover': {
                        borderColor: '#CBD5E0'
                      }
                    })
                  }}
                  isMulti
                  value={licenseList}
                  options={licenses}
                  onChange={onLicenseChange}
                />
              </FormControl>
            )}
          </ModalBody>

          <ModalFooter>
            <Button fontSize={'sm'} mr={3} onClick={onClose}>
              Close
            </Button>
            {shortDesc === 'Primary Component' && (
              <Button fontSize={'sm'} colorScheme='green' mr={3} type='submit'>
                Save Rule
              </Button>
            )}
            <Button fontSize={'sm'} colorScheme='blue' type='submit'>
              Save
            </Button>
          </ModalFooter>
        </ModalContent>
      </form>
    </Modal>
  )
}

export default CheckModal
