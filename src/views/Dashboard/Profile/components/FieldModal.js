import { gql, useMutation, useQuery } from '@apollo/client'
import { useEffect, useState } from 'react'

import { FormControl, FormLabel, Input, Select } from '@chakra-ui/react'
import { SimpleGrid, Stack } from '@chakra-ui/react'

import LynkAlert from 'components/LynkAlert'
import LynkModal from 'components/LynkModal'

import useCustomToast from 'hooks/useCustomToast'

import { GetCustomFields } from 'graphQL/Queries'

import { FaRegPenToSquare } from 'react-icons/fa6'

const CreateField = gql`
  mutation CreateField(
    $displayName: String!
    $internalName: String!
    $fieldType: ComponentVulnCustomFieldTypeEnum!
    $minValue: Int
    $maxValue: Int
  ) {
    componentVulnCustomFieldDefinitionCreate(
      input: {
        displayName: $displayName
        internalName: $internalName
        fieldType: $fieldType
        minValue: $minValue
        maxValue: $maxValue
      }
    ) {
      errors
      componentVulnCustomFieldDefinition {
        createdAt
        displayName
        id
      }
    }
  }
`

const UpdateField = gql`
  mutation UpdateField(
    $id: Uuid!
    $displayName: String
    $internalName: String
    $fieldType: ComponentVulnCustomFieldTypeEnum
    $minValue: Int
    $maxValue: Int
  ) {
    componentVulnCustomFieldDefinitionUpdate(
      input: {
        id: $id
        displayName: $displayName
        internalName: $internalName
        fieldType: $fieldType
        minValue: $minValue
        maxValue: $maxValue
      }
    ) {
      errors
      componentVulnCustomFieldDefinition {
        id
      }
    }
  }
`

const FieldModal = ({ data, isOpen, onClose }) => {
  const { showToast } = useCustomToast()
  const [createField, { loading: crLoading }] = useMutation(CreateField)
  const [updateField, { loading: upLoading }] = useMutation(UpdateField)

  const { data: customFields } = useQuery(GetCustomFields)

  const customFieldNodes =
    customFields?.componentVulnCustomFieldDefinitions?.nodes

  const isCustomRangePresent = customFieldNodes?.some(
    (customFieldNode) => customFieldNode.fieldType === 'RANGE'
  )
  const isCustomTextPresent = customFieldNodes?.some(
    (customFieldNode) => customFieldNode.fieldType === 'TEXT'
  )

  const [formData, setFormData] = useState({
    displayName: '',
    internalName: '',
    fieldType: '',
    minValue: '0',
    maxValue: '1'
  })
  const [error, setError] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    const isRange = name === 'minValue' || name === 'maxValue'
    setFormData((prev) => ({
      ...prev,
      [name]: isRange && Number(value) > 100 ? '' : value
    }))
  }

  const { displayName, internalName, fieldType } = formData || ''

  const variables = {
    fieldType: fieldType,
    displayName: displayName,
    internalName: internalName,
    minValue: fieldType === 'RANGE' ? Number(formData?.minValue) : null,
    maxValue: fieldType === 'RANGE' ? Number(formData?.maxValue) : null
  }

  const handleCreate = () => {
    createField({
      variables: { ...variables }
    }).then((res) => {
      const { componentVulnCustomFieldDefinitionCreate } = res?.data || ''
      if (componentVulnCustomFieldDefinitionCreate?.errors?.length > 0) {
        setError(componentVulnCustomFieldDefinitionCreate?.errors[0])
      } else {
        showToast({
          description: 'Field added successfully',
          status: 'success'
        })
        onClose()
      }
    })
  }

  const handleUpdate = () => {
    updateField({
      variables: { id: data?.id, ...variables }
    }).then((res) => {
      const { componentVulnCustomFieldDefinitionUpdate } = res?.data || ''
      if (componentVulnCustomFieldDefinitionUpdate?.errors?.length > 0) {
        setError(componentVulnCustomFieldDefinitionUpdate?.errors[0])
      } else {
        showToast({
          description: 'Field updated successfully',
          status: 'success'
        })
        onClose()
      }
    })
  }

  const isInvalid =
    formData?.minValue === formData?.maxValue ||
    Number(formData?.minValue) > Number(formData?.maxValue)

  useEffect(() => {
    if (data) {
      setFormData(() => ({
        displayName: data?.displayName || '',
        internalName: data?.internalName || '',
        fieldType: data?.fieldType || '',
        minValue: data?.minValue ? String(data?.minValue) : 0,
        maxValue: data?.maxValue ? String(data?.maxValue) : 1
      }))
    }
  }, [data])

  return (
    <LynkModal
      isOpen={isOpen}
      onClose={onClose}
      disabled={isInvalid}
      Icon={FaRegPenToSquare}
      isLoading={crLoading || upLoading}
      buttonText={data?.id ? 'Update' : 'Save'}
      onSubmit={data?.id ? handleUpdate : handleCreate}
      title={`${data?.id ? 'Edit' : 'Add'} Custom Field`}
    >
      <Stack spacing={4}>
        {error && <LynkAlert msg={error} />}
        {/* DISPLAY NAME */}
        <FormControl isRequired>
          <FormLabel htmlFor='displayName'>Display Name</FormLabel>
          <Input
            type='text'
            name={'displayName'}
            value={formData?.displayName}
            onChange={handleChange}
          />
        </FormControl>
        {/* INTERNAL NAME */}
        <FormControl isRequired>
          <FormLabel htmlFor='internalName'>Internal Name</FormLabel>
          <Input
            type='text'
            name={'internalName'}
            value={formData?.internalName}
            onChange={handleChange}
          />
        </FormControl>
        {/* FIELD TYPE */}
        <FormControl isRequired>
          <FormLabel htmlFor='fieldType'>Field Type</FormLabel>
          <Select
            name={'fieldType'}
            value={formData?.fieldType}
            onChange={handleChange}
          >
            <option value=''>-- Select --</option>
            <option disabled={isCustomTextPresent} value='TEXT'>
              Text
            </option>
            <option disabled={isCustomRangePresent} value='RANGE'>
              Range
            </option>
          </Select>
        </FormControl>
        {/* VALUE */}
        {formData?.fieldType === 'RANGE' && (
          <SimpleGrid columns={2} spacing={4} pt={1}>
            <FormControl>
              <FormLabel htmlFor='minValue'>Min</FormLabel>
              <Input
                type='number'
                name={'minValue'}
                value={formData?.minValue}
                onChange={handleChange}
              />
            </FormControl>
            <FormControl>
              <FormLabel htmlFor='maxValue'>Max</FormLabel>
              <Input
                type='number'
                name={'maxValue'}
                value={formData?.maxValue}
                onChange={handleChange}
              />
            </FormControl>
          </SimpleGrid>
        )}
      </Stack>
    </LynkModal>
  )
}

export default FieldModal
