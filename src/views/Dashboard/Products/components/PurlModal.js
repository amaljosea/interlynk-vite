import { useMutation } from '@apollo/client'
import { PackageURL } from 'packageurl-js'
import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'

import {
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
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
  Textarea
} from '@chakra-ui/react'

import CpeInput from 'components/CpeInput'

import { useGlobalState } from 'hooks/useGlobalState'

import { UpdateComponent, recheckHealth } from 'graphQL/Mutation'

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
  { value: 'hackage', label: 'hackage' },
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

const PurlModal = ({
  data,
  isOpen,
  onClose,
  setPurlValue,
  refetch,
  checkId,
  getCpe,
  activeCheck,
  setIsValid,
  activeComp
}) => {
  const params = useParams()
  const sbomId = params.sbomid

  const { prodCompState, dispatch } = useGlobalState()
  const { purlString } = prodCompState
  const { prodCompDispatch } = dispatch

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
  const [qualifiers, setQualifiers] = useState('')

  // const hasNamespace = validPurlTypes.includes(purlType)

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
    generic: [],
    hackage: [],
    mflow: [],
    nuget: [],
    oci: [],
    pub: [],
    pypi: []
  }

  const [healthRecheck] = useMutation(recheckHealth)
  const [updateComponent] = useMutation(UpdateComponent)

  const handleComUpdate = async () => {
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
          }).then((res) => res?.data && refetch())
        }
      })
      .finally(() => onClose())
  }

  const isAutoComplete =
    purlType === 'maven' ||
    purlType === 'npm' ||
    purlType === 'gem' ||
    purlType === 'nuget'

  // ON NAMESPACE INPUT CHANGE
  const onNamespaceInputChange = (event) => {
    const { value } = event.target
    const val = value.replace(/\s/g, '')
    setNamespace(val)
    if (val !== '') {
      if (purlType === 'npm') {
        getCpe({
          variables: {
            input: {
              idType: 'purl',
              ecosystem: 'npm',
              search: {
                namespace: val
              }
            }
          }
        }).then((res) => {
          if (res.data) {
            setNamespaceList(res.data.idAutoComplete.result)
          }
        })
      } else if (purlType === 'maven') {
        getCpe({
          variables: {
            input: {
              idType: 'purl',
              ecosystem: 'maven',
              search: {
                namespace: val
              }
            }
          }
        }).then((res) => {
          if (res.data) {
            setNamespaceList(res.data.idAutoComplete.result)
          }
        })
      } else if (purlType === 'gem') {
        getCpe({
          variables: {
            input: {
              idType: 'purl',
              ecosystem: 'gem',
              search: {
                namespace: val
              }
            }
          }
        }).then((res) => {
          if (res.data) {
            setNamespaceList(res.data.idAutoComplete.result)
          }
        })
      }
    } else {
      const pkg = PackageURL.fromString(purlString)
      pkg.namespace = ''
      pkg.name = 'name'
      prodCompDispatch({ type: 'SET_PURL_STRING', payload: pkg.toString() })
    }
  }

  // ON PACKAGE NAME INPUT CHANGE
  const onNameInputChange = (event) => {
    const { value } = event.target
    const val = value.replace(/\s/g, '')
    setPurlName(val)
    if (val !== '') {
      if (purlType === 'maven') {
        getCpe({
          variables: {
            input: {
              idType: 'purl',
              ecosystem: 'maven',
              search: {
                name: val
              },
              hints: {
                purl: {
                  namespace: namespace
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
                name: val
              }
            }
          }
        }).then((res) => {
          if (res.data) {
            setPurlNameList(res.data.idAutoComplete.result)
          }
        })
      } else if (purlType === 'npm') {
        getCpe({
          variables: {
            input: {
              idType: 'purl',
              ecosystem: 'npm',
              search: {
                name: val
              },
              hints: {
                purl: {
                  namespace: namespace
                }
              }
            }
          }
        }).then((res) => {
          if (res.data) {
            setPurlNameList(res.data.idAutoComplete.result)
          }
        })
      } else if (purlType === 'gem') {
        getCpe({
          variables: {
            input: {
              idType: 'purl',
              ecosystem: 'gem',
              search: {
                name: val
              },
              hints: {
                purl: {
                  namespace: namespace
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
  }

  const onNameBlur = () => {
    const pkg = PackageURL.fromString(purlString)
    if (purlName !== '') {
      pkg.name = purlName
      prodCompDispatch({ type: 'SET_PURL_STRING', payload: pkg.toString() })
    } else {
      pkg.name = 'name'
      prodCompDispatch({ type: 'SET_PURL_STRING', payload: pkg.toString() })
    }
  }

  // ON VERSION INPUT CHANGE
  const onVersionInputChange = (event) => {
    const { value } = event.target
    const val = value.replace(/\s/g, '')
    setPurlVersion(val)
    if (val !== '') {
      if (purlType === 'maven') {
        getCpe({
          variables: {
            input: {
              idType: 'purl',
              ecosystem: 'maven',
              search: {
                version: val
              },
              hints: {
                purl: {
                  namespace: namespace,
                  name: purlName
                }
              }
            }
          }
        }).then((res) => {
          if (res.data) {
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
                version: val
              },
              hints: {
                purl: {
                  name: purlName
                }
              }
            }
          }
        }).then((res) => {
          if (res.data) {
            setPurlVersionList(res.data.idAutoComplete.result)
          }
        })
      } else if (purlType === 'npm') {
        getCpe({
          variables: {
            input: {
              idType: 'purl',
              ecosystem: 'npm',
              search: {
                version: val
              },
              hints: {
                purl: {
                  namespace: namespace,
                  name: purlName
                }
              }
            }
          }
        }).then((res) => {
          if (res.data) {
            setPurlVersionList(res.data.idAutoComplete.result)
          }
        })
      } else if (purlType === 'gem') {
        getCpe({
          variables: {
            input: {
              idType: 'purl',
              ecosystem: 'gem',
              search: {
                version: val
              },
              hints: {
                purl: {
                  namespace: namespace,
                  name: purlName
                }
              }
            }
          }
        }).then((res) => {
          if (res.data) {
            setPurlVersionList(res.data.idAutoComplete.result)
          }
        })
      }
    } else {
      const pkg = PackageURL.fromString(purlString)
      pkg.version = ''
      prodCompDispatch({ type: 'SET_PURL_STRING', payload: pkg.toString() })
    }
  }

  useEffect(() => {
    if (data) {
      setPurlType(data.type === null ? '' : data.type)
      setNamespace(data.namespace === null ? '' : data.namespace)
      setPurlName(data.name === null ? '' : data.name)
      setPurlVersion(data.version === null ? '' : data.version)
      if (data.qualifiers) {
        const queryString = Object.entries(data.qualifiers)
          .map(([key, value]) => `${key}=${value}`)
          .join('&')
        setQualifiers(queryString)
      }
    }
  }, [data])

  const handleTypeChange = (e) => {
    const { value } = e.target
    setPurlType(value)
    prodCompDispatch({
      type: 'SET_PURL_STRING',
      payload: 'pkg:type/name@version'
    })
    setNamespace('')
    setPurlName('')
    setPurlVersion('')
    setQualifiers('')
  }

  const onTypeBlur = () => {
    if (purlType !== '') {
      const pkg = PackageURL.fromString(purlString)
      pkg.type = purlType
      prodCompDispatch({
        type: 'SET_PURL_STRING',
        payload: pkg.toString()
      })
    }
  }

  const handleNamespaceChange = (e) => {
    const { value } = e.target
    const val = value.replace(/\s/g, '')
    setNamespace(val)
  }

  const onNamespaceBlur = () => {
    const pkg = PackageURL.fromString(purlString)
    if (namespace !== '') {
      pkg.namespace = namespace
      prodCompDispatch({
        type: 'SET_PURL_STRING',
        payload: pkg.toString()
      })
    } else {
      pkg.namespace = ''
      prodCompDispatch({
        type: 'SET_PURL_STRING',
        payload: pkg.toString()
      })
    }
  }

  const handleNameChange = (e) => {
    const { value } = e.target
    const val = value.replace(/\s/g, '')
    setPurlName(val)
  }

  const handleVersionChange = (e) => {
    const { value } = e.target
    const val = value.replace(/\s/g, '')
    setPurlVersion(val)
  }

  const onVersionBlur = () => {
    const pkg = PackageURL.fromString(purlString)
    if (purlVersion !== '') {
      pkg.version = purlVersion
      prodCompDispatch({
        type: 'SET_PURL_STRING',
        payload: pkg.toString()
      })
    } else {
      pkg.version = 'version'
      prodCompDispatch({
        type: 'SET_PURL_STRING',
        payload: pkg.toString()
      })
    }
  }

  const handleQualifierChange = (e) => {
    const { value } = e.target
    const val = value.replace(/\s/g, '')
    setQualifiers(val)
  }

  const onQualifierBlur = () => {
    const pkg = PackageURL.fromString(purlString)
    console.log('pkg', pkg)
    const convertedObject = {}
    if (qualifiers !== '') {
      const params = new URLSearchParams(qualifiers)
      for (const [key, value] of params) {
        convertedObject[key] = value
      }
      pkg.qualifiers = convertedObject
      prodCompDispatch({
        type: 'SET_PURL_STRING',
        payload: pkg.toString()
      })
    } else {
      pkg.qualifiers = ''
      prodCompDispatch({
        type: 'SET_PURL_STRING',
        payload: pkg.toString()
      })
    }
  }

  const handleSave = () => {
    try {
      const pkg = PackageURL.fromString(purlString)
      pkg.namespace = pkg.namespace === 'namespace' ? '' : pkg.namespace
      pkg.version = pkg.version === 'version' ? '' : pkg.version
      console.log('value', pkg.toString())
      setPurlValue(pkg.toString())
      setIsValid(true)
      onClose()
    } catch (error) {
      setIsValid(false)
    }
  }

  console.log('activeCheck', activeCheck)

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>PURL Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
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
                <Text wordBreak={'break-all'}>
                  {activeCheck.name ? activeCheck.name : ''}
                </Text>
                {activeCheck.version && (
                  <Tag colorScheme='blue'>{activeCheck.version}</Tag>
                )}
              </Flex>
            )}
            {activeComp && (
              <Flex
                width='100%'
                direction={'row'}
                alignItems={'center'}
                justifyContent={'flex-start'}
                wrap={'wrap'}
                gap={2}
                mb={6}
              >
                <Text wordBreak={'break-all'}>
                  {activeComp.name ? activeComp.name : ''}
                </Text>
                {activeComp.version && (
                  <Tag colorScheme='blue'>{activeComp.version}</Tag>
                )}
              </Flex>
            )}
            <Flex width={'100%'} direction={'column'} gap={4}>
              {/* Package URL */}
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
                  onChange={(e) => console.log(e.target.value)}
                  disabled
                />
              </FormControl>
              {/* Type */}
              <FormControl>
                <FormLabel htmlFor='packageType'>Package Type</FormLabel>
                <Select
                  size='md'
                  fontSize={'sm'}
                  id='packageType'
                  name='packageType'
                  value={purlType}
                  onChange={handleTypeChange}
                  onBlur={onTypeBlur}
                >
                  {typeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </FormControl>
              {/* Namespace */}
              {purlType === 'maven' ||
              purlType === 'npm' ||
              purlType === 'gem' ? (
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
                    fontSize={'sm'}
                    id='namespace'
                    name='namespace'
                    value={namespace}
                    onChange={handleNamespaceChange}
                    onBlur={onNamespaceBlur}
                  >
                    {namespaceOptions[purlType].map((item, index) => (
                      <option key={index} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </Select>
                </FormControl>
              ) : (
                <FormControl
                  display={
                    purlType === 'nuget' || purlType === 'oci'
                      ? 'none'
                      : 'block'
                  }
                >
                  <FormLabel>Namespace</FormLabel>
                  <Input
                    size='md'
                    fontSize={'sm'}
                    id='namespace'
                    name='namespace'
                    value={namespace}
                    onChange={handleNamespaceChange}
                    onBlur={onNamespaceBlur}
                    placeholder='Enter namespace'
                  />
                </FormControl>
              )}
              {/* Name */}
              {isAutoComplete ? (
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
                  <Input
                    type='text'
                    mt={1.5}
                    value={purlName}
                    fontSize={'sm'}
                    onChange={handleNameChange}
                    onBlur={onNameBlur}
                    placeholder='Enter packageName'
                  />
                </FormControl>
              )}
              {/* Version */}
              {isAutoComplete ? (
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
                  <FormLabel>Version</FormLabel>
                  <Input
                    size='md'
                    fontSize={'sm'}
                    mt={1.5}
                    type='text'
                    value={purlVersion}
                    onChange={handleVersionChange}
                    onBlur={onVersionBlur}
                    placeholder='Enter version'
                  />
                </FormControl>
              )}
              {/* Qualifiers */}
              <FormControl>
                <FormLabel>Qualifiers</FormLabel>
                <Input
                  size='md'
                  fontSize={'sm'}
                  id='qualifiers'
                  name='qualifiers'
                  value={qualifiers}
                  onChange={handleQualifierChange}
                  onBlur={onQualifierBlur}
                  placeholder='Enter qualifiers'
                />
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
              <Button fontSize={'sm'} colorScheme='gray' onClick={onClose}>
                Cancel
              </Button>
              <Button
                fontSize={'sm'}
                variant='solid'
                colorScheme={'blue'}
                onClick={checkId ? handleComUpdate : handleSave}
                disabled={
                  purlName === '' ||
                  purlType === '' ||
                  (purlType === 'swift' && namespace === '')
                }
              >
                Save
              </Button>
            </Flex>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

export default PurlModal
