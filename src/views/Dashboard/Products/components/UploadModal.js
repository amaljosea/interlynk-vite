import { gql, useMutation, useQuery } from '@apollo/client'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

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
  Text
} from '@chakra-ui/react'

import LynkAlert from 'components/LynkAlert'
import LynkModal from 'components/LynkModal'

import useCustomToast from 'hooks/useCustomToast'
import { useGlobalState } from 'hooks/useGlobalState'
import { useThemeColor } from 'hooks/useThemeColors'

import { UploadSbom } from 'graphQL/Mutation'

import { PiFileArrowUpBold } from 'react-icons/pi'

const GetProjectGroup = gql`
  query GetProjectGroup($id: Uuid!) {
    projectGroup(id: $id) {
      projects {
        id
        name
      }
    }
  }
`

const UploadModal = ({ isOpen, onClose, group }) => {
  const params = useParams()
  const { envName } = useGlobalState()
  const { showToast } = useCustomToast()

  const { primaryBlueText, grayBorderColor, secondaryTextColor } =
    useThemeColor(['primaryBlueText', 'grayBorderColor', 'secondaryTextColor'])

  const { data } = useQuery(GetProjectGroup, {
    skip: isOpen ? false : true,
    variables: { id: group?.id }
  })

  const { projects } = data?.projectGroup || ''

  const [sbomUpload, { error, loading }] = useMutation(UploadSbom)

  const defaultENV = projects?.find((item) =>
    envName ? item?.name === envName : item?.name === 'default'
  )

  const [selectedEnv, setSelectedEnv] = useState('')
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

  useEffect(() => {
    if (defaultENV) {
      setSelectedEnv(defaultENV?.id)
    }
  }, [defaultENV])

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
              {group?.name}
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
              textTransform={'capitalize'}
              onChange={(e) => setSelectedEnv(e.target.value)}
            >
              {projects
                ?.sort((a, b) => a?.name?.localeCompare(b?.name))
                ?.map((item) => (
                  <option
                    key={item.id}
                    value={item.id}
                    style={{ textTransform: 'capitalize' }}
                  >
                    {item.name}
                  </option>
                ))}
            </Select>
            <FormHelperText color={secondaryTextColor} fontSize={12}>
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
