import { gql, useMutation, useQuery } from '@apollo/client'
import { useMemo, useState } from 'react'
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
  const { activeProject, setActiveProject } = useGlobalState()
  const { showToast } = useCustomToast()

  const { secondaryTextColor } = useThemeColor(['secondaryTextColor'])

  const { data, loading } = useQuery(GetProjectGroup, {
    skip: isOpen ? false : true,
    variables: { id: group?.id }
  })

  const { projects } = data?.projectGroup || {}

  const [sbomUpload, { error, loading: uploading }] = useMutation(UploadSbom)

  const [errorMessage, setErrorMessage] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)

  const projectOptions = useMemo(
    () =>
      projects
        ?.sort((a, b) => a?.name?.localeCompare(b?.name))
        ?.map((item) => ({
          value: item?.id,
          label: capitalizeFirstLetter(item?.name)
        })) || [],
    [projects]
  )

  const handleSelect = (item) => {
    const result = projectOptions.find((opt) => opt.value === item?.value)
    setActiveProject(result)
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      setErrorMessage('No file selected')
      return
    }

    await sbomUpload({
      variables: { doc: selectedFile, projectId: activeProject?.value }
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

  return (
    <>
      <LynkModal
        isOpen={isOpen}
        Icon={LuUpload}
        onClose={onClose}
        buttonText='Upload'
        title={'Upload SBOM'}
        isLoading={uploading}
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
                id='environment'
                isLoading={loading}
                value={activeProject}
                options={projectOptions}
                onChange={(selected) => handleSelect(selected)}
              />
              <FormHelperText color={secondaryTextColor} fontSize={12}>
                Interlynk supports importing CycloneDX versions 1.2-1.5 in JSON
                and XML formats and SPDX 2.2 and 2.3 in JSON format.
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
