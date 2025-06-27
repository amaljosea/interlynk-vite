import { gql, useMutation, useQuery } from '@apollo/client'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { capitalizeFirstLetter } from 'utils'

import { Flex, Stack, Tag, Text } from '@chakra-ui/react'
import { FormControl, FormHelperText, FormLabel } from '@chakra-ui/react'

import FileUpload from 'components/FileUpload'
import LynkAlert from 'components/LynkAlert'
import LynkModal from 'components/LynkModal'
import LynkSelect from 'components/LynkSelect'

import useCustomToast from 'hooks/useCustomToast'
import { useGlobalState } from 'hooks/useGlobalState'
import { useThemeColor } from 'hooks/useThemeColors'

import { UploadSbom } from 'graphQL/Mutation'

import { LuUpload } from 'react-icons/lu'

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

  const [selectedEnv, setSelectedEnv] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)

  const { data, loading } = useQuery(GetProjectGroup, {
    skip: isOpen ? false : true,
    variables: { id: group?.id }
  })

  const { projects } = data?.projectGroup || {}

  const [sbomUpload, { error, loading: uploading }] = useMutation(UploadSbom, {
    refetchQueries: [
      'GetProductTable',
      'GetProjectGroupDetails',
      'GetVersionsTable'
    ]
  })

  const defaultENV = projects?.find((item) =>
    envName ? item?.name === envName : item?.name === 'default'
  )

  const projectOptions =
    projects
      ?.sort((a, b) => a?.name?.localeCompare(b?.name))
      ?.map((item) => ({
        value: item?.id,
        label: capitalizeFirstLetter(item?.name)
      })) || []

  const handleUpload = async () => {
    if (!selectedFile) {
      setErrorMessage('No file selected')
      return
    }

    await sbomUpload({
      variables: { doc: selectedFile, projectId: selectedEnv }
    })
      .then((res) => {
        if (res?.data?.sbomUpload?.errors?.length > 0) {
          showToast({
            description: res?.data?.sbomUpload?.errors[0],
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

  const uploadInfo = `Interlynk supports importing CycloneDX versions 1.2 - 1.6 in JSON and XML formats and SPDX 2.2 and 2.3 in JSON format.`

  useEffect(() => {
    if (defaultENV) {
      setSelectedEnv(defaultENV?.id)
    }
  }, [defaultENV])

  return (
    <>
      <LynkModal
        Icon={LuUpload}
        isOpen={isOpen}
        onClose={onClose}
        buttonText='Upload'
        title={'Upload SBOM'}
        onSubmit={handleUpload}
        disabled={!selectedFile || uploading}
      >
        <Flex flexDir={'column'} gap={3} alignItems={'flex-start'}>
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
              <FormLabel>Environment</FormLabel>
              <LynkSelect
                dropDown
                id='dataRetention'
                isLoading={loading}
                options={projectOptions}
                onChange={(selected) => setSelectedEnv(selected?.value)}
                value={
                  projectOptions.find((opt) => opt.value === selectedEnv) ||
                  null
                }
              />
              <FormHelperText color={secondaryTextColor} fontSize={12}>
                {uploadInfo}
              </FormHelperText>
            </FormControl>
            <FileUpload
              selectedFile={selectedFile}
              setSelectedFile={setSelectedFile}
              isLoading={uploading}
              error={error}
              setErrorMessage={setErrorMessage}
            />
          </Stack>
        </Flex>
      </LynkModal>
    </>
  )
}
export default UploadModal
