import { useMutation } from '@apollo/client'
import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { validateCpe } from 'utils'

import {
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Grid,
  Input,
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
  Textarea
} from '@chakra-ui/react'

import CpeInput from 'components/CpeInput'

import { useGlobalState } from 'hooks/useGlobalState'

import {
  AutomationRuleCreate,
  UpdateComponent,
  recheckHealth
} from 'graphQL/Mutation'

const CpeModal = ({
  isOpen,
  onClose,
  setCpeValue,
  cpeValue,
  activeComp,
  refetch,
  getCpe,
  activeRow,
  ruleExists
}) => {
  const { status, component } = activeRow || ''
  const { friendlyId, shortDesc } = activeRow?.organizationRule?.rule || ''
  const resolved = status === 'resolved'
  const params = useParams()
  const sbomId = params.sbomid
  const productId = params.productid
  const navigate = useNavigate()

  const [error, setError] = useState('')
  const [vendor, setVendor] = useState('')
  const [vendorList, setVendorList] = useState([])
  const vendorRef = useRef()
  const [product, setProduct] = useState('')
  const [productList, setProductList] = useState([])
  const productRef = useRef()
  const [type, setType] = useState('')
  const [version, setVersion] = useState('')
  const [versionList, setVersionList] = useState([])
  const versionRef = useRef()
  const [update, setUpdate] = useState('')
  const [edition, setEdition] = useState('')
  const [language, setLanguage] = useState('')
  const [swEdition, setSwEdition] = useState('')
  const [targetSoftware, setTargetSoftware] = useState('')
  const [hardware, setHardware] = useState('')
  const [other, setOther] = useState('')
  const [isDisabled, setIsDisabled] = useState(false)

  const isInvalid =
    type === '' || vendor === '' || product === '' || version === ''

  const disableButtonTemporarily = () => {
    setIsDisabled(true)
    setTimeout(() => {
      setIsDisabled(false)
    }, 3000)
  }

  const { prodCompState, dispatch } = useGlobalState()
  const { cpeString } = prodCompState
  const { prodCompDispatch } = dispatch

  const [healthRecheck] = useMutation(recheckHealth)
  const [updateComponent] = useMutation(UpdateComponent)

  // UPDATE FIELDS DATA FROM API
  useEffect(() => {
    if (cpeValue !== '') {
      const components = cpeValue.split(':')
      const allowedValues = ['a', 'h', 'o', 'A', 'H', 'O']
      const isValid =
        components[2] && allowedValues.includes(components[2].toLowerCase())
      if (isValid) {
        setType(components[2].toLowerCase())
      } else {
        setType('')
      }
      setVendor(components[3]?.replace(/\*/g, '') || '')
      setProduct(components[4]?.replace(/\*/g, '') || '')
      setVersion(components[5]?.replace(/\*/g, '') || '')
      setUpdate(components[6]?.replace(/\*/g, '') || '')
      setEdition(components[7]?.replace(/\*/g, '') || '')
      setLanguage(components[8]?.replace(/\*/g, '') || '')
      setSwEdition(components[9]?.replace(/\*/g, '') || '')
      setTargetSoftware(components[10]?.replace(/\*/g, '') || '')
      setHardware(components[11]?.replace(/\*/g, '') || '')
      setOther(components[12]?.replace(/\*/g, '') || '')
      prodCompDispatch({
        type: 'SET_CPE_STRING',
        payload: `cpe:2.3:${isValid ? components[2].toLowerCase() : '*'}:${
          components[3] || '*'
        }:${components[4] || '*'}:${components[5] || '*'}:${
          components[6] || '*'
        }:${components[7] || '*'}:${components[8] || '*'}:${
          components[9] || '*'
        }:${components[10] || '*'}:${components[11] || '*'}:${
          components[12] || '*'
        }`
      })
    } else {
      prodCompDispatch({
        type: 'SET_CPE_STRING',
        payload: 'cpe:2.3:*:*:*:*:*:*:*:*:*:*:*'
      })
    }
  }, [cpeValue, prodCompDispatch])

  // ON BLUR UPDATE
  const onBlurUpdate = () => {
    const cpeParts = cpeString.split(':')
    cpeParts[6] = update === '' ? '*' : update
    const cpe = cpeParts.join(':')
    prodCompDispatch({ type: 'SET_CPE_STRING', payload: cpe })
  }

  // ON BLUR EDITION
  const onBlurEdition = () => {
    const cpeParts = cpeString.split(':')
    cpeParts[7] = edition === '' ? '*' : edition
    const cpe = cpeParts.join(':')
    prodCompDispatch({ type: 'SET_CPE_STRING', payload: cpe })
  }

  // ON BLUR LANGUAGE
  const onBlurLanguage = () => {
    const cpeParts = cpeString.split(':')
    cpeParts[8] = language === '' ? '*' : language
    const cpe = cpeParts.join(':')
    prodCompDispatch({ type: 'SET_CPE_STRING', payload: cpe })
  }

  // ON BLUR SW EDITION
  const onBlurSwEdition = () => {
    const cpeParts = cpeString.split(':')
    cpeParts[9] = swEdition === '' ? '*' : swEdition
    const cpe = cpeParts.join(':')
    prodCompDispatch({ type: 'SET_CPE_STRING', payload: cpe })
  }

  // ON BLUR TARGET SOFTWARE
  const onBlurTargetSoftware = () => {
    const cpeParts = cpeString.split(':')
    cpeParts[10] = targetSoftware === '' ? '*' : targetSoftware
    const cpe = cpeParts.join(':')
    prodCompDispatch({ type: 'SET_CPE_STRING', payload: cpe })
  }

  // ON BLUR OTHER
  const onBlurOther = () => {
    const cpeParts = cpeString.split(':')
    cpeParts[12] = other === '' ? '*' : other
    const cpe = cpeParts.join(':')
    prodCompDispatch({ type: 'SET_CPE_STRING', payload: cpe })
  }

  // ON CPE SAVE
  const handleSave = () => {
    setCpeValue(cpeString)
    onClose()
  }

  // ON CPE UPDATE
  const handleComUpdate = () => {
    disableButtonTemporarily()
    if (validateCpe(cpeString)) {
      updateComponent({
        variables: {
          id: component?.id,
          sbomId: sbomId,
          cpes: [cpeString]
        }
      })
        .then(() => {
          if (friendlyId) {
            healthRecheck({
              variables: {
                checkId: friendlyId,
                compId: component?.id,
                sbomId: sbomId
              }
            }).then((res) => res?.data && refetch())
          }
        })
        .finally(() => onClose())
    } else {
      setError('Invalid CPE')
    }
  }

  // ON VENDOR INPUT CHANGE
  const onVendorInputChange = (event) => {
    const { value } = event.target
    const val = value.replace(/\s/g, '')
    if (!val.includes('*') && !value.includes(':')) {
      setVendor(val)
      if (val !== '') {
        getCpe({
          variables: {
            input: {
              idType: 'cpe',
              ecosystem: 'cpe',
              search: {
                vendor: val
              }
            }
          }
        }).then((res) => {
          if (res.data) {
            setVendorList(res.data.idAutoComplete.result)
          }
        })
      }
    }
  }

  // ON TYPE CHANGE
  const handleTypeChange = (e) => {
    const { value } = e.target
    const cpeParts = cpeString.split(':')
    setType(value)
    if (value !== '') {
      cpeParts[2] = e.target.value
      const cpe = cpeParts.join(':')
      prodCompDispatch({
        type: 'SET_CPE_STRING',
        payload: cpe
      })
    } else {
      cpeParts[2] = ''
      const cpe = cpeParts.join(':')
      prodCompDispatch({
        type: 'SET_CPE_STRING',
        payload: cpe
      })
    }
  }

  // ON PRODUCT INPUT CHANGE
  const onProductInputChange = (event) => {
    const { value } = event.target
    const val = value.replace(/\s/g, '')
    if (!val.includes('*') && !val.includes(':')) {
      setProduct(val)
      if (val !== '') {
        getCpe({
          variables: {
            input: {
              idType: 'cpe',
              ecosystem: 'cpe',
              search: {
                product: val
              },
              hints: {
                cpe: {
                  vendor: vendor
                }
              }
            }
          }
        }).then((res) => {
          if (res.data) {
            setProductList(res.data.idAutoComplete.result)
          }
        })
      }
    }
  }

  // ON VERSION INPUT CHANGE
  const onVersionInputChange = (event) => {
    const { value } = event.target
    const val = value.replace(/\s/g, '')
    if (!val.includes('*') && !val.includes(':')) {
      setVersion(val)
      if (val !== '') {
        getCpe({
          variables: {
            input: {
              idType: 'cpe',
              ecosystem: 'cpe',
              search: {
                version: val
              },
              hints: {
                cpe: {
                  vendor: vendor,
                  product: product
                }
              }
            }
          }
        }).then((res) => {
          if (res.data) {
            setVersionList(res.data.idAutoComplete.result)
          }
        })
      }
    }
  }

  // ON HARDWARE CHANGE
  const handleHardwareChange = (e) => {
    const { value } = e.target
    setHardware(value)
    const cpeParts = cpeString.split(':')
    cpeParts[11] = value === '' ? '*' : value
    const cpe = cpeParts.join(':')
    prodCompDispatch({
      type: 'SET_CPE_STRING',
      payload: cpe
    })
  }

  // ON CHANGE
  const handleOnChange = (value, setStateFunc) => {
    if (!value.includes(':') && !value.includes('*')) {
      setStateFunc(value)
    }
  }

  const [createRule] = useMutation(AutomationRuleCreate)

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
      field: 'component_cpe',
      value: undefined
    }
  ]

  const filterConditions = conditionsAttributes?.filter(
    (item) => item?.field !== 'component_cpe'
  )

  const actionsAttributes = [
    {
      subject: 'component',
      field: 'component_cpe',
      value: cpeString
    }
  ]

  const handleRuleCreate = async () => {
    if (ruleExists) {
      localStorage.setItem('activeProdTab', 2)
      navigate(`/vendor/products/${params?.productgroupid}/env/${productId}`)
    } else {
      disableButtonTemporarily()
      await createRule({
        variables: {
          active: true,
          name: shortDesc,
          tag: friendlyId,
          projectId: productId,
          automationConditionsAttributes:
            shortDesc === 'Component has a cpe'
              ? conditionsAttributes
              : filterConditions,
          automationActionsAttributes: actionsAttributes
        }
      }).then((res) => {
        const errors = res?.data?.automationRuleCreate?.errors
        if (errors?.length > 0) {
          setError(errors[0])
        } else {
          handleComUpdate()
        }
      })
    }
  }

  useEffect(() => {
    if (status === 'resolved') {
      setCpeValue(component?.cpes[0] || '')
    }
  }, [component?.cpes, prodCompDispatch, setCpeValue, status])

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size={'2xl'}
        motionPreset='slideInBottom'
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>CPE Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
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
              {/* CPE STRING */}
              <FormControl isDisabled={resolved}>
                <FormLabel htmlFor='cpeString'>CPE String</FormLabel>
                <Textarea
                  type='text'
                  variant='outline'
                  name='cpeString'
                  id='cpeString'
                  mt={1.5}
                  value={cpeString}
                  fontSize='16px'
                  fontStyle={'bold'}
                  color='black'
                  onChange={(e) => console.log(e.target.value)}
                  disabled
                />
                {error !== '' && <FormErrorMessage>{error}</FormErrorMessage>}
              </FormControl>
              <Grid templateColumns='repeat(2, 1fr)' gap={6}>
                {/* PART */}
                <FormControl isDisabled={resolved}>
                  <FormLabel htmlFor='type'>Part</FormLabel>
                  <Select
                    id='part'
                    name='part'
                    size='md'
                    fontSize={'sm'}
                    value={type}
                    onChange={handleTypeChange}
                  >
                    <option value=''>-- Select --</option>
                    <option value='a'>Application</option>
                    <option value='o'>Operating System</option>
                    <option value='h'>Hardware</option>
                  </Select>
                </FormControl>
                {/* VENDOR */}
                <CpeInput
                  name='vendor'
                  isDisabled={resolved}
                  inputValue={vendor}
                  setInputValue={setVendor}
                  cpeList={vendorList}
                  setCpeList={setVendorList}
                  inputRef={vendorRef}
                  validation={false}
                  onChange={onVendorInputChange}
                />
                {/* PRODUCT */}
                <CpeInput
                  name='product'
                  isDisabled={resolved}
                  inputValue={product}
                  setInputValue={setProduct}
                  cpeList={productList}
                  setCpeList={setProductList}
                  inputRef={productRef}
                  validation={false}
                  onChange={onProductInputChange}
                />
                {/* VERSION */}
                <CpeInput
                  name='version'
                  isDisabled={resolved}
                  inputValue={version}
                  setInputValue={setVersion}
                  cpeList={versionList}
                  setCpeList={setVersionList}
                  inputRef={versionRef}
                  validation={false}
                  onChange={onVersionInputChange}
                />
                {/* UPDATE */}
                <FormControl isDisabled={resolved}>
                  <FormLabel>Update</FormLabel>
                  <Input
                    type='text'
                    value={update}
                    size='md'
                    fontSize={'sm'}
                    onChange={(e) => handleOnChange(e.target.value, setUpdate)}
                    onBlur={onBlurUpdate}
                    placeholder='Enter update'
                  />
                </FormControl>
                {/* EDITION */}
                <FormControl isDisabled={resolved}>
                  <FormLabel>Edition</FormLabel>
                  <Input
                    type='text'
                    value={edition}
                    size='md'
                    fontSize={'sm'}
                    onChange={(e) => handleOnChange(e.target.value, setEdition)}
                    onBlur={onBlurEdition}
                    placeholder='Enter edition'
                  />
                </FormControl>
                {/* LANGUAGE */}
                <FormControl isDisabled={resolved}>
                  <FormLabel>Language</FormLabel>
                  <Input
                    type='text'
                    value={language}
                    size='md'
                    fontSize={'sm'}
                    onChange={(e) =>
                      handleOnChange(e.target.value, setLanguage)
                    }
                    onBlur={onBlurLanguage}
                    placeholder='Enter language'
                  />
                </FormControl>
                {/* SW EDITION */}
                <FormControl isDisabled={resolved}>
                  <FormLabel>SW Edition</FormLabel>
                  <Input
                    type='text'
                    value={swEdition}
                    size='md'
                    fontSize={'sm'}
                    onChange={(e) =>
                      handleOnChange(e.target.value, setSwEdition)
                    }
                    onBlur={onBlurSwEdition}
                    placeholder='Enter sw edition'
                  />
                </FormControl>
                {/* TARGET SOFTWARE */}
                <FormControl isDisabled={resolved}>
                  <FormLabel>Target Software</FormLabel>
                  <Input
                    type='text'
                    value={targetSoftware}
                    size='md'
                    fontSize={'sm'}
                    onChange={(e) =>
                      handleOnChange(e.target.value, setTargetSoftware)
                    }
                    onBlur={onBlurTargetSoftware}
                    placeholder='Enter target software'
                  />
                </FormControl>
                {/* TARGET HARDWARE */}
                <FormControl isDisabled={resolved}>
                  <FormLabel htmlFor='targetHardware'>
                    Target Hardware
                  </FormLabel>
                  <Stack direction='column' spacing={1}>
                    <Select
                      size='md'
                      fontSize={'sm'}
                      id='targetHardware'
                      name='targetHardware'
                      value={hardware}
                      onChange={handleHardwareChange}
                    >
                      <option value=''>-- Select --</option>
                      <option value='x64'>x64</option>
                      <option value='x86'>x86</option>
                      <option value='x32'>x32</option>
                      <option value='arm64'>arm64</option>
                      <option value='amd64'>amd64</option>
                      <option value='itanium'>itanium</option>
                      <option value='arm'>arm</option>
                      <option value='rj45'>rj45</option>
                      <option value='iphone'>iphone</option>
                      <option value='android'>android</option>
                      <option value='*'>*</option>
                    </Select>
                  </Stack>
                </FormControl>
                {/* OTHERE */}
                <FormControl isDisabled={resolved}>
                  <FormLabel>Other</FormLabel>
                  <Input
                    size='md'
                    type='text'
                    value={other}
                    fontSize={'sm'}
                    onBlur={onBlurOther}
                    placeholder='Enter other'
                    onChange={(e) => handleOnChange(e.target.value, setOther)}
                  />
                </FormControl>
              </Grid>
            </Flex>
          </ModalBody>

          <ModalFooter>
            <Flex
              gap={2}
              width={'100%'}
              alignItems={'center'}
              justifyContent={'flex-end'}
            >
              <Button
                mr={'auto'}
                fontSize={'sm'}
                isLoading={isDisabled}
                onClick={handleRuleCreate}
                hidden={friendlyId ? false : true}
                isDisabled={isDisabled || isInvalid}
                colorScheme={ruleExists ? 'green' : 'blue'}
              >
                {ruleExists ? 'View' : 'Save as'} Rule
              </Button>
              <Button fontSize={'sm'} colorScheme='gray' onClick={onClose}>
                Cancel
              </Button>
              <Button
                fontSize={'sm'}
                variant='solid'
                colorScheme={'blue'}
                isDisabled={isInvalid || isDisabled}
                hidden={status === 'resolved'}
                onClick={friendlyId ? handleComUpdate : handleSave}
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

export default CpeModal
