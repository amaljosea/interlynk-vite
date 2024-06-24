import { useMutation } from '@apollo/client'
import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { filterEnvList } from 'utils'

import {
  Alert,
  AlertIcon,
  AlertTitle,
  Box,
  Flex,
  FormControl,
  FormHelperText,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Progress,
  Select,
  Stack,
  Tag,
  Text,
  useToast
} from '@chakra-ui/react'

import { UploadSbom } from 'graphQL/Mutation'

const UploadModal = ({ data, isOpen, onClose, activeEnv }) => {
  const params = useParams()
  const toast = useToast()

  const { projects, name } = data || ''
  const environment = localStorage.getItem('environment')
  const defaultENV = data?.projects?.find((item) =>
    environment ? item?.name === environment : item?.name === 'default'
  )

  const [sbomUpload, { error, loading }] = useMutation(UploadSbom)

  const [selectedEnv, setSelectedEnv] = useState(activeEnv || defaultENV?.id)
  const [errorMessage, setErrorMessage] = useState('')

  const handleUpload = async (file) => {
    await sbomUpload({ variables: { doc: file, projectId: selectedEnv } })
      .then((res) => {
        if (res?.data?.sbomUpload.errors?.length > 0) {
          toast({
            description: 'Upload failed !',
            status: 'error',
            duration: 4000,
            isClosable: true,
            position: 'top'
          })
        } else {
          toast({
            title: 'SBOM uploaded successfully and is now processing',
            description:
              'The validated SBOM data will be available in the product shortly. Please refresh to update the product.',
            duration: 6500,
            isClosable: true,
            position: 'top',
            variant: 'left-accent'
          })
        }
      })
      .finally(() => onClose())
  }

  const [isDragActive, setIsDragActive] = useState(false)

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(false)
    const droppedFiles = Array.from(e.dataTransfer.files)
    if (droppedFiles?.length > 0) {
      const validExtensions = ['xml', 'json']
      const fileExtension = droppedFiles[0].name.split('.').pop().toLowerCase()
      if (validExtensions.includes(fileExtension)) {
        setErrorMessage('')
        handleUpload(droppedFiles[0])
      } else {
        setErrorMessage(
          'Invalid file type, only .xml and .json files are allowed.'
        )
      }
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

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Upload SBOM</ModalHeader>
          <ModalCloseButton onClick={() => setErrorMessage('')} />
          <ModalBody pb={4}>
            {!params?.productgroupid && (
              <Tag colorScheme='blue' mb={4}>
                <Text fontWeight={'medium'} wordBreak={'break-all'}>
                  {name}
                </Text>
              </Tag>
            )}
            {errorMessage !== '' && (
              <Alert status='error' mb={4} borderRadius={5}>
                <AlertIcon />
                <AlertTitle fontSize={'sm'} fontWeight={'medium'}>
                  {errorMessage}
                </AlertTitle>
              </Alert>
            )}
            <Stack spacing={6} mb={4}>
              <FormControl>
                <FormLabel>Environment</FormLabel>
                <Select
                  width={'400px'}
                  id='dataRetention'
                  value={selectedEnv}
                  onChange={(e) => setSelectedEnv(e.target.value)}
                  textTransform={'capitalize'}
                >
                  {projects?.length > 0 &&
                    filterEnvList(projects).map((item) => (
                      <option
                        key={item.id}
                        value={item.id}
                        style={{
                          textTransform: 'capitalize'
                        }}
                      >
                        {item.name}
                      </option>
                    ))}
                </Select>
                <FormHelperText>
                  Interlynk supports importing CycloneDX versions 1.2-1.5 in
                  JSON and XML formats and SPDX 2.2 and 2.3 in JSON format.{' '}
                </FormHelperText>
              </FormControl>
              <Box
                p={5}
                borderWidth={2}
                borderRadius='md'
                textAlign='center'
                overflow={'hidden'}
                onDrop={handleDrop}
                borderStyle='dashed'
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                borderColor={isDragActive ? 'teal.500' : 'gray.200'}
                onClick={() => document.getElementById('fileInput').click()}
              >
                <Input
                  id='fileInput'
                  type='file'
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                  accept='.json,application/json,application/xml,text/xml'
                />
                <Flex
                  height={32}
                  alignItems={'center'}
                  justifyContent={'center'}
                >
                  <Text hidden={loading}>
                    {isDragActive
                      ? 'Drop the files here ...'
                      : 'Drop SBOM here, or click to select a file'}
                  </Text>
                  <Text hidden={!loading}>Uploading ...</Text>
                </Flex>
              </Box>
              {loading && <Progress size='xs' isIndeterminate />}
            </Stack>
            {error && (
              <Box mb={4}>
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
