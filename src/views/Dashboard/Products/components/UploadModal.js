import { useMutation } from '@apollo/client'
import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { filterEnvList } from 'utils'

import {
  Box,
  Flex,
  FormControl,
  FormHelperText,
  FormLabel,
  Input,
  Progress,
  Select,
  Stack,
  Tag,
  Text,
  useColorModeValue
} from '@chakra-ui/react'

import LynkAlert from 'components/LynkAlert'
import LynkModal from 'components/LynkModal'

import useCustomToast from 'hooks/useCustomToast'
import { useGlobalState } from 'hooks/useGlobalState'

import { UploadSbom } from 'graphQL/Mutation'

import { PiFileArrowUpBold } from 'react-icons/pi'

const UploadModal = ({ data, isOpen, onClose, activeEnv }) => {
  const params = useParams()
  const { showToast } = useCustomToast()
  const borderColor = useColorModeValue('#A0AEC066', 'gray.600')
  const textColor = useColorModeValue('#1A202C99', 'gray.600')
  const highlightedTextColor = useColorModeValue('blue.600', 'blue.300') // New highlighted text color
  const { envName } = useGlobalState()

  const { projects, name } = data || ''
  const environment = envName
  const defaultENV = data?.projects?.find((item) =>
    environment ? item?.name === environment : item?.name === 'default'
  )

  const [sbomUpload, { error, loading }] = useMutation(UploadSbom)

  const [selectedEnv, setSelectedEnv] = useState(activeEnv || defaultENV?.id)
  const [errorMessage, setErrorMessage] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)

  const handleUpload = async () => {
    if (!selectedFile) {
      setErrorMessage('No file selected')
      return
    }

    await sbomUpload({
      variables: { doc: selectedFile, projectId: selectedEnv }
    })
      .then((res) => {
        if (res?.data?.sbomUpload.errors?.length > 0) {
          showToast({
            description: 'Upload failed !',
            status: 'error'
          })
        } else {
          showToast({
            title: 'SBOM uploaded successfully and is now processing',
            description:
              'The validated SBOM data will be available in the product shortly. Please refresh to update the product.'
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
        setSelectedFile(droppedFiles[0])
      } else {
        setErrorMessage(
          'Invalid file type, only .xml and .json files are allowed.'
        )
      }
    }
  }

  const handleFileChange = async (event) => {
    const file = event.target.files[0]
    if (file) {
      const validExtensions = ['xml', 'json']
      const fileExtension = file.name.split('.').pop().toLowerCase()
      console.log(`fileExtension`, fileExtension)
      if (validExtensions.includes(fileExtension)) {
        setErrorMessage('')
        setSelectedFile(file)
      } else {
        setErrorMessage(
          'Invalid file type, only .xml and .json files are allowed.'
        )
      }
    }
  }

  return (
    <>
      <LynkModal
        isOpen={isOpen}
        onClose={onClose}
        onSubmit={handleUpload}
        title={'Upload SBOM'}
        Icon={PiFileArrowUpBold}
        disabled={!selectedFile || loading}
        buttonText='Upload'
      >
        {!params?.productgroupid && (
          <Tag colorScheme='blue' mb={4}>
            <Text fontWeight={'medium'} wordBreak={'break-all'}>
              {name}
            </Text>
          </Tag>
        )}
        {errorMessage !== '' && <LynkAlert msg={errorMessage} />}
        <Stack spacing={6} minHeight='310px'>
          <FormControl>
            <FormLabel fontSize={12}>Environment</FormLabel>
            <Select
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
            <FormHelperText color={textColor} fontSize={12}>
              Interlynk supports importing CycloneDX versions 1.2-1.5 in JSON
              and XML formats and SPDX 2.2 and 2.3 in JSON format.{' '}
            </FormHelperText>
          </FormControl>
          <FormLabel fontSize={12}>Upload File</FormLabel>
          <Flex
            p={5}
            height={'110px'}
            justifyContent={'center'}
            borderWidth={2}
            borderRadius='md'
            textAlign='center'
            overflow={'hidden'}
            onDrop={handleDrop}
            borderStyle='dashed'
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            borderColor={isDragActive ? 'blue.500' : borderColor}
            onClick={() => document.getElementById('fileInput').click()}
          >
            <Input
              id='fileInput'
              type='file'
              style={{ display: 'none' }}
              onChange={handleFileChange}
              accept='.json,application/json,application/xml,text/xml'
            />
            <Flex alignItems={'center'} justifyContent={'center'}>
              <Text
                hidden={loading}
                color={selectedFile ? highlightedTextColor : textColor}
                fontWeight={500}
              >
                {isDragActive
                  ? 'Drop the file here'
                  : selectedFile
                    ? selectedFile.name
                    : 'Drop SBOM here, or click to select a file'}
              </Text>
              <Text hidden={!loading}>Uploading...</Text>
            </Flex>
          </Flex>
          {loading && <Progress size='xs' isIndeterminate />}
        </Stack>
        {error && (
          <Box mb={4}>
            <Text>Something went wrong!!</Text>
          </Box>
        )}
      </LynkModal>
    </>
  )
}

export default UploadModal
