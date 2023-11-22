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
  Textarea
} from '@chakra-ui/react'
import { UpdateComponent, recheckHealth } from 'graphQL/Mutation'
import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import ReactSelect from 'react-select'

const CpeModal = ({
  id,
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
  getCpe
}) => {
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const sbomId = queryParams.get('sbom')

  const [vendor, setVendor] = useState(null)
  const [vendorListData, setVendorListData] = useState([])
  const [product, setProduct] = useState(null)
  const [productList, setProductList] = useState([])
  const [type, setType] = useState('')
  const [version, setVersion] = useState(null)
  const [versionList, setVersionList] = useState([])
  const [hardware, setHardware] = useState('')

  const [updatedString, setUpdatedString] = useState(cpeValue.value)

  const [healthRecheck] = useMutation(recheckHealth, {
    onCompleted: () => refetch()
  })
  const [updateComponent] = useMutation(UpdateComponent)

  // UPDATE FIELDS DATA FROM API
  useEffect(() => {
    if (data) {
      setVendor(data.vendor)
      setProduct(data.product)
      setVersion(data.version)
      setHardware(data.targetHardware)
    }
  }, [data])

  useEffect(() => {
    if (updatedString) {
      const cpeParts = updatedString.split(':')
      setVendor({ value: cpeParts[3], label: cpeParts[3] })
      setVendorListData([{ value: cpeParts[3], label: cpeParts[3] }])
      setProduct({ value: cpeParts[4], label: cpeParts[4] })
      setProductList([{ value: cpeParts[4], label: cpeParts[4] }])
      setVersion({ value: cpeParts[5], label: cpeParts[5] })
      setVersionList([{ value: cpeParts[5], label: cpeParts[5] }])
    }
  }, [updatedString])

  // ON CPE SAVE
  const handleSave = () => {
    if (selectedCpe) {
      onUpdateCpe(updatedString, selectedCpe.id)
    } else {
      onCreateCpe(updatedString)
    }
    onClose()
  }

  // ON CPE UPDATE
  const handleComUpdate = async () => {
    try {
      await updateComponent({
        variables: {
          id: id,
          sbomId: sbomId,
          cpes: [updatedString]
        }
      })
        .then(() => {
          if (checkId) {
            setPageIndex(1)
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

  // ON VENDOR INPUT CHANGE
  const onVendorInputChange = (value) => {
    console.log('value', value)
    if (value !== '') {
      getCpe({
        variables: {
          input: {
            idType: 'cpe',
            ecosystem: 'cpe',
            idUri: '',
            search: {
              vendor: value
            }
          }
        }
      }).then((res) => {
        if (res.data) {
          const vendorList = res.data.idAutoComplete.result.map((item) => ({
            value: item,
            label: item
          }))
          setVendorListData(vendorList)
        }
      })
    }
  }

  // ON VENDOR SELECT
  const onVendorChange = (selectedOption, triggeredAction) => {
    console.log('selectedOption', selectedOption)
    console.log('triggeredAction', triggeredAction)
    if (triggeredAction.action === 'clear') {
      setVendor(null)
      setVendorListData([])
    } else {
      setVendor(selectedOption)
      const cpeParts = updatedString.split(':')
      cpeParts[3] = selectedOption.value
      const cpeString = cpeParts.join(':')
      setUpdatedString(cpeString)
    }
  }

  // ON TYPE CHANGE
  const handleTypeChange = (e) => {
    setType(e.target.value)
    const cpeParts = updatedString.split(':')
    cpeParts[2] = e.target.value
    const cpeString = cpeParts.join(':')
    // console.log('CPE String: ' + cpeString)
    setUpdatedString(cpeString)
  }

  // ON PRODUCT INPUT CHANGE
  const onProductInputChange = (value) => {
    if (value !== '') {
      getCpe({
        variables: {
          input: {
            idType: 'cpe',
            ecosystem: 'cpe',
            idUri: '',
            search: {
              product: value
            }
          }
        }
      }).then((res) => {
        if (res.data) {
          const prodList = res.data.idAutoComplete.result.map((item) => ({
            value: item,
            label: item
          }))
          setProductList(prodList)
        }
      })
    }
  }

  // ON PRODUCT SELECT
  const onProductChange = (selectedOption, triggeredAction) => {
    if (triggeredAction.action === 'clear') {
      setProduct(null)
      setProductList([])
    } else {
      setProduct(selectedOption)
      const cpeParts = updatedString.split(':')
      cpeParts[4] = selectedOption.value
      const cpeString = cpeParts.join(':')
      setUpdatedString(cpeString)
    }
  }

  // ON VERSION INPUT CHANGE
  const onVersionInputChange = (value) => {
    if (value !== '') {
      getCpe({
        variables: {
          input: {
            idType: 'cpe',
            ecosystem: 'cpe',
            idUri: '',
            search: {
              version: value
            }
          }
        }
      }).then((res) => {
        if (res.data) {
          const versionList = res.data.idAutoComplete.result.map((item) => ({
            value: item,
            label: item
          }))
          setVersionList(versionList)
        }
      })
    }
  }

  // ON VERSION SELECT
  const onVersionChange = (selectedOption, triggeredAction) => {
    if (triggeredAction.action === 'clear') {
      setVersion(null)
      setVersionList([])
    } else {
      setVersion(selectedOption)
      const cpeParts = updatedString.split(':')
      cpeParts[5] = selectedOption.value
      const cpeString = cpeParts.join(':')
      setUpdatedString(cpeString)
    }
  }

  // ON HARDWARE CHANGE
  const handleHardwareChange = (e) => {
    setHardware(e.target.value)
    const cpeString = cpeValue.replace(data.targetHardware, e.target.value)
    setUpdatedString(cpeString)
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
                  value={updatedString}
                  fontSize='16px'
                  fontStyle={'bold'}
                  color='black'
                  isInvalid
                  errorBorderColor='blue.600'
                  disabled
                />
              </FormControl>
              {/* VENDOR */}
              <FormControl>
                <FormLabel htmlFor='vendor'>Vendor</FormLabel>
                <ReactSelect
                  styles={{
                    control: (baseStyles, state) => ({
                      ...baseStyles,
                      borderColor: state.isFocused ? 'inherit' : 'inherit',
                      padding: '2px 5px',
                      fontSize: '14px',
                      '&:hover': {
                        borderColor: '#CBD5E0'
                      }
                    })
                  }}
                  id='vendor'
                  name='vendor'
                  placeholder='Add vendor'
                  value={vendor}
                  options={vendorListData}
                  isClearable
                  components={{
                    DropdownIndicator: () => null,
                    IndicatorSeparator: () => null
                  }}
                  className='react-select'
                  onChange={onVendorChange}
                  onInputChange={onVendorInputChange}
                />
              </FormControl>
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
              <FormControl>
                <FormLabel htmlFor='product'>Product</FormLabel>
                <ReactSelect
                  styles={{
                    control: (baseStyles, state) => ({
                      ...baseStyles,
                      borderColor: state.isFocused ? 'inherit' : 'inherit',
                      padding: '2px 5px',
                      fontSize: '14px',
                      '&:hover': {
                        borderColor: '#CBD5E0'
                      }
                    })
                  }}
                  id='product'
                  name='product'
                  placeholder='Add product'
                  value={product}
                  options={productList}
                  isClearable
                  components={{
                    DropdownIndicator: () => null,
                    IndicatorSeparator: () => null
                  }}
                  className='react-select'
                  onChange={onProductChange}
                  onInputChange={onProductInputChange}
                />
              </FormControl>
              {/* VERSION */}
              <FormControl>
                <FormLabel htmlFor='version'>Version</FormLabel>
                <ReactSelect
                  styles={{
                    control: (baseStyles, state) => ({
                      ...baseStyles,
                      borderColor: state.isFocused ? 'inherit' : 'inherit',
                      padding: '2px 5px',
                      fontSize: '14px',
                      '&:hover': {
                        borderColor: '#CBD5E0'
                      }
                    })
                  }}
                  id='version'
                  name='version'
                  placeholder='Add version'
                  value={version}
                  options={versionList}
                  isClearable
                  components={{
                    DropdownIndicator: () => null,
                    IndicatorSeparator: () => null
                  }}
                  className='react-select'
                  onChange={onVersionChange}
                  onInputChange={onVersionInputChange}
                />
              </FormControl>
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

export default CpeModal
