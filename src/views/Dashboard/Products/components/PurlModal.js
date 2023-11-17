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
  Progress,
  ListItem,
  Textarea,
  List,
  Text,
  Box
} from '@chakra-ui/react'
import { useState, useEffect } from 'react'
import { PackageURL } from 'packageurl-js'
import { useLocation } from 'react-router-dom'
import { UpdateComponent, recheckHealth } from 'graphQL/Mutation'
import { useMutation } from '@apollo/client'

const typeOptions = [
  { value: '', label: '-- Select --' },

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
  id,
  refetch,
  checkId,
  totalRows
}) => {
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const productId = queryParams.get('p')
  const sbomId = queryParams.get('sbom')

  const [purlType, setPurlType] = useState('')
  const [namespace, setNamespace] = useState('')
  const [purlName, setPurlName] = useState('')
  const [purlVersion, setPurlVersion] = useState('')
  const [nameProgressValue, setNameProgressValue] = useState(0)
  const [verProgressValue, setVerProgressValue] = useState(0)
  const [suggestions, setSuggestions] = useState([])
  const [verSuggestions, setVerSuggestions] = useState([])

  const [updatedString, setUpdatedString] = useState(purlValue)

  const [healthRecheck] = useMutation(recheckHealth, {
    onCompleted: () => refetch()
  })
  const [updateComponent] = useMutation(UpdateComponent)

  const handleComUpdate = async () => {
    try {
      await updateComponent({
        variables: {
          id: id,
          sbomId: sbomId,
          purl: updatedString
        }
      })
        .then(() => {
          if (checkId) {
            healthRecheck({
              variables: {
                checkId: checkId,
                compId: id,
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

  useEffect(() => {
    if (data) {
      setPurlType(data.type === null ? '' : data.type)
      setNamespace(data.namespace === null ? '' : data.namespace)
      setPurlName(data.name === null ? '' : data.name)
      setPurlVersion(data.version === null ? '' : data.version)
      setNameProgressValue(calculateProgress(data.type, data.name, ''))
      setVerProgressValue(calculateProgress(data.type, data.name, data.version))
    }
  }, [data])

  const calculateProgress = (type, name, version) => {
    const vendorMap = {}
    vendorMap[['deb', 'adduser', ''].join(',')] = 40
    vendorMap[['deb', 'bash', ''].join(',')] = 100
    vendorMap[['deb', 'base-files', ''].join(',')] = 20
    vendorMap[['deb', 'base-passwd', ''].join(',')] = 20
    vendorMap[['deb', 'bash', '5.1-6ubuntu1'].join(',')] = 100
    vendorMap[['deb', 'binutils-common', ''].join(',')] = 100
    vendorMap[['deb', 'binutils-common', '2.38-4ubuntu2.3'].join(',')] = 100
    vendorMap[['deb', 'binutils-x86-64-linux-gnu', ''].join(',')] = 100
    vendorMap[
      ['deb', 'binutils-x86-64-linux-gnu', '2.38-4ubuntu2.3'].join(',')
    ] = 100
    vendorMap[['deb', 'binutils', ''].join(',')] = 100
    vendorMap[['deb', 'binutils', '2.38-4ubuntu2.3'].join(',')] = 100
    vendorMap[['deb', 'bsdutils', ''].join(',')] = 100
    vendorMap[['deb', 'bzip2', ''].join(',')] = 100
    vendorMap[['deb', 'bzip2', '1.0.8-4'].join(',')] = 100
    vendorMap[['deb', 'ca-certificates', ''].join(',')] = 100
    vendorMap[['deb', 'ca-certificates', '20210119~20.04.1'].join(',')] = 100
    vendorMap[['deb', 'coreutils', ''].join(',')] = 100
    vendorMap[['deb', 'coreutils', '8.30-3ubuntu2'].join(',')] = 100

    var newValue =
      vendorMap[
        [type.toLowerCase(), name.toLowerCase(), version.toLowerCase()].join(
          ','
        )
      ]
    // console.log('Type:' + type, 'Name:' + name, 'Version:' + version, newValue)
    if (isNaN(newValue)) {
      newValue = 0
    }
    return newValue
  }

  const getProgressColor = (value) => {
    if (value >= 90) {
      return 'green' // Change color to green if progress is 90% or higher
    } else if (value >= 50) {
      return 'yellow' // Change color to yellow if progress is 50% or higher
    } else {
      return 'red' // Change color to red for lower progress values
    }
  }

  const handleTypeChange = (e) => {
    // console.log('handleTypeChange', e.target.value, updatedString)
    setPurlType(e.target.value)
    const pkg = PackageURL.fromString(updatedString)
    pkg.type = e.target.value
    pkg.namespace = ''
    setUpdatedString(pkg.toString())
    const nameProgressValue = calculateProgress(pkg.type, pkg.name, '')
    // console.log('nameProgressValue', nameProgressValue)
    setNameProgressValue(nameProgressValue)

    const verProgressValue = calculateProgress(pkg.type, pkg.name, pkg.version)
    // console.log('verProgressValue', verProgressValue)
    setVerProgressValue(verProgressValue)

    // console.log(
    //   'Done handleTypeChange',
    //   e.target.value,
    //   pkg.toString(),
    //   updatedString,
    //   namespaceOptions[pkg.type],
    //   namespaceOptions.hasOwnProperty(type)
    // )
  }

  const handleNamespaceChange = (e) => {
    // console.log('handleNamespaceChange', e.target.value, updatedString)
    setNamespace(e.target.value)
    const pkg = PackageURL.fromString(updatedString)
    pkg.namespace = e.target.value
    setUpdatedString(pkg.toString())
  }

  const handleNameChange = (e) => {
    // console.log('handleNameChange', e.target.value, updatedString)
    setPurlName(e.target.value)

    if (e.target.value === '') {
      setSuggestions([])
      return
    }

    const pkg = PackageURL.fromString(updatedString)
    pkg.name = e.target.value
    setUpdatedString(pkg.toString())

    const nameProgressValue = calculateProgress(pkg.type, e.target.value, '')
    // console.log('nameProgressValue', nameProgressValue)
    setNameProgressValue(nameProgressValue)

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

    if (purlType === 'maven') {
      fetch(
        `https://search.maven.org/solrsearch/select?q=${e.target.value}&rows=20&wt=json`
      )
        .then((response) => response.json())
        .then((data) => {
          console.log('Maven suggestions:', data)
        })
        .catch((error) => {
          console.error('Error fetching suggestions:', error)
        })
    }
  }

  const handleNameBlur = () => {
    // Clear the suggestions when the input loses focus
    // console.log('Clearing blur')
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

    const pkg = PackageURL.fromString(updatedString)
    pkg.version = e.target.value
    setUpdatedString(pkg.toString())

    const verProgressValue = calculateProgress(
      pkg.type,
      pkg.name,
      e.target.value
    )

    // console.log('verProgressValue', verProgressValue)
    setVerProgressValue(verProgressValue)

    fetchVersions()
  }

  const handleSave = () => {
    setPurlValue(updatedString)
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
                  value={updatedString}
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
                <FormControl>
                  <FormLabel htmlFor='namespace'>Namespace</FormLabel>
                  <Input
                    type='text'
                    mt={1.5}
                    size='md'
                    id='namespace'
                    name='namespace'
                    value={namespace}
                    onChange={handleNamespaceChange}
                  />
                </FormControl>
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
              <FormControl>
                <FormLabel>Package Name</FormLabel>
                <Stack direction='column' spacing={1} position={'relative'}>
                  <Input
                    type='text'
                    mt={1.5}
                    value={purlName}
                    size='md'
                    onChange={handleNameChange}
                  />
                  {/* <Progress
                    value={nameProgressValue}
                    colorScheme={getProgressColor(nameProgressValue)}
                  /> */}
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
              {/* Version */}
              <FormControl>
                <FormLabel> Version</FormLabel>
                <Stack direction='column' spacing={1} position={'relative'}>
                  <Input
                    size='md'
                    mt={1.5}
                    type='text'
                    value={purlVersion}
                    onChange={handleVersionChange}
                  />
                  {/* <Progress
                    value={verProgressValue}
                    colorScheme={getProgressColor(verProgressValue)}
                  /> */}
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
            </Flex>
          </ModalBody>

          <ModalFooter>
            <Button fontSize={'sm'} colorScheme='gray' mr={3} onClick={onClose}>
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
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

export default PurlModal
