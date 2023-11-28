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
  Text
} from '@chakra-ui/react'
import CpeInput from 'components/CpeInput'
import GlobalContext from 'context/GlobalContext'
import { CreateAutomation } from 'graphQL/Mutation'
import { UpdateComponent, recheckHealth } from 'graphQL/Mutation'
import { useState, useEffect, useRef, useContext } from 'react'
import { useLocation } from 'react-router-dom'
import ReactSelect from 'react-select'

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
  checkId,
  refetch,
  setPageIndex,
  getCpe,
  activeCheck
}) => {
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const sbomId = queryParams.get('sbom')
  const productId = queryParams.get('p')

  const [vendor, setVendor] = useState(null)
  const [vendorList, setVendorList] = useState([])
  const vendorRef = useRef()
  const [product, setProduct] = useState(null)
  const [productList, setProductList] = useState([])
  const productRef = useRef()
  const [type, setType] = useState('')
  const [version, setVersion] = useState(null)
  const [versionList, setVersionList] = useState([])
  const versionRef = useRef()
  const [hardware, setHardware] = useState('')
  
  const { cpeString, setCpeString } = useContext(GlobalContext)

  const [healthRecheck] = useMutation(recheckHealth, {
    onCompleted: () => refetch()
  })
  const [updateComponent] = useMutation(UpdateComponent)

  // UPDATE FIELDS DATA FROM API
  useEffect(() => {
    const matches = regexPattern.test(cpeValue)

    if (matches) {
      setCpeString(cpeValue)
      const components = cpeValue.split(':')
      setVendor(components[3])
      setProduct(components[4])
      setVersion(components[5])
      setHardware('*')
    }

    if (cpeValue === '') {
      setCpeString('cpe:2.3:a:calligra:calligra:2.4.1:*:*:*:*:*:*:*')
    }
  }, [cpeValue])

  // ON CPE SAVE
  const handleSave = () => {
    if (selectedCpe) {
      onUpdateCpe(cpeString, selectedCpe.id)
    } else {
      onCreateCpe(cpeString)
    }
    onClose()
  }

  // ON CPE UPDATE
  const handleComUpdate = async () => {
    try {
      await updateComponent({
        variables: {
          id: activeCheck.id,
          sbomId: sbomId,
          cpes: [cpeString]
        }
      })
        .then(() => {
          if (checkId) {
            setPageIndex(1)
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

  // ON VENDOR INPUT CHANGE
  const onVendorInputChange = (event) => {
    const { value } = event.target
    setVendor(value)
    getCpe({
      variables: {
        input: {
          idType: 'cpe',
          ecosystem: 'cpe',
          search: {
            vendor: value
          },
          hints: {
            cpe: {
              product: product ? product : '',
              version: version ? product : ''
            }
          }
        }
      }
    }).then((res) => {
      if (res.data) {
        setVendorList(res.data.idAutoComplete.result)
      }
    })
  }

  // ON TYPE CHANGE
  const handleTypeChange = (e) => {
    setType(e.target.value)
    const cpeParts = cpeString.split(':')
    cpeParts[2] = e.target.value
    const cpe = cpeParts.join(':')
    setCpeString(cpe)
  }

  // ON PRODUCT INPUT CHANGE
  const onProductInputChange = (event) => {
    const { value } = event.target
    setProduct(value)
    getCpe({
      variables: {
        input: {
          idType: 'cpe',
          ecosystem: 'cpe',
          search: {
            product: value
          },
          hints: {
            cpe: {
              vendor: vendor ? vendor : '',
              version: version ? version : ''
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

  // ON VERSION INPUT CHANGE
  const onVersionInputChange = (event) => {
    const { value } = event.target
    setVersion(value)
    getCpe({
      variables: {
        input: {
          idType: 'cpe',
          ecosystem: 'cpe',
          search: {
            version: value
          },
          hints: {
            cpe: {
              vendor: vendor ? vendor : '',
              product: product ? product : ''
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

  // ON HARDWARE CHANGE
  const handleHardwareChange = (e) => {
    const { value } = e.target
    setHardware(value)
    const cpeParts = cpeString.split(':')
    cpeParts[6] = value
    const cpe = cpeParts.join(':')
    setCpeString(cpe)
  }

  const [createAutoCheck] = useMutation(CreateAutomation)

  const onSaveRule = async () => {
    try {
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
    } catch (error) {
      console.log('Error', error)
    }
  }

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>CPE Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
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
                  isInvalid
                  errorBorderColor='blue.600'
                  disabled
                />
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
              {/* TYPE */}
              <FormControl>
                <FormLabel htmlFor='type'>Type</FormLabel>
                <Select
                  id='type'
                  name='type'
                  size='md'
                  fontSize={'sm'}
                  value={type}
                  onChange={handleTypeChange}
                >
                  <option value='a'>Application</option>
                  <option value='o'>Operating System</option>
                  <option value='h'>Hardware</option>
                </Select>
              </FormControl>
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
              {/* TARGET HARDWARE */}
              <FormControl>
                <FormLabel htmlFor='targetHardware'>Target Hardware</FormLabel>
                <Stack direction='column' spacing={1}>
                  <Select
                    size='md'
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
                <Button fontSize={'sm'} colorScheme='gray' onClick={onClose}>
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

export default CpeModal
