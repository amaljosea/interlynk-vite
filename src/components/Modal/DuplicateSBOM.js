import { useMutation } from '@apollo/client'
import React, { useState } from 'react'

import {
  Checkbox,
  FormControl,
  Input,
  Stack,
  Tag,
  Text
} from '@chakra-ui/react'

import LynkModal from 'components/LynkModal'
import LynkFormLabel from 'components/Misc/LynkLabel'

import useCustomToast from 'hooks/useCustomToast'

import { sbomClone } from 'graphQL/Mutation'

import { LuCopyPlus } from 'react-icons/lu'

const DuplicateSBOM = ({ data, isOpen, onClose }) => {
  const { showToast } = useCustomToast()

  const { sbomId, projectGroup, projectVersion } = data || {}

  const [duplicate, { loading }] = useMutation(sbomClone, {
    refetchQueries: ['GetVersionsTable', 'GetProjectGroupDetails']
  })

  const [formData, setFormData] = useState({
    version: '',
    includeParts: false,
    includeVulnerabilities: false,
    includeJiraIssues: false
  })
  const disabled = formData?.version === ''

  const handleChange = (event) => {
    const { name, value, checked, type } = event.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = () => {
    duplicate({
      variables: {
        sbomId: sbomId,
        newVersion: formData?.version,
        options: {
          includeParts: formData?.includeParts,
          includeJiraIssues: formData?.includeJiraIssues,
          includeVulnerabilities: formData?.includeVulnerabilities
        }
      }
    }).then((res) => {
      const { success, errors } = res?.data?.sbomClone || {}
      if (success && errors?.length > 0) {
        showToast({ description: errors[0], status: 'error' })
      } else {
        showToast({
          description: 'Version duplication in progress',
          status: 'success'
        })
        onClose()
      }
    })
  }

  return (
    <LynkModal
      isOpen={isOpen}
      onClose={onClose}
      Icon={LuCopyPlus}
      title={'Duplicate'}
      isLoading={loading}
      disabled={disabled}
      buttonText='Submit'
      onSubmit={handleSubmit}
    >
      <Stack spacing={4}>
        <Tag colorScheme='blue' w={'fit-content'}>
          <Text fontWeight={400} wordBreak={'break-all'}>
            {projectGroup} - {projectVersion || 'N/A'}
          </Text>
        </Tag>
        <FormControl isRequired>
          <LynkFormLabel label='Duplicate as Version' htmlFor='version' />
          <Input
            name='version'
            placeholder='Enter version'
            value={formData?.version}
            onChange={handleChange}
          />
        </FormControl>
        <Stack>
          <Checkbox
            name='includeParts'
            onChange={handleChange}
            isChecked={formData.includeParts}
          >
            <Text fontSize={14}>Include Parts</Text>
          </Checkbox>
          <Checkbox
            onChange={handleChange}
            name='includeVulnerabilities'
            isChecked={formData.includeVulnerabilities}
          >
            <Text fontSize={14}>Include Vulnerabilities</Text>
          </Checkbox>
          <Checkbox
            name='includeJiraIssues'
            onChange={handleChange}
            isChecked={formData.includeJiraIssues}
          >
            <Text fontSize={14}>Include Jira Issues</Text>
          </Checkbox>
        </Stack>
      </Stack>
    </LynkModal>
  )
}

export default DuplicateSBOM
