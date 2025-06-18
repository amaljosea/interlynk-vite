import { useMutation } from '@apollo/client'
import React, { useState } from 'react'

import { Checkbox, FormControl, Input, Stack } from '@chakra-ui/react'

import LynkModal from 'components/LynkModal'
import LynkFormLabel from 'components/Misc/LynkLabel'

import useCustomToast from 'hooks/useCustomToast'

import { sbomClone } from 'graphQL/Mutation'

import { LuCopyPlus } from 'react-icons/lu'

const DuplicateSBOM = ({ id, isOpen, onClose }) => {
  const { showToast } = useCustomToast()
  const [duplicate, { loading }] = useMutation(sbomClone, {
    refetchQueries: ['GetVersionsTable']
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
        sbomId: id,
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
          description: 'SBOM duplicated successfully',
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
      isLoading={loading}
      disabled={disabled}
      buttonText='Submit'
      onSubmit={handleSubmit}
      title={'Duplicate SBOM'}
    >
      <Stack spacing={4}>
        <FormControl isRequired>
          <LynkFormLabel label='Version' htmlFor='version' />
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
            Include Parts
          </Checkbox>
          <Checkbox
            onChange={handleChange}
            name='includeVulnerabilities'
            isChecked={formData.includeVulnerabilities}
          >
            Include Vulnerabilities
          </Checkbox>
          <Checkbox
            name='includeJiraIssues'
            onChange={handleChange}
            isChecked={formData.includeJiraIssues}
          >
            Include Jira Issues
          </Checkbox>
        </Stack>
      </Stack>
    </LynkModal>
  )
}

export default DuplicateSBOM
