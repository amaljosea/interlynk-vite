import { useMutation } from '@apollo/client'
import {
  Box,
  Flex,
  FormLabel,
  Input,
  Alert,
  AlertIcon,
  AlertTitle,
  Text,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Progress
} from '@chakra-ui/react'
import { UploadSbom } from 'graphQL/Mutation'
import { useState } from 'react'
import { FaUpload } from 'react-icons/fa'

const UploadModal = ({ id, isOpen, onClose }) => {
  const toast = useToast()
  const [sbomUpload, { loading, error }] = useMutation(UploadSbom)
  const [errorMessage, setErrorMessage] = useState('')

  const handleUpload = async (file) => {
    await sbomUpload({
      variables: {
        doc: file,
        projectId: id
      }
    })
      .then((res) => {
        if (res.data.sbomUpload.errors === '[]') {
          toast({
            title: 'SBOM uploaded successfully and is now processing',
            description:
              'The validated SBOM data will be available in the product shortly. Please refresh to update the product.',
            duration: 6500,
            isClosable: true,
            position: 'top',
            variant: 'left-accent'
          })
        } else {
          toast({
            description: 'Upload failed !',
            status: 'error',
            duration: 4000,
            isClosable: true,
            position: 'top'
          })
        }
      })
      .finally(() => onClose())
  }

  const handleFileChange = async (event) => {
    const selectedFile = event.target.files[0]
    if (selectedFile) {
      const validExtensions = ['xml', 'json']
      const fileExtension = selectedFile.name.split('.').pop().toLowerCase()
      console.log(`fileExtension`, fileExtension)
      if (validExtensions.includes(fileExtension)) {
        setErrorMessage('')
        handleUpload(selectedFile)
      } else {
        setErrorMessage(
          'Invalid file type, only .xml and .json files are allowed.'
        )
      }
    }
  }

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Upload SBOM</ModalHeader>
          <ModalCloseButton onClick={() => setErrorMessage('')} />
          <ModalBody pb={4}>
            {errorMessage !== '' && (
              <Alert status='error' mb={4} borderRadius={5}>
                <AlertIcon />
                <AlertTitle fontSize={'sm'} fontWeight={'medium'}>
                  {errorMessage}
                </AlertTitle>
              </Alert>
            )}
            <Box>
              <Text fontSize={'sm'} mb={5}>
                Interlynk supports importing CycloneDX versions 1.2-1.5 in JSON
                and XML formats and SPDX 2.2 and 2.3 in JSON format.{' '}
              </Text>
              <FormLabel htmlFor='file' width={'100%'} cursor={'pointer'}>
                <Input
                  type='file'
                  id='file'
                  style={{ display: 'none' }}
                  accept='.xml,.json'
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
              <Box my={5}>
                <Progress size='xs' isIndeterminate />
              </Box>
            )}
            {error && (
              <Box my={4}>
                <Text>Something went wrong!!</Text>
              </Box>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  )
}

export default UploadModal
