import { useLazyQuery, useMutation } from '@apollo/client'
import { PackageURL } from 'packageurl-js'
import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { typeOptions } from 'utils'
import { ProductDetailsTabs } from 'utils/TabsObjects'
import { namespaceOptions } from 'variables/general'

import {
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Select,
  Tag,
  Text,
  Textarea
} from '@chakra-ui/react'

import CpeInput from 'components/CpeInput'
import LynkModal from 'components/LynkModal'

import useCustomToast from 'hooks/useCustomToast'
import { useGlobalQueryContext } from 'hooks/useGlobalQueryContext'
import { useProductUrlContext } from 'hooks/useProductUrlContext'

import { AutomationRuleCreate, UpdateComponent } from 'graphQL/Mutation'
import { CpeAutoComplete } from 'graphQL/Queries'

import { FaCircleInfo } from 'react-icons/fa6'

const PurlModal = ({ isOpen, onClose, activeRow, ruleExists, recheck }) => {
  const { status, component } = activeRow || ''
  const { name, version, purl } = component || ''
  const { friendlyId, shortDesc } = activeRow?.organizationRule?.rule || ''
  const resolved = status === 'resolved'
  const { isFreeTier } = useGlobalQueryContext()

  const [getCpe] = useLazyQuery(CpeAutoComplete)

  const params = useParams()
  const sbomId = params.sbomid
  const productId = params.productid
  const navigate = useNavigate()

  const { generateProductDetailPageUrlFromCurrentUrl } = useProductUrlContext()

  const [value, setValue] = useState('pkg:type/name@version')

  const namespaceRef = useRef()
  const purlVersionRef = useRef()
  const packageNameRef = useRef()
  const [namespaceList, setNamespaceList] = useState([])
  const [purlNameList, setPurlNameList] = useState([])
  const [purlVersionList, setPurlVersionList] = useState([])

  const showToast = useCustomToast()

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

  const isInvalid =
    purlData?.name === '' ||
    purlData?.type === '' ||
    (purlData?.type === 'swift' && purlData?.namespace === '')

  const [updateComponent, { loading }] = useMutation(UpdateComponent, {
    onCompleted: () => recheck()
  })

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

  const handleComUpdate = () => {
    if (resolved) {
      onClose()
    } else {
      updateComponent({
        variables: {
          id: component?.id,
          sbomId: sbomId,
          purl: value
        }
      }).then((res) => res?.data && onClose())
    }
  }

  const isAutoComplete =
    purlData?.type === 'maven' ||
    purlData?.type === 'npm' ||
    purlData?.type === 'gem' ||
    purlData?.type === 'nuget'

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

  const [createRule, { loading: ruleLoading }] =
    useMutation(AutomationRuleCreate)

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
      field: 'component_purl',
      value: undefined
    }
  ]

  const filterConditions = conditionsAttributes?.filter(
    (item) => item?.field !== 'component_purl'
  )

  const actionsAttributes = [
    {
      subject: 'component',
      field: 'component_purl',
      value: value
    }
  ]

  const { AUTOMATION_RULES } = ProductDetailsTabs

  const link = generateProductDetailPageUrlFromCurrentUrl({
    paramsObj: {
      tab: AUTOMATION_RULES
    }
  })

  const handleRuleCreate = () => {
    if (ruleExists) {
      navigate(link)
    } else {
      createRule({
        variables: {
          active: true,
          name: shortDesc,
          projectId: productId,
          checkComponent: name,
          checkVersion: version,
          checkIdentifier: friendlyId,
          automationConditionsAttributes:
            shortDesc === 'Component has a purl'
              ? conditionsAttributes
              : filterConditions,
          automationActionsAttributes: actionsAttributes
        }
      }).then((res) => {
        const errors = res?.data?.automationRuleCreate?.errors
        if (errors?.length > 0) {
          showToast({
            description: `Unable to create rule, please try again.`,
            status: 'error'
          })
        } else {
          handleComUpdate()
        }
      })
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

  useEffect(() => {
    if (purl) {
      setValue(purl)
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
    <LynkModal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleComUpdate}
      title={'PURL Details'}
      Icon={FaCircleInfo}
      hidden={resolved}
      isDisabled={isInvalid || loading}
      buttonText={'Save'}
      leftFooterContent={
        !isFreeTier && (
          <Button
            variant='ghost'
            mr={'auto'}
            fontSize={'sm'}
            onClick={handleRuleCreate}
            hidden={friendlyId ? false : true}
            colorScheme={ruleExists ? 'green' : 'blue'}
            title={`${ruleExists ? 'View' : 'Save as'} Rule`}
            isDisabled={ruleLoading || loading || isInvalid}
          >
            {ruleExists ? 'View' : 'Save as'} Rule
          </Button>
        )
      }
    >
      {component && (
        <Flex
          width='100%'
          direction={'row'}
          alignItems={'center'}
          justifyContent={'flex-start'}
          wrap={'wrap'}
          gap={2}
          mb={6}
        >
          <Text wordBreak={'break-all'}>{component?.name || ''}</Text>
          <Tag colorScheme='blue'>{component?.version || '-'}</Tag>
        </Flex>
      )}
      <Flex width={'100%'} direction={'column'} gap={4}>
        {/* Package URL */}
        <FormControl isDisabled={resolved}>
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
        <FormControl isDisabled={resolved}>
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
            isDisabled={resolved}
            cpeList={namespaceList}
            inputRef={namespaceRef}
            setInputValue={setPurlData}
            setCpeList={setNamespaceList}
            inputValue={purlData?.namespace}
            onChange={onNamespaceInputChange}
          />
        ) : isSelectable ? (
          <FormControl isDisabled={resolved}>
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
          <FormControl
            isDisabled={resolved}
            display={isHidden ? 'none' : 'block'}
          >
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
            isDisabled={resolved}
            cpeList={purlNameList}
            inputRef={packageNameRef}
            inputValue={purlData?.name}
            setInputValue={setPurlData}
            setCpeList={setPurlNameList}
            onChange={onNameInputChange}
          />
        ) : (
          <FormControl isDisabled={resolved}>
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
            isDisabled={resolved}
            cpeList={purlVersionList}
            inputRef={purlVersionRef}
            setInputValue={setPurlData}
            inputValue={purlData?.version}
            setCpeList={setPurlVersionList}
            onChange={onVersionInputChange}
          />
        ) : (
          <FormControl isDisabled={resolved}>
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
        <FormControl isDisabled={resolved}>
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
      </Flex>
    </LynkModal>
  )
}

export default PurlModal
