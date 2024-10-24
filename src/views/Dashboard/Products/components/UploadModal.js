import { gql, useMutation, useQuery } from '@apollo/client'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import {
  FormControl,
  FormHelperText,
  FormLabel,
  Select,
  Stack,
  Tag,
  Text
} from '@chakra-ui/react'

import FileUpload from 'components/FileUpload'
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

  const { secondaryTextColor } = useThemeColor(['secondaryTextColor'])

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
        <Stack spacing={6} minHeight='290px'>
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
              and XML formats and SPDX 2.2 and 2.3 in JSON format.
            </FormHelperText>
          </FormControl>
          <FileUpload
            selectedFile={selectedFile}
            setSelectedFile={setSelectedFile}
            isLoading={loading}
            error={error}
            errorMessage={errorMessage}
            setErrorMessage={setErrorMessage}
          />
        </Stack>
      </LynkModal>
    </>
  )
}

export default UploadModal
