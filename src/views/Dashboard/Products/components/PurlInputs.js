import { useLazyQuery } from '@apollo/client'
import { TabContext } from 'context/TabContext'
import { PackageURL } from 'packageurl-js'
import { useContext, useEffect, useRef, useState } from 'react'
import { typeOptions } from 'utils'
import { namespaceOptions } from 'variables/general'

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

import { CpeAutoComplete } from 'graphQL/Queries'

import IdentifierLabel from './IdentifierLabel'

const PurlInputs = ({ value, setValue, onClose, activeComp }) => {
  const [getCpe] = useLazyQuery(CpeAutoComplete)

  const { purl } = activeComp || ''

  const { handleChange } = useContext(TabContext)

  const [purlData, setPurlData] = useState({
    type: '',
    namespace: '',
    name: '',
    version: '',
    qualifiers: ''
  })

  const isSearchable =
    purlData?.type === 'maven' ||
    purlData?.type === 'npm' ||
    purlData?.type === 'gem'

  const isSelectable =
    namespaceOptions[purlData?.type] &&
    namespaceOptions[purlData?.type].length > 0

  const isHidden = purlData?.type === 'nuget' || purlData?.type === 'oci'

  const namespaceRef = useRef()
  const purlVersionRef = useRef()
  const packageNameRef = useRef()
  const [namespaceList, setNamespaceList] = useState([])
  const [purlNameList, setPurlNameList] = useState([])
  const [purlVersionList, setPurlVersionList] = useState([])

  // const hasNamespace = validPurlTypes.includes(purlType)

  const isInvalid =
    purlData?.name === '' ||
    purlData?.type === '' ||
    (purlData?.type === 'swift' && purlData?.namespace === '')

  const isAutoComplete =
    purlData?.type === 'maven' ||
    purlData?.type === 'npm' ||
    purlData?.type === 'gem' ||
    purlData?.type === 'nuget'

  const handleInputChange = (field, value) => {
    const filterValue = value?.replace(/\s/g, '')
    setPurlData((prev) => ({ ...prev, [field]: filterValue }))
  }

  const handleInputBlur = (field, val) => {
    try {
      const pkg = PackageURL.fromString(value)
      if (field === 'qualifiers') {
        const convertedObject = {}
        const params = new URLSearchParams(val)
        for (const [key, value] of params) {
          convertedObject[key] = value
        }
        pkg[field] = convertedObject
        setValue(pkg.toString())
      } else {
        pkg[field] = val !== '' ? val : field
        setValue(pkg.toString())
      }
    } catch (error) {
      console.log('Something went wrong', error)
    }
  }

  // ON NAMESPACE INPUT CHANGE
  const onNamespaceInputChange = (event) => {
    const { value } = event.target
    const val = value.replace(/\s/g, '')
    handleInputChange('namespace', value)
    if (val !== '') {
      if (purlData?.type === 'npm') {
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
      } else if (purlData?.type === 'maven') {
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
      } else if (purlData?.type === 'gem') {
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
    }
  }

  // ON PACKAGE NAME INPUT CHANGE
  const onNameInputChange = (event) => {
    const { value } = event.target
    const val = value.replace(/\s/g, '')
    handleInputChange('name', value)
    if (val !== '') {
      if (purlData?.type === 'maven') {
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
                  namespace: purlData?.namespace
                }
              }
            }
          }
        }).then((res) => {
          if (res.data) {
            setPurlNameList(res.data.idAutoComplete.result)
          }
        })
      } else if (purlData?.type === 'nuget') {
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
      } else if (purlData?.type === 'npm') {
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
                  namespace: purlData?.namespace
                }
              }
            }
          }
        }).then((res) => {
          if (res.data) {
            setPurlNameList(res.data.idAutoComplete.result)
          }
        })
      } else if (purlData?.type === 'gem') {
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
                  namespace: purlData?.namespace
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

  // ON VERSION INPUT CHANGE
  const onVersionInputChange = (event) => {
    const { value } = event.target
    const val = value.replace(/\s/g, '')
    handleInputChange('version', value)
    if (val !== '') {
      if (purlData?.type === 'maven') {
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
                  namespace: purlData?.namespace,
                  name: purlData?.name
                }
              }
            }
          }
        }).then((res) => {
          if (res.data) {
            setPurlVersionList(res.data.idAutoComplete.result)
          }
        })
      } else if (purlData?.type === 'nuget') {
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
                  name: purlData?.name
                }
              }
            }
          }
        }).then((res) => {
          if (res.data) {
            setPurlVersionList(res.data.idAutoComplete.result)
          }
        })
      } else if (purlData?.type === 'npm') {
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
                  namespace: purlData?.namespace,
                  name: purlData?.name
                }
              }
            }
          }
        }).then((res) => {
          if (res.data) {
            setPurlVersionList(res.data.idAutoComplete.result)
          }
        })
      } else if (purlData?.type === 'gem') {
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
                  namespace: purlData?.namespace,
                  name: purlData?.name
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
    }
  }

  const handleSave = () => {
    try {
      const pkg = PackageURL.fromString(value)
      pkg.namespace = pkg.namespace === 'namespace' ? '' : pkg.namespace
      pkg.version = pkg.version === 'version' ? '' : pkg.version
      handleChange('identifiers', 'purl', pkg.toString())
      handleChange('identifiers', 'isValidaPurl', true)
      onClose()
    } catch (error) {
      handleChange('identifiers', 'isValidaPurl', false)
    }
  }

  useEffect(() => {
    if (purl) {
      const data = PackageURL.fromString(purl)
      setPurlData((prev) => ({
        ...prev,
        type: data?.type || '',
        namespace: data?.namespace || '',
        name: data?.name || '',
        version: data?.version || '',
        qualifiers: data?.qualifiers
          ? Object.entries(data.qualifiers)
              .map(([key, value]) => `${key}=${value}`)
              .join('&')
          : ''
      }))
    }
  }, [purl])

  return (
    <Flex width={'100%'} direction={'column'} gap={4}>
      {/* Package URL */}
      <FormControl>
        <IdentifierLabel title={`Package URL (PURL)`} onClose={onClose} />
        <Textarea
          isReadOnly
          type='text'
          value={value}
          fontSize='sm'
          variant='filled'
          onChange={(e) => console.log(e.target.value)}
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
          value={purlData?.type}
          onBlur={(e) => handleInputBlur('type', e.target.value)}
          onChange={(e) => handleInputChange('type', e.target.value)}
        >
          {typeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </FormControl>
      {/* Namespace */}
      {isSearchable ? (
        <CpeInput
          name='namespace'
          validation={false}
          string={value}
          setString={setValue}
          cpeList={namespaceList}
          inputRef={namespaceRef}
          setInputValue={setPurlData}
          setCpeList={setNamespaceList}
          inputValue={purlData?.namespace}
          onChange={onNamespaceInputChange}
        />
      ) : isSelectable ? (
        <FormControl>
          <FormLabel>Namespace</FormLabel>
          <Select
            size='md'
            fontSize={'sm'}
            id='namespace'
            name='namespace'
            value={purlData?.namespace}
            onBlur={(e) => handleInputBlur('namespace', e.target.value)}
            onChange={(e) => handleInputChange('namespace', e.target.value)}
          >
            {namespaceOptions[purlData?.type].map((item, index) => (
              <option key={index} value={item.value}>
                {item.label}
              </option>
            ))}
          </Select>
        </FormControl>
      ) : (
        <FormControl display={isHidden ? 'none' : 'block'}>
          <FormLabel>Namespace</FormLabel>
          <Input
            size='md'
            id='namespace'
            fontSize={'sm'}
            name='namespace'
            value={purlData?.namespace}
            placeholder='Enter namespace'
            onBlur={(e) => handleInputBlur('namespace', e.target.value)}
            onChange={(e) => handleInputChange('namespace', e.target.value)}
          />
        </FormControl>
      )}
      {/* Name */}
      {isAutoComplete ? (
        <CpeInput
          name='name'
          string={value}
          validation={false}
          setString={setValue}
          cpeList={purlNameList}
          inputRef={packageNameRef}
          inputValue={purlData?.name}
          setInputValue={setPurlData}
          setCpeList={setPurlNameList}
          onChange={onNameInputChange}
        />
      ) : (
        <FormControl>
          <FormLabel>Package Name</FormLabel>
          <Input
            mt={1.5}
            type='text'
            fontSize={'sm'}
            value={purlData?.name}
            placeholder='Enter packageName'
            onBlur={(e) => handleInputBlur('name', e.target.value)}
            onChange={(e) => handleInputChange('name', e.target.value)}
          />
        </FormControl>
      )}
      {/* Version */}
      {isAutoComplete ? (
        <CpeInput
          name='version'
          validation={false}
          string={value}
          setString={setValue}
          cpeList={purlVersionList}
          inputRef={purlVersionRef}
          setInputValue={setPurlData}
          inputValue={purlData?.version}
          setCpeList={setPurlVersionList}
          onChange={onVersionInputChange}
        />
      ) : (
        <FormControl>
          <FormLabel>Version</FormLabel>
          <Input
            mt={1.5}
            size='md'
            type='text'
            fontSize={'sm'}
            value={purlData?.version}
            placeholder='Enter version'
            onBlur={(e) => handleInputBlur('version', e.target.value)}
            onChange={(e) => handleInputChange('version', e.target.value)}
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
          value={purlData?.qualifiers}
          placeholder='Enter qualifiers'
          onBlur={(e) => handleInputBlur('qualifiers', e.target.value)}
          onChange={(e) => handleInputChange('qualifiers', e.target.value)}
        />
      </FormControl>
      <Flex alignItems={'center'} justifyContent={'flex-end'} gap={2}>
        <Button fontSize={'sm'} onClick={onClose} variant='ghost'>
          Close
        </Button>
        <Button
          fontSize={'sm'}
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
