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
  Checkbox,
  Flex,
  Input
} from '@chakra-ui/react'
import { useState, useEffect } from 'react'

const CpeModal = ({
  data,
  isOpen,
  onClose,
  onCreateCpe,
  onUpdateCpe,
  selectedCpe,
  cpeValue
}) => {
  const [vendor, setVendor] = useState('')
  const [product, setProduct] = useState('')
  const [version, setVersion] = useState('')
  const [hardware, setHardware] = useState('')

  const [updatedString, setUpdatedString] = useState(cpeValue)

  useEffect(() => {
    if (data) {
      setVendor(data.vendor)
      setProduct(data.product)
      setVersion(data.version)
      setHardware(data.targetHardware)
    }
  }, [data])

  const handleSave = () => {
    if (selectedCpe) {
      onUpdateCpe(updatedString, selectedCpe.id)
    } else {
      onCreateCpe(updatedString)
    }
    onClose()
  }

  const handleVendorChange = (e) => {
    setVendor(e.target.value)
    const cpeString = cpeValue.replace(data.vendor, e.target.value)
    setUpdatedString(cpeString)
  }

  const handleProductChange = (e) => {
    setProduct(e.target.value)
    const cpeString = cpeValue.replace(data.product, e.target.value)
    setUpdatedString(cpeString)
  }

  const handleVersionChange = (e) => {
    setVersion(e.target.value)
    const cpeString = cpeValue.replace(data.version, e.target.value)
    setUpdatedString(cpeString)
  }

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
          <ModalHeader>Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Flex width={'100%'} direction={'column'} gap={4}>
              {/* Vendor */}
              <FormControl>
                <Checkbox
                  size='md'
                  colorScheme='green'
                  defaultChecked={true}
                  readOnly
                >
                  Vendor
                </Checkbox>
                <Input
                  type='text'
                  mt={1.5}
                  value={vendor}
                  size='md'
                  onChange={handleVendorChange}
                />
              </FormControl>
              {/* Product */}
              <FormControl>
                <Checkbox
                  size='md'
                  colorScheme='green'
                  defaultChecked={true}
                  readOnly
                >
                  Product
                </Checkbox>
                <Input
                  type='text'
                  mt={1.5}
                  value={product}
                  size='md'
                  onChange={handleProductChange}
                />
              </FormControl>
              {/* Version */}
              <FormControl>
                <Checkbox
                  size='md'
                  colorScheme='green'
                  defaultChecked={true}
                  readOnly
                >
                  Version
                </Checkbox>
                <Input
                  type='text'
                  mt={1.5}
                  value={version}
                  size='md'
                  onChange={handleVersionChange}
                />
              </FormControl>
              {/* Hardware */}
              <FormControl>
                <FormLabel>
                  <Checkbox
                    size='md'
                    colorScheme='green'
                    defaultChecked={true}
                    readOnly
                  >
                    Target Hardware
                  </Checkbox>
                </FormLabel>
                <Select
                  size='md'
                  id='hardware'
                  name='hardware'
                  value={hardware}
                  onChange={handleHardwareChange}
                >
                  <option value=''>-- Select --</option>
                  <option value='x84'>x84</option>
                  <option value='x64'>x64</option>
                  <option value='solaris'>solaris</option>
                  <option value='*'>*</option>
                </Select>
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
              onClick={handleSave}
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
