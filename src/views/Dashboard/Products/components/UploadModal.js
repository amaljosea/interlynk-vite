import { useMutation } from '@apollo/client'
import {
  Box,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Progress,
  useToast
} from '@chakra-ui/react'
import {
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton
} from '@chakra-ui/react'
import { UploadSbom } from 'graphQL/Mutation'
import { useEffect, useState } from 'react'
import { FaUpload } from 'react-icons/fa'

const UploadModal = ({ id, isOpen, onClose }) => {
  const toast = useToast()
  const [sbomUpload, { data }] = useMutation(UploadSbom)

  const [file, setFile] = useState(null)
  const [progress, setProgress] = useState(0)
  const [fileName, setFileName] = useState('')

  const uploadData = async (e) => {
    console.log(e)
    try {
      await sbomUpload({
        variables: {
          doc: e,
          projectId: id
        }
      }).then((res) => {
        const uploadTask = setInterval(() => {
          setProgress((prevProgress) => {
            if (prevProgress >= 100) {
              clearInterval(uploadTask)
              // console.log(`data`, res)
              return 100
            }
            return prevProgress + 10
          })
        }, 1000)
      })
      // .finally(() => console.log(`data`, data))
    } catch (error) {
      console.error('Mutation error:', error)
    }
  }

  const handleFileChange = (event) => {
    setFile(event.target.files[0])
    uploadData(event.target.files[0])
  }

  const handleSubmit = () => {
    setFile(null)
    if (data && data.sbomUpload.errors === '[]') {
      toast({
        description: 'Data uploaded successfully',
        status: 'success',
        duration: 9000,
        isClosable: true,
        position: 'top'
      })
      onClose()
    } else {
      toast({
        description: 'Upload failed !',
        status: 'error',
        duration: 9000,
        isClosable: true,
        position: 'top'
      })
    }
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
            <Box mt={4}>
              {file && (
                <Flex direction={'column'} gap={4}>
                  <p>Uploading: {file.name}</p>
                  <Progress value={progress} />
                </Flex>
              )}
            </Box>
            {progress === 100 && (
              <FormControl isRequired mt={4}>
                <Input
                  type='email'
                  size='lg'
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  placeholder='Enter file name'
                />
              </FormControl>
            )}
          </ModalBody>
          <ModalFooter>
            <Button colorScheme='blue' borderRadius={8} onClick={handleSubmit}>
              Submit
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

export default UploadModal
