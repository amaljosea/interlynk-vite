import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Select,
  Flex,
  Input,
  Stack,
  ListItem,
  Textarea,
  List,
  Text,
  Box
} from '@chakra-ui/react'
import { useState, useEffect, useRef, useContext } from 'react'
import { PackageURL } from 'packageurl-js'
import { useLocation } from 'react-router-dom'
import { UpdateComponent, recheckHealth } from 'graphQL/Mutation'
import { useMutation } from '@apollo/client'
import CpeInput from 'components/CpeInput'
import GlobalContext from 'context/GlobalContext'
import { CreateAutomation } from 'graphQL/Mutation'

const typeOptions = [
  { value: 'alpm', label: 'alpm' },
  { value: 'apk', label: 'apk' },
  { value: 'bitbucket', label: 'bitbucket' },
  { value: 'bitnami', label: 'bitnami' },
  { value: 'cocoapods', label: 'cocoapods' },
  { value: 'cargo', label: 'cargo' },
  { value: 'composer', label: 'composer' },
  { value: 'conan', label: 'conan' },
  { value: 'conda', label: 'conda' },
  { value: 'cran', label: 'cran' },
  { value: 'deb', label: 'deb' },
  { value: 'docker', label: 'docker' },
  { value: 'gem', label: 'gem' },
  { value: 'generic', label: 'generic' },
  { value: 'github', label: 'github' },
  { value: 'golang', label: 'golang' },
  { value: 'hex', label: 'hex' },
  { value: 'huggingface', label: 'huggingface' },
  { value: 'maven', label: 'maven' },
  { value: 'mlflow', label: 'mlflow' },
  { value: 'npm', label: 'npm' },
  { value: 'nuget', label: 'nuget' },
  { value: 'qpkg', label: 'qpkg' },
  { value: 'oci', label: 'oci' },
  { value: 'pub', label: 'pub' },
  { value: 'pypi', label: 'pypi' },
  { value: 'rpm', label: 'rpm' },
  { value: 'swid', label: 'swid' },
  { value: 'swift', label: 'swift' }
]

const namespaceOptions = {
  alpm: [
    { value: '', label: '-- Select --' },
    { value: 'arch', label: 'arch' },
    { value: 'arch32', label: 'arch32' },
    { value: 'archarm', label: 'archarm' },
    { value: 'manjaro', label: 'manjaro' },
    { value: 'msys', label: 'msys' }
  ],
  apk: [
    { value: '', label: '-- Select --' },
    { value: 'alpine', label: 'alpine' },
    { value: 'openwrt', label: 'openwrt' }
  ],
  bitnami: [],
  cocoapods: [],
  cargo: [],
  conda: [],
  cran: [],
  deb: [
    { value: '', label: '-- Select --' },
    { value: 'debian', label: 'debian' },
    { value: 'ubuntu', label: 'ubuntu' }
  ],
  gem: [],
  generic: [],
  hackage: [],
  mflow: [],
  nuget: [],
  oci: [],
  pub: [],
  pypi: []
}

