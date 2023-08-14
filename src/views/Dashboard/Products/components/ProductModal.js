import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Alert,
  AlertIcon,
  Text
} from '@chakra-ui/react'
import GlobalContext from 'context/GlobalContext'
import { useState, useContext, useEffect } from 'react'
import { FaGithub } from 'react-icons/fa'
import { v4 as uuidv4 } from 'uuid'

const ProductModal = ({ isOpen, onClose, product, vendorName }) => {
  const { productVersionExploded, setProductVersionExploded } = useContext(
    GlobalContext
  )

  const [productName, setProductName] = useState('')
  const [vendor, setVendor] = useState('')
  const [uniqueId, setUniqueId] = useState('')

  useEffect(() => {
    setProductName(product)
    setVendor(vendorName)
  }, [isOpen])

  const [error, setError] = useState('')

  const productExist = productVersionExploded.find(
    (item) => item.name === `${productName}`
  )

  const handleSave = (e) => {
    e.preventDefault()
    if (!productExist) {
      setProductVersionExploded((prev) => [
        {
          id: uuidv4(),
          logo: FaGithub,
          name: productName,
          description:
            'A tool to compose your various sboms into a single sbom',
          version: 'v0',
          vendor: vendor,
          quality_score: 0,
          sbom_links: 0,
          risk_score: 'Not Defined',
          updated_at: new Date().toISOString(),
          active: true,
          source: 'Assembled'
        },
        ...prev
      ])

      setProductName('')
      setVendor('')
      setUniqueId('')
      onClose()
    } else {
      setError(
        `A project with same name already exists. Please choose a unique name`
      )
      setProductName('')
    }
  }

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <form onSubmit={handleSave}>
          <ModalContent>
            <ModalHeader>Add Product</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Flex width={'100%'} direction={'column'} gap={4}>
                {error !== '' && (
                  <Alert status='error'>
                    <AlertIcon />
                    <Text fontSize={'sm'}>{error}</Text>
                  </Alert>
                )}
                <FormControl isRequired>
                  <FormLabel>Name</FormLabel>
                  <Input
                    type='text'
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder='Enter name'
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Vendor</FormLabel>
                  <Input
                    type='text'
                    value={vendor}
                    onChange={(e) => setVendor(e.target.value)}
                    placeholder='Enter vendor name'
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Unique Identifier</FormLabel>
                  <Input
                    type='text'
                    value={uniqueId}
                    onChange={(e) => setUniqueId(e.target.value)}
                  />
                </FormControl>
              </Flex>
            </ModalBody>
            <ModalFooter>
              <Button colorScheme='gray' mr={3} onClick={onClose}>
                Cancel
              </Button>
              <Button colorScheme='blue' type='submit'>
                Save
              </Button>
            </ModalFooter>
          </ModalContent>
        </form>
      </Modal>
    </>
  )
}

export default ProductModal
