import {
  Box,
  Flex,
  FormControl,
  FormLabel,
  IconButton,
  Input,
  Progress,
  useDisclosure
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
import { useEffect, useState } from 'react'
import { FaUpload } from 'react-icons/fa'
import { useLocation } from 'react-router-dom'

const FileUpload = () => {
  const {
    isOpen: isUploadOpen,
    onOpen: onUploadOpen,
    onClose: onUploadClose
  } = useDisclosure()

  const location = useLocation()

  const [file, setFile] = useState(null)
  const [progress, setProgress] = useState(0)
  const [fileName, setFileName] = useState('')

  const handleFileChange = (event) => {
    setFile(event.target.files[0])
    const uploadTask = setInterval(() => {
      setProgress((prevProgress) => {
        if (prevProgress >= 100) {
          clearInterval(uploadTask)
          return 100
        }
        return prevProgress + 10
      })
    }, 1000)
  }

  const handleSubmit = () => {
    setFile(null)
    onUploadClose()
  }

  // useEffect(() => {
  //   console.log('progress', progress)
  // }, [progress])

  return (
    <>
      {location.pathname.startsWith('/customer') ? (
        <IconButton
          aria-label='Download SBOM'
          icon={<FaUpload />}
          onClick={onUploadOpen}
          size='md'
          colorScheme='blue'
        />
      ) : (
        <Button
          onClick={onUploadOpen}
          leftIcon={<FaUpload />}
          colorScheme='green'
          size='sm'
          variant='solid'
          borderRadius='6px'
        >
          Upload
        </Button>
      )}
      <Modal isOpen={isUploadOpen} onClose={onUploadClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Upload SBOM</ModalHeader>
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

export default FileUpload
