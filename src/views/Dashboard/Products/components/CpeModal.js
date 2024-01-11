import { useMutation } from '@apollo/client'
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
  Stack,
  Flex,
  Textarea,
  Text,
  Alert,
  AlertIcon,
  AlertDescription,
  Tag,
  FormErrorMessage,
  Grid,
  Input
} from '@chakra-ui/react'
import CpeInput from 'components/CpeInput'
import { CreateAutomation } from 'graphQL/Mutation'
import { UpdateComponent, recheckHealth } from 'graphQL/Mutation'
import { useGlobalState } from 'hooks/useGlobalState'
import { useState, useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { validateCpe } from 'utils'

const regexPattern =
  /cpe:2\.3:[aho\*\-](:(((\?*|\*?)([a-zA-Z0-9\-\._]|(\\[\\\*\?!"#$$%&'\(\)\+,\/:;<=>@\[\]\^`\{\|}~]))+(\?*|\*?))|[\*\-])){5}(:(([a-zA-Z]{2,3}(-([a-zA-Z]{2}|[0-9]{3}))?)|[\*\-]))(:(((\?*|\*?)([a-zA-Z0-9\-\._]|(\\[\\\*\?!"#$$%&'\(\)\+,\/:;<=>@\[\]\^`\{\|}~]))+(\?*|\*?))|[\*\-])){4}/

const CpeModal = ({
  data,
  isOpen,
  onClose,
  onCreateCpe,
  onUpdateCpe,
  selectedCpe,
  cpeValue,
  activeComp,
  checkId,
  refetch,
  getCpe,
  activeCheck
}) => {
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const sbomId = queryParams.get('sbom')
  const productId = queryParams.get('id')

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

  const { prodCompState, dispatch } = useGlobalState()
  const { cpeString } = prodCompState
  const { prodCompDispatch, prodCheckDispatch } = dispatch

  const [healthRecheck] = useMutation(recheckHealth, {
    onCompleted: () => refetch()
  })
  const [updateComponent] = useMutation(UpdateComponent)

  // UPDATE FIELDS DATA FROM API
  useEffect(() => {
    const matches = regexPattern.test(cpeValue)
    if (cpeValue !== '') {
      prodCompDispatch({ type: 'SET_CPE_STRING', payload: cpeValue })
      const components = cpeValue.split(':')
      setType(components[2])
      setVendor(components[3] === '*' ? '' : components[3])
      setProduct(components[4] === '*' ? '' : components[4])
      setVersion(components[5] === '*' ? '' : components[5])
      setUpdate(components[6] === '*' ? '' : components[6])
      setEdition(components[7] === '*' ? '' : components[7])
      setLanguage(components[8] === '*' ? '' : components[8])
      setSwEdition(components[9] === '*' ? '' : components[9])
      setTargetSoftware(components[10] === '*' ? '' : components[10])
      setHardware(components[11] === '*' ? '' : components[11])
      setOther(components[12] === '*' ? '' : components[12])
    } else {
      prodCompDispatch({
        type: 'SET_CPE_STRING',
        payload: 'cpe:2.3:*:*:*:*:*:*:*:*:*:*:'
      })
    }
  }, [cpeValue])

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
    // if (validateCpe(cpeString)) {
    const cpeParts = cpeString.split(':')
    cpeParts[2] = type === '' ? '*' : type
    cpeParts[3] = vendor === '' ? '*' : vendor
    cpeParts[4] = product === '' ? '*' : product
    cpeParts[5] = version === '' ? '*' : version
    cpeParts[6] = update === '' ? '*' : update
    cpeParts[7] = edition === '' ? '*' : edition
    cpeParts[8] = language === '' ? '*' : language
    cpeParts[9] = swEdition === '' ? '*' : swEdition
    cpeParts[10] = targetSoftware === '' ? '*' : targetSoftware
    cpeParts[11] = hardware === '' ? '*' : hardware
    cpeParts[12] = other === '' ? '*' : other
    const cpe = cpeParts.join(':')
    if (selectedCpe) {
      onUpdateCpe(cpe, selectedCpe.id)
    } else {
      onCreateCpe(cpe)
    }
    onClose()
    // } else {
    //   setError('Invalid CPE')
    // }
  }

  // ON CPE UPDATE
  const handleComUpdate = async () => {
    // if (validateCpe(cpeString)) {
    await updateComponent({
      variables: {
        id: activeCheck.id,
        sbomId: sbomId,
        cpes: [cpeString]
      }
    })
      .then(() => {
        if (checkId) {
          prodCheckDispatch({
            type: 'FETCH_DATA_SUCCESS'
          })
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
    // } else {
    //   setError('Invalid CPE')
    // }
  }

  // ON VENDOR INPUT CHANGE
  const onVendorInputChange = (event) => {
    const { value } = event.target
    const val = value.replace(/\s/g, '')
    if (val.includes('*')) {
      return
    }

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

  // ON TYPE CHANGE
  const handleTypeChange = (e) => {
    const { value } = e.target
    setType(value)
    if (value !== '') {
      const cpeParts = cpeString.split(':')
      cpeParts[2] = e.target.value
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
    if (val.includes('*')) {
      return
    }
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

  // ON VERSION INPUT CHANGE
  const onVersionInputChange = (event) => {
    const { value } = event.target
    const val = value.replace(/\s/g, '')
    if (val.includes('*')) {
      return
    }
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

  const [createAutoCheck] = useMutation(CreateAutomation)

  const onSaveRule = async () => {
    if (validateCpe(cpeString)) {
      await createAutoCheck({
        variables: {
          projectId: productId,
          applicable: 'component',
          condition: 'missing',
          attr: 'cpe',
          enabled: true,
          compName: activeCheck.name,
          compVersion: activeCheck.version,
          set: JSON.stringify(
            {
              value: cpeString
            },
            null,
            2
          )
        }
      }).then((res) => res.data && handleComUpdate())
    } else {
      setError('Invalid CPE')
    }
  }

  const isInvalid =
    vendor === '' ||
    product === '' ||
    type === '' ||
    vendor.includes(':') ||
    product.includes(':') ||
    version.includes(':') ||
    error !== ''

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} size={'2xl'}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>CPE Details</ModalHeader>
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
              {/* CPE STRING */}
              <FormControl>
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
                <FormControl>
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
                  inputValue={vendor}
                  setInputValue={setVendor}
                  cpeList={vendorList}
                  setCpeList={setVendorList}
                  inputRef={vendorRef}
                  validation={false}
                  onChange={onVendorInputChange}
                />
                {vendor !== '' && vendor.includes(':') && (
                  <Alert size={'sm'} status='error'>
                    <AlertIcon />
                    <AlertDescription fontSize={'sm'}>
                      Invalid entry
                    </AlertDescription>
                  </Alert>
                )}
                {/* PRODUCT */}
                <CpeInput
                  name='product'
                  inputValue={product}
                  setInputValue={setProduct}
                  cpeList={productList}
                  setCpeList={setProductList}
                  inputRef={productRef}
                  validation={false}
                  onChange={onProductInputChange}
                />
                {product !== '' && product.includes(':') && (
                  <Alert size={'sm'} status='error'>
                    <AlertIcon />
                    <AlertDescription fontSize={'sm'}>
                      Invalid entry
                    </AlertDescription>
                  </Alert>
                )}
                {/* VERSION */}
                <CpeInput
                  name='version'
                  inputValue={version}
                  setInputValue={setVersion}
                  cpeList={versionList}
                  setCpeList={setVersionList}
                  inputRef={versionRef}
                  validation={false}
                  onChange={onVersionInputChange}
                />
                {version !== '' && version.includes(':') && (
                  <Alert size={'sm'} status='error'>
                    <AlertIcon />
                    <AlertDescription fontSize={'sm'}>
                      Invalid entry
                    </AlertDescription>
                  </Alert>
                )}
                {/* UPDATE */}
                <FormControl>
                  <FormLabel>Update</FormLabel>
                  <Input
                    type='text'
                    value={update}
                    size='md'
                    fontSize={'sm'}
                    onChange={(e) => setUpdate(e.target.value)}
                    onBlur={onBlurUpdate}
                    placeholder='Enter update'
                  />
                </FormControl>
                {/* EDITION */}
                <FormControl>
                  <FormLabel>Edition</FormLabel>
                  <Input
                    type='text'
                    value={edition}
                    size='md'
                    fontSize={'sm'}
                    onChange={(e) => setEdition(e.target.value)}
                    onBlur={onBlurEdition}
                    placeholder='Enter edition'
                  />
                </FormControl>
                {/* LANGUAGE */}
                <FormControl>
                  <FormLabel>Language</FormLabel>
                  <Input
                    type='text'
                    value={language}
                    size='md'
                    fontSize={'sm'}
                    onChange={(e) => setLanguage(e.target.value)}
                    onBlur={onBlurLanguage}
                    placeholder='Enter language'
                  />
                </FormControl>
                {/* SW EDITION */}
                <FormControl>
                  <FormLabel>SW Edition</FormLabel>
                  <Input
                    type='text'
                    value={swEdition}
                    size='md'
                    fontSize={'sm'}
                    onChange={(e) => setSwEdition(e.target.value)}
                    onBlur={onBlurSwEdition}
                    placeholder='Enter sw edition'
                  />
                </FormControl>
                {/* TARGET SOFTWARE */}
                <FormControl>
                  <FormLabel>Target Software</FormLabel>
                  <Input
                    type='text'
                    value={targetSoftware}
                    size='md'
                    fontSize={'sm'}
                    onChange={(e) => setTargetSoftware(e.target.value)}
                    onBlur={onBlurTargetSoftware}
                    placeholder='Enter target software'
                  />
                </FormControl>
                {/* TARGET HARDWARE */}
                <FormControl>
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
                <FormControl>
                  <FormLabel>Other</FormLabel>
                  <Input
                    type='text'
                    value={other}
                    size='md'
                    fontSize={'sm'}
                    onChange={(e) => setOther(e.target.value)}
                    onBlur={onBlurOther}
                    placeholder='Enter other'
                  />
                </FormControl>
              </Grid>
            </Flex>
          </ModalBody>

          <ModalFooter>
            <Flex
              width={'100%'}
              justifyContent={'space-between'}
              alignItems={'center'}
            >
              {checkId ? (
                <Button
                  fontSize={'sm'}
                  colorScheme='blue'
                  onClick={onSaveRule}
                  disabled={isInvalid}
                >
                  Save Rule
                </Button>
              ) : (
                <Text></Text>
              )}
              <Stack direction={'row'} spacing={2} alignItems={'center'}>
                <Button fontSize={'sm'} colorScheme='gray' onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  fontSize={'sm'}
                  variant='solid'
                  colorScheme={'blue'}
                  onClick={checkId ? handleComUpdate : handleSave}
                  disabled={isInvalid}
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

export default CpeModal
