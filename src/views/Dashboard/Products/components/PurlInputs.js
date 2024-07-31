import { PackageURL } from 'packageurl-js'
import { useEffect, useRef, useState } from 'react'
import { typeOptions } from 'utils'

import {
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea
} from '@chakra-ui/react'

import CpeInput from 'components/CpeInput'

import { useGlobalState } from 'hooks/useGlobalState'

const PurlInputs = ({
  data,
  onClose,
  setPurlValue,
  getCpe,
  activeRow,
  setIsValid
}) => {
  const { component } = activeRow || ''
  const { purl } = component || ''

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

  const isInvalid =
    purlName === '' ||
    purlType === '' ||
    (purlType === 'swift' && namespace === '')

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

  useEffect(() => {
    if (purl) {
      const pkg = PackageURL.fromString(purl)
      setPurlName(pkg?.name)
      setNamespace(pkg?.namespace)
      setPurlType(pkg?.type)
      setPurlVersion(pkg?.version)
      setQualifiers(pkg?.qualifiers)
      setPurlValue(pkg.toString())
    }
  }, [purl, setPurlValue])

  return (
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
      {purlType === 'maven' || purlType === 'npm' || purlType === 'gem' ? (
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
            purlType === 'nuget' || purlType === 'oci' ? 'none' : 'block'
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
          validation={false}
          name='packageVersion'
          inputValue={purlVersion}
          setInputValue={setPurlVersion}
          cpeList={purlVersionList}
          setCpeList={setPurlVersionList}
          inputRef={purlVersionRef}
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
      <Flex alignItems={'center'} justifyContent={'flex-end'} gap={2}>
        <Button onClick={onClose} variant='ghost'>
          Close
        </Button>
        <Button
          variant='outline'
          colorScheme='blue'
          onClick={handleSave}
          isDisabled={isInvalid}
        >
          Save PURL
        </Button>
      </Flex>
    </Flex>
  )
}

export default PurlInputs
