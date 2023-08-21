import { useMutation } from '@apollo/client'
import {
  Box,
  Button,
  Flex,
  FormLabel,
  Input,
  ModalFooter,
  Text,
  useToast
} from '@chakra-ui/react'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton
} from '@chakra-ui/react'
import { UploadSbom } from 'graphQL/Mutation'
import { useEffect, useState } from 'react'
import { FaUpload } from 'react-icons/fa'

const UploadModal = ({ id, isOpen, onClose, fetchProjects }) => {
  const toast = useToast()
  const [sbomUpload, { data, loading, error }] = useMutation(UploadSbom)

  const uploadData = async (e) => {
    console.log(e)
    try {
      await sbomUpload({
        variables: {
          doc: e,
          projectId: id
        }
      }).then((res) => {
        if (res.data.sbomUpload.errors === '[]') {
          toast({
            description: 'Data uploaded successfully',
            status: 'success',
            duration: 9000,
            isClosable: true,
            position: 'top'
          })
        } else {
          toast({
            description: 'Upload failed !',
            status: 'error',
            duration: 9000,
            isClosable: true,
            position: 'top'
          })
        }
      })
    } catch (error) {
      console.error('Mutation error:', error)
    }
  }

  const handleFileChange = (event) => {
    uploadData(event.target.files[0])
  }

  useEffect(() => {
    if (data) {
      console.log('Data', data.sbomUpload)
    }
  }, [data])

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Upload your SBOM</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Box>
              <FormLabel htmlFor='file'>
                <Input
                  type='file'
                  id='file'
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                />
                <Flex
                  p={10}
                  border={'1px dotted lightgray'}
                  borderWidth={'3px'}
                  rounded={'lg'}
                  alignItems={'center'}
                  justifyContent={'center'}
                >
                  <FaUpload color='darkgray' size={32} />
                </Flex>
              </FormLabel>
            </Box>
            {loading && (
              <Box my={4}>
                <Text>Uploading...</Text>
              </Box>
            )}
            {error && (
              <Box my={4}>
                <Text>Something went wrong!!</Text>
              </Box>
            )}
          </ModalBody>
          <ModalFooter>
            <Button
              colorScheme='blue'
              borderRadius={8}
              onClick={() => {
                onClose()
                fetchProjects()
              }}
              disabled={!data}
            >
              Save
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

export default UploadModal
