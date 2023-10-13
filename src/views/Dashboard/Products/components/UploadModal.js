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
  ModalCloseButton
} from '@chakra-ui/react'
import { UploadSbom } from 'graphQL/Mutation'
import { useState } from 'react'
import { FaUpload } from 'react-icons/fa'

const UploadModal = ({ id, isOpen, onClose }) => {
  const toast = useToast()
  const [sbomUpload, { data, loading, error }] = useMutation(UploadSbom)
  const [errorMessage, setErrorMessage] = useState('')

  const handleUpload = async (file) => {
    try {
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
                'The validated SBOM data will be available in the product shortly',
              duration: 6000,
              isClosable: true,
              position: 'bottom',
              variant: 'left-accent'
            })
          } else {
            toast({
              description: 'Upload failed !',
              status: 'error',
              duration: 4000,
              isClosable: true,
              position: 'bottom'
            })
          }
        })
        .finally(() => onClose())
    } catch (error) {
      console.error('Mutation error:', error)
    }
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

  // useEffect(() => {
  //   if (data) {
  //     console.log('Data', data.sbomUpload)
  //   }
  // }, [data])

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Upload SBOM</ModalHeader>
          <ModalCloseButton onClick={() => setErrorMessage('')} />
          <ModalBody>
            {errorMessage !== '' && (
              <Alert status='error' mb={4} borderRadius={5}>
                <AlertIcon />
                <AlertTitle fontSize={'sm'} fontWeight={'medium'}>
                  {errorMessage}
                </AlertTitle>
              </Alert>
            )}
            <Box>
              <FormLabel htmlFor='file' width={'100%'}>
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
          {/* <ModalFooter>
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
          </ModalFooter> */}
        </ModalContent>
      </Modal>
    </>
  )
}

export default UploadModal
