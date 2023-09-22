import { useQuery } from '@apollo/client'
import {
  Alert,
  AlertIcon,
  Button,
  Code,
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
  Stack,
  Text
} from '@chakra-ui/react'
import { GetProjectData } from 'graphQL/Queries'
import { useEffect } from 'react'
import { useState } from 'react'

const CopyModal = ({ isOpen, onClose, product, version }) => {
  const [message, setMessage] = useState('')
  const [selectedProduct, setSelectedProduct] = useState('')
  const [selectedVersion, setSelectedVersion] = useState('')
  const [filteredData, setFilteredData] = useState()

  const { data } = useQuery(GetProjectData, {
    variables: {
      first: 10
    }
  })

  useEffect(() => {
    if (data) {
      const prod = data.projects.nodes.find((item) => item.name === product)
      console.log(`filteredData`, prod)
      setFilteredData(prod.name)
      setSelectedProduct(prod.id)
    }
  }, [product])

  const handleSave = (e) => {
    e.preventDefault()
    setMessage(
      `You are about to copy all metadata, components and relationships of SBOM ${product}:${version} to ${filteredData}:${selectedVersion}`
    )
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onClose()
  }

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <form onSubmit={message === '' ? handleSave : handleSubmit}>
          <ModalContent>
            <ModalHeader>Copy SBOM</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Text mt={2}>
                Copy{' '}
                <strong>
                  {product}:{version}
                </strong>{' '}
                SBOM Content to :
              </Text>
              <Flex flexDir={'column'} gap={5} mt={6}>
                {data && (
                  <FormControl isRequired>
                    <FormLabel fontSize={16}>Product</FormLabel>
                    <Select
                      name='product'
                      value={selectedProduct}
                      onChange={(e) => setSelectedProduct(e.target.value)}
                    >
                      {data.projects.nodes.length > 0 &&
                        data.projects.nodes.map((pv, index) => (
                          <option value={pv.id} key={index}>
                            {pv.name}
                          </option>
                        ))}
                    </Select>
                  </FormControl>
                )}

                <FormControl isRequired>
                  <FormLabel fontSize={16}>Version</FormLabel>
                  <Input
                    type='text'
                    value={selectedVersion}
                    placeholder='Add version'
                    onChange={(e) => setSelectedVersion(e.target.value)}
                  />
                </FormControl>

                {message !== '' && (
                  <Alert status='info'>
                    <Stack direction={'column'} gap={2}>
                      <Text fontSize={'sm'}>{message}</Text>
                      <Text fontSize={'sm'}>
                        Are you sure you want to continue ?
                      </Text>
                    </Stack>
                  </Alert>
                )}
              </Flex>
            </ModalBody>
            <ModalFooter>
              <Button colorScheme='gray' mr={3} onClick={onClose}>
                Cancel
              </Button>
              {message === '' ? (
                <Button colorScheme='blue' type='submit'>
                  Copy
                </Button>
              ) : (
                <Button colorScheme='blue' type={'submit'}>
                  Yes
                </Button>
              )}
            </ModalFooter>
          </ModalContent>
        </form>
      </Modal>
    </>
  )
}

export default CopyModal
