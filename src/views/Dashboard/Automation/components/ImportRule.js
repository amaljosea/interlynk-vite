import { gql, useMutation } from '@apollo/client'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import { Flex, FormControl, FormLabel, Input, Text } from '@chakra-ui/react'

import LynkAlert from 'components/LynkAlert'
import LynkModal from 'components/LynkModal'

import useCustomToast from 'hooks/useCustomToast'
import { useThemeColor } from 'hooks/useThemeColors'

import { LuImport } from 'react-icons/lu'

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
  const { grayBorderColor, primaryBlueText, secondaryTextColor } =
    useThemeColor(['grayBorderColor', 'primaryBlueText', 'secondaryTextColor'])

  const [errorMessage, setErrorMessage] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const [isDragActive, setIsDragActive] = useState(false)

  const [importRule, { loading }] = useMutation(AutomationRulesImport)

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
      Icon={LuImport}
      buttonText={'Import'}
      title={`Import Rules`}
      onSubmit={handleSubmit}
      disabled={!selectedFile || loading}
    >
      <Flex flexDir={'column'} gap={3} alignItems={'flex-start'}>
        {errorMessage !== '' && <LynkAlert msg={errorMessage} />}
        <FormControl>
          <FormLabel>Upload JSON File</FormLabel>
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
              accept='.json,application/json,application/xml,text/xml'
            />
            <Flex alignItems={'center'} justifyContent={'center'}>
              <Text
                hidden={loading}
                color={selectedFile ? primaryBlueText : secondaryTextColor}
                fontWeight={500}
              >
                {isDragActive
                  ? 'Drop the file anywhere'
                  : selectedFile
                    ? selectedFile.name
                    : 'Drop JSON file anywhere, or click to select'}
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
