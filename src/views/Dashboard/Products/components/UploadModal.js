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
import GlobalContext from 'context/GlobalContext'
import { UploadSbom } from 'graphQL/Mutation'
import { useEffect, useContext } from 'react'
import { FaUpload } from 'react-icons/fa'

const UploadModal = ({ id, isOpen, onClose }) => {
  const toast = useToast()
  const { setSbomFile } = useContext(GlobalContext)
  const [sbomUpload, { data, loading, error }] = useMutation(UploadSbom)

  const handleFileChange = async (event) => {
    try {
      await sbomUpload({
        variables: {
          doc: event.target.files[0],
          projectId: id
        }
      })
        .then((res) => {
          if (res.data.sbomUpload.errors === '[]') {
            setSbomFile(res.data.sbomUpload.errors)
            toast({
              title: 'Data uploaded successfully',
              description:
                'Kindly consider refreshing the page after sometime, in order to verify the available data',
              duration: 6000,
              isClosable: true,
              position: 'top',
              variant: 'top-accent'
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
    } catch (error) {
      console.error('Mutation error:', error)
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
