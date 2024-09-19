import { gql, useMutation } from '@apollo/client'
import { useState } from 'react'
import { useParams } from 'react-router-dom'

import {
  Alert,
  AlertIcon,
  AlertTitle,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Text,
  useColorModeValue
} from '@chakra-ui/react'

import LynkModal from 'components/LynkModal'

import useCustomToast from 'hooks/useCustomToast'

import { FaFileImport } from 'react-icons/fa6'

const AutomationRulesImport = gql`
  mutation AutomationRulesImport($file: Upload!, $projectId: Uuid!) {
    automationRulesBulkImport(input: { file: $file, projectId: $projectId }) {
      errors
      importedRules {
        active
        checkComponent
        checkIdentifier
        checkVersion
        createdAt
        description
        id
        isSystem
      }
    }
  }
`

const ImportRule = (props) => {
  const { isOpen, onClose } = props

  const params = useParams()
  const { showToast } = useCustomToast()
  const borderColor = useColorModeValue('#A0AEC066', 'gray.600')
  const textColor = useColorModeValue('#1A202C99', 'gray.600')
  const highlightedTextColor = useColorModeValue('blue.600', 'blue.300')

  const [errorMessage, setErrorMessage] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const [isDragActive, setIsDragActive] = useState(false)

  const [importRule, { loading }] = useMutation(AutomationRulesImport)

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

  const handleFileChange = (event) => {
    const file = event.target.files[0]
    if (file) {
      const validExtensions = ['json']
      const fileExtension = file.name.split('.').pop().toLowerCase()
      if (validExtensions.includes(fileExtension)) {
        setErrorMessage('')
        setSelectedFile(file)
      } else {
        setErrorMessage('Invalid file type, only .json files are allowed.')
      }
    }
  }

  const handleSubmit = () => {
    importRule({
      variables: { file: selectedFile, projectId: params?.productid }
    })
      .then((res) => {
        if (res?.data?.automationRulesBulkImport?.errors?.length > 0) {
          showToast({
            description: res?.data?.automationRulesBulkImport?.errors[0],
            status: 'error'
          })
        } else {
          showToast({
            title: 'Rule uploaded successfully and is now processing'
          })
        }
      })
      .finally(() => onClose())
  }

  return (
    <LynkModal
      isOpen={isOpen}
      onClose={onClose}
      Icon={FaFileImport}
      buttonText={'Import'}
      title={`Import Rules`}
      onSubmit={handleSubmit}
      disabled={!selectedFile || loading}
    >
      <Flex flexDir={'column'} gap={3} alignItems={'flex-start'}>
        {errorMessage !== '' && (
          <Alert status='error' mb={4} borderRadius={5}>
            <AlertIcon />
            <AlertTitle fontSize={'sm'} fontWeight={'medium'}>
              {errorMessage}
            </AlertTitle>
          </Alert>
        )}
        <FormControl>
          <FormLabel fontSize={12}>Upload JSON File</FormLabel>
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
                    : 'Drop JSON file, or click to select a file'}
              </Text>
              <Text hidden={!loading}>Uploading...</Text>
            </Flex>
          </Flex>
        </FormControl>
      </Flex>
    </LynkModal>
  )
}

export default ImportRule