const PurlModal = ({
  data,
  isOpen,
  onClose,
  purlValue,
  setPurlValue,
  refetch,
  checkId,
  getCpe,
  activeCheck,
  component,
  version,
  group,
  purl
}) => {
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const sbomId = queryParams.get('sbom')
  const productId = queryParams.get('p')

  const [purlType, setPurlType] = useState('')
  const [namespace, setNamespace] = useState('')
  const [namespaceList, setNamespaceList] = useState([])
  const namespaceRef = useRef()
  const [purlName, setPurlName] = useState('')
  const [purlNameList, setPurlNameList] = useState([])
  const packageNameRef = useRef()
  const [purlVersion, setPurlVersion] = useState('')
  const [purlVersionList, setPurlVersionList] = useState([])
  const purlVersionRef = useRef()

  const [suggestions, setSuggestions] = useState([])
  const [verSuggestions, setVerSuggestions] = useState([])

  const [updatedString, setUpdatedString] = useState(purlValue)

  const { purlString, setPurlString } = useContext(GlobalContext)

  const [healthRecheck] = useMutation(recheckHealth, {
    onCompleted: () => refetch()
  })
  const [updateComponent] = useMutation(UpdateComponent)

  const handleComUpdate = async () => {
    try {
      await updateComponent({
        variables: {
          id: activeCheck.id,
          sbomId: sbomId,
          purl: purlString
        }
      })
        .then(() => {
          if (checkId) {
            healthRecheck({
              variables: {
                checkId: checkId,
                compId: activeCheck.id,
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

  // ON NAMESPACE INPUT CHANGE
  const onNamespaceInputChange = (event) => {
    const { value } = event.target
    setNamespace(value)
    getCpe({
      variables: {
        input: {
          idType: 'purl',
          ecosystem: 'maven',
          search: {
            namespace: value
          },
          hints: {
            purl: {
              name: purlName ? purlName : '',
              version: purlVersion ? purlVersion : ''
            }
          }
        }
      }
    }).then((res) => {
      if (res.data) {
        setNamespaceList(res.data.idAutoComplete.result)
      }
    })
  }

  // ON PACKAGE NAME INPUT CHANGE
  const onNameInputChange = (event) => {
    const { value } = event.target
    setPurlName(value)
    if (purlType === 'maven') {
      getCpe({
        variables: {
          input: {
            idType: 'purl',
            ecosystem: 'maven',
            search: {
              name: value
            },
            hints: {
              purl: {
                namespace: namespace ? namespace : '',
                version: purlVersion ? purlVersion : ''
              }
            }
          }
        }
      }).then((res) => {
        if (res.data) {
          setPurlNameList(res.data.idAutoComplete.result)
        }
      })
    } else if (purlType === 'nuget') {
      getCpe({
        variables: {
          input: {
            idType: 'purl',
            ecosystem: 'nuget',
            search: {
              name: value
            },
            hints: {
              purl: {
                version: purlVersion ? purlVersion : ''
              }
            }
          }
        }
      }).then((res) => {
        if (res.data) {
          setPurlNameList(res.data.idAutoComplete.result)
        }
      })
    }
  }

  // ON VERSION INPUT CHANGE
  const onVersionInputChange = (event) => {
    const { value } = event.target
    setPurlVersion(value)
    if (purlType === 'maven') {
      getCpe({
        variables: {
          input: {
            idType: 'purl',
            ecosystem: 'maven',
            search: {
              version: purlVersion
            },
            hints: {
              purl: {
                namespace: namespace ? namespace : '',
                name: purlName ? purlName : ''
              }
            }
          }
        }
      }).then((res) => {
        if (res.data.idAutoComplete.result !== null) {
          setPurlVersionList(res.data.idAutoComplete.result)
        }
      })
    } else if (purlType === 'nuget') {
      getCpe({
        variables: {
          input: {
            idType: 'purl',
            ecosystem: 'nuget',
            search: {
              version: value
            },
            hints: {
              purl: {
                name: purlName ? purlName : ''
              }
            }
          }
        }
      }).then((res) => {
        if (res.data.idAutoComplete.result !== null) {
          setPurlVersionList(res.data.idAutoComplete.result)
        }
      })
    }
  }

  // console.log('data', data)

  useEffect(() => {
    if (purlValue) {
      setPurlString(purlValue)
    }
  }, [purlValue])

  useEffect(() => {
    if (data) {
      setPurlType(data.type === null ? '' : data.type)
      setNamespace(data.namespace === null ? '' : data.namespace)
      setPurlName(data.name === null ? '' : data.name)
      setPurlVersion(data.version === null ? '' : data.version)
    }
  }, [data])

  const handleTypeChange = (e) => {
    setPurlType(e.target.value)
    const pkg = PackageURL.fromString(purlString)
    pkg.type = e.target.value
    pkg.namespace = ''
    setPurlString(pkg.toString())
  }

  const handleNamespaceChange = (e) => {
    setNamespace(e.target.value)
    const pkg = PackageURL.fromString(purlString)
    pkg.namespace = e.target.value
    setUpdatedString(pkg.toString())
  }

  const handleNameChange = (e) => {
    setPurlName(e.target.value)
    if (e.target.value === '') {
      setSuggestions([])
      return
    } else {
      const pkg = PackageURL.fromString(purlString)
      pkg.name = e.target.value
      setPurlString(pkg.toString())
    }

    if (purlType === 'nuget') {
      // Fetch autocomplete suggestions from NuGet.org API
      fetch(
        `https://azuresearch-ussc.nuget.org/autocomplete?q=${e.target.value}&take=10`
      )
        .then((response) => response.json())
        .then((data) => {
          // console.log('Nuget suggestions:', data.data)
          setSuggestions(data.data) // Set the autocomplete suggestions
        })
        .catch((error) => {
          console.error('Error fetching suggestions:', error)
        })
    }

    if (purlType === 'npm') {
      fetch(`https://registry.npmjs.org/-/v1/search?text=${e.target.value}`)
        .then((response) => response.json())
        .then((data) => {
          // console.log('NPM suggestions:', data)
          const packages =
            data.objects.length > 0 &&
            data.objects.map((item) => item.package.name)
          setSuggestions(packages) // Set the autocomplete suggestions
        })
        .catch((error) => {
          console.error('Error fetching suggestions:', error)
        })
    }
  }

  const handleNameBlur = () => {
    setSuggestions([])
  }

  const fetchVersions = async () => {
    if (purlType === 'nuget') {
      const endpoint = `https://azuresearch-ussc.nuget.org/autocomplete?id=${purlName}&prerelease=false`
      const res = await fetch(endpoint)
      const data = await res.json()
      setVerSuggestions(data.data)
    }

    if (purlType === 'npm') {
      const endpoint = `https://registry.npmjs.org/${purlName}`
      const res = await fetch(endpoint)
      const data = await res.json()
      const allVersions = Object.keys(data.versions)
      setVerSuggestions(allVersions)
    }
  }

  const handleVersionChange = (e) => {
    setPurlVersion(e.target.value)
    if (e.target.value === '') {
      setVerSuggestions([])
      return
    }
    const pkg = PackageURL.fromString(purlString)
    pkg.version = e.target.value
    setPurlString(pkg.toString())
    fetchVersions()
  }

  const handleSave = () => {
    setPurlValue(purlString)
    onClose()
  }

  const handleNameClick = (suggestion) => {
    setPurlName(suggestion)
    const pkg = PackageURL.fromString(updatedString)
    pkg.name = suggestion
    setUpdatedString(pkg.toString())
    setSuggestions([])
  }

  const handleVersionClick = (version) => {
    setPurlVersion(version)
    const pkg = PackageURL.fromString(updatedString)
    pkg.version = version
    setUpdatedString(pkg.toString())
    setVerSuggestions([])
  }

  const [createAutoCheck] = useMutation(CreateAutomation)

  const onSaveRule = async () => {
    try {
      await createAutoCheck({
        variables: {
          projectId: productId,
          applicable: 'component',
          condition: 'missing',
          attr: 'purl',
          enabled: true,
          compName: activeCheck.name,
          compVersion: activeCheck.version,
          set: JSON.stringify(
            {
              value: purlString
            },
            null,
            2
          )
        }
      }).then((res) => res.data && handleComUpdate())
    } catch (error) {
      console.log('Error', error)
    }
  }

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>PURL Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Flex width={'100%'} direction={'column'} gap={4}>
              <FormControl>
                <FormLabel>Package URL</FormLabel>
                <Textarea
                  type='text'
                  variant='filled'
                  mt={1.5}
                  value={purlString}
                  fontSize='16px'
                  fontStyle={'bold'}
                  color='black'
                  isInvalid
                  errorBorderColor='blue.600'
                  onChange={handleVersionChange}
                  disabled
                />
              </FormControl>
              {/* Type */}
              <FormControl>
                <FormLabel htmlFor='packageType'>Package Type</FormLabel>
                <Select
                  size='md'
                  id='packageType'
                  name='packageType'
                  value={purlType}
                  onChange={handleTypeChange}
                >
                  {typeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </FormControl>
              {/* Namespace */}
              {!namespaceOptions.hasOwnProperty(purlType) ? (
                <CpeInput
                  name='namespace'
                  inputValue={namespace}
                  setInputValue={setNamespace}
                  cpeList={namespaceList}
                  setCpeList={setNamespaceList}
                  inputRef={namespaceRef}
                  validation={false}
                  onChange={onNamespaceInputChange}
                />
              ) : namespaceOptions[purlType] &&
                namespaceOptions[purlType].length > 0 ? (
                <FormControl>
                  <FormLabel>Namespace</FormLabel>
                  <Select
                    size='md'
                    id='namespace'
                    name='namespace'
                    value={namespace}
                    onChange={handleNamespaceChange}
                  >
                    {namespaceOptions[purlType].map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                </FormControl>
              ) : null}
              {/* Name */}
              {purlType === 'maven' || purlType === 'nuget' ? (
                <CpeInput
                  name='packageName'
                  inputValue={purlName}
                  setInputValue={setPurlName}
                  cpeList={purlNameList}
                  setCpeList={setPurlNameList}
                  inputRef={packageNameRef}
                  validation={false}
                  onChange={onNameInputChange}
                />
              ) : (
                <FormControl>
                  <FormLabel>Package Name</FormLabel>
                  <Stack direction='column' spacing={1} position={'relative'}>
                    <Input
                      type='text'
                      mt={1.5}
                      value={purlName}
                      size='md'
                      fontSize={'sm'}
                      onChange={handleNameChange}
                    />
                    {suggestions && suggestions.length > 0 && (
                      <Box
                        position='absolute'
                        zIndex='1'
                        width='100%'
                        top={12}
                        mt='2'
                        bg='white'
                        border='1px solid #ccc'
                        height={'200px'}
                        overflowY={'scroll'}
                      >
                        <List>
                          {suggestions.map((suggestion, index) => (
                            <ListItem
                              key={index}
                              cursor='pointer'
                              onClick={() => handleNameClick(suggestion)}
                              p='2'
                              _hover={{ background: 'gray.100' }}
                            >
                              <Text>{suggestion}</Text>
                            </ListItem>
                          ))}
                        </List>
                      </Box>
                    )}
                  </Stack>
                </FormControl>
              )}
              {/* Version */}
              {purlType === 'maven' || purlType === 'nuget' ? (
                <CpeInput
                  name='packageVersion'
                  inputValue={purlVersion}
                  setInputValue={setPurlVersion}
                  cpeList={purlVersionList}
                  setCpeList={setPurlVersionList}
                  inputRef={purlVersionRef}
                  validation={false}
                  onChange={onVersionInputChange}
                />
              ) : (
                <FormControl>
                  <FormLabel> Version</FormLabel>
                  <Stack direction='column' spacing={1} position={'relative'}>
                    <Input
                      size='md'
                      fontSize={'sm'}
                      mt={1.5}
                      type='text'
                      value={purlVersion}
                      onChange={handleVersionChange}
                    />
                    {verSuggestions && verSuggestions.length > 0 && (
                      <Box
                        position='absolute'
                        zIndex='1'
                        width='100%'
                        top={12}
                        mt='2'
                        bg='white'
                        border='1px solid #ccc'
                        // height={'300px'}
                        overflowY={'scroll'}
                      >
                        <List>
                          {verSuggestions
                            .filter((item) => item.includes(purlVersion))
                            .map((version, index) => (
                              <ListItem
                                key={index}
                                cursor='pointer'
                                onClick={() => handleVersionClick(version)}
                                p='2'
                                _hover={{ background: 'gray.100' }}
                              >
                                <Text>{version}</Text>
                              </ListItem>
                            ))}
                        </List>
                      </Box>
                    )}
                  </Stack>
                </FormControl>
              )}
            </Flex>
          </ModalBody>

          <ModalFooter>
            <Flex
              width={'100%'}
              justifyContent={'space-between'}
              alignItems={'center'}
            >
              {checkId ? (
                <Button fontSize={'sm'} colorScheme='blue' onClick={onSaveRule}>
                  Save Rule
                </Button>
              ) : (
                <Text></Text>
              )}
              <Stack direction={'row'} spacing={2} alignItems={'center'}>
                <Button
                  fontSize={'sm'}
                  colorScheme='gray'
                  mr={3}
                  onClick={onClose}
                >
                  Close
                </Button>
                <Button
                  fontSize={'sm'}
                  variant='solid'
                  colorScheme={'blue'}
                  onClick={checkId ? handleComUpdate : handleSave}
                >
                  Save
                </Button>
              </Stack>
            </Flex>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

export default PurlModal
