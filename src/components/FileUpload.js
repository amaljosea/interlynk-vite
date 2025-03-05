import React, { useEffect, useState } from 'react'

import {
  Box,
  Flex,
  FormLabel,
  Input,
  Progress,
  Stack,
  Text
} from '@chakra-ui/react'

import useCustomToast from 'hooks/useCustomToast'
import { useThemeColor } from 'hooks/useThemeColors'

const FileUpload = ({
  selectedFile,
  setSelectedFile,
  isLoading = false,
  errorMessage,
  setErrorMessage,
  error,
  label = 'Upload File',
  accept = '.json,application/json,application/xml,text/xml'
}) => {
  const { showToast } = useCustomToast()
  const [isDragActive, setIsDragActive] = useState(false)
  const {
    primaryBlueText,
    grayBorderColor,
    secondaryTextColor,
    primaryErrorColor
  } = useThemeColor([
    'primaryBlueText',
    'grayBorderColor',
    'secondaryTextColor',
    'primaryErrorColor'
  ])

  useEffect(() => {
    const handleGlobalDragOver = (e) => {
      e.preventDefault()
      e.stopPropagation()
      if (!isDragActive) setIsDragActive(true)
    }

    const handleGlobalDragLeave = (e) => {
      e.preventDefault()
      e.stopPropagation()
      if (e.relatedTarget === null) {
        setIsDragActive(false)
      }
    }

    const handleGlobalDrop = (e) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragActive(false)
      if (e.dataTransfer.files.length > 0) {
        handleDrop(e)
      }
    }

    window.addEventListener('dragover', handleGlobalDragOver)
    window.addEventListener('dragleave', handleGlobalDragLeave)
    window.addEventListener('drop', handleGlobalDrop)

    return () => {
      window.removeEventListener('dragover', handleGlobalDragOver)
      window.removeEventListener('dragleave', handleGlobalDragLeave)
      window.removeEventListener('drop', handleGlobalDrop)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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

  const handleFileChange = (event) => {
    const file = event.target.files[0]
    if (file) {
      const validExtensions = ['xml', 'json']
      const fileExtension = file.name.split('.').pop().toLowerCase()
      if (validExtensions.includes(fileExtension)) {
        setErrorMessage('')
        setSelectedFile(file)
      } else {
        showToast({
          description:
            'Invalid file type, only .xml and .json files are allowed.',
          status: 'error'
        })
        setErrorMessage(
          'Invalid file type, only .xml and .json files are allowed.'
        )
      }
    }
  }

  return (
    <Box>
      <Stack spacing={6}>
        <Stack spacing={0}>
          <FormLabel>{label}</FormLabel>
          <Flex
            p={5}
            height={'110px'}
            justifyContent={'center'}
            borderWidth={2}
            borderRadius='md'
            textAlign='center'
            overflow={'hidden'}
            borderStyle='dashed'
            borderColor={isDragActive ? primaryBlueText : grayBorderColor}
            onClick={() => document.getElementById('fileInput').click()}
          >
            <Input
              id='fileInput'
              type='file'
              style={{ display: 'none' }}
              onChange={handleFileChange}
              accept={accept}
            />

            <Flex alignItems={'center'} justifyContent={'center'}>
              <Text
                hidden={isLoading}
                color={selectedFile ? primaryBlueText : secondaryTextColor}
                fontWeight={500}
              >
                {isDragActive
                  ? 'Drop the file anywhere'
                  : selectedFile
                    ? selectedFile.name
                    : 'Drop SBOM here, or click to select a file'}
              </Text>
              <Text hidden={!isLoading}>Uploading...</Text>
            </Flex>
          </Flex>
        </Stack>
        {isLoading && <Progress size='xs' isIndeterminate />}
        {errorMessage && <Text color={primaryErrorColor}>{errorMessage}</Text>}
        {error && (
          <Box mb={4}>
            <Text>Something went wrong!!</Text>
          </Box>
        )}
      </Stack>
    </Box>
  )
}

export default FileUpload
