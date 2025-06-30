import { gql, useMutation, useQuery } from '@apollo/client'
import { useEffect, useState } from 'react'

import {
  FormControl,
  FormLabel,
  Input,
  SimpleGrid,
  Stack
} from '@chakra-ui/react'

import LynkAlert from 'components/LynkAlert'
import LynkModal from 'components/LynkModal'
import LynkSelect from 'components/LynkSelect'

import useCustomToast from 'hooks/useCustomToast'

import { GetCustomFields } from 'graphQL/Queries'

import { LuSquarePen } from 'react-icons/lu'

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
  const [createField, { loading: creating }] = useMutation(CreateField, {
    refetchQueries: ['GetCustomFields']
  })
  const [updateField, { loading: updating }] = useMutation(UpdateField, {
    refetchQueries: ['GetCustomFields']
  })

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

  const handleSelect = (selectedItem) => {
    const { value } = selectedItem
    setFormData((prev) => ({
      ...prev,
      fieldType: value
    }))
  }

  const { displayName, internalName, fieldType } = formData || {}

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
      const { componentVulnCustomFieldDefinitionCreate } = res?.data || {}
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
      const { componentVulnCustomFieldDefinitionUpdate } = res?.data || {}
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
    Number(formData?.minValue) > Number(formData?.maxValue) ||
    formData?.fieldType === ''

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

  const baseOptions = [
    { value: '', label: '-- Select --' },
    { value: 'TEXT', label: 'Text' },
    { value: 'RANGE', label: 'Range' }
  ]

  const fieldTypeOptions = baseOptions.filter(
    (option) =>
      option.value === '' ||
      (!(isCustomTextPresent && option.value === 'TEXT') &&
        !(isCustomRangePresent && option.value === 'RANGE'))
  )

  return (
    <LynkModal
      isOpen={isOpen}
      onClose={onClose}
      Icon={LuSquarePen}
      disabled={isInvalid}
      isLoading={creating || updating}
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
            onChange={handleChange}
            value={formData?.displayName}
            placeholder='Enter display name'
          />
        </FormControl>
        {/* INTERNAL NAME */}
        <FormControl isRequired>
          <FormLabel htmlFor='internalName'>Internal Name</FormLabel>
          <Input
            type='text'
            name={'internalName'}
            onChange={handleChange}
            value={formData?.internalName}
            placeholder='Enter internal name'
          />
        </FormControl>
        {/* FIELD TYPE */}
        {!data?.id && (
          <FormControl isRequired isDisabled={data?.id}>
            <FormLabel htmlFor='fieldType'>Field Type</FormLabel>

            <LynkSelect
              name='fieldType'
              value={
                fieldTypeOptions.find(
                  (option) => option.value === formData?.fieldType
                ) || null
              }
              onChange={(selectedOption) => handleSelect(selectedOption)}
              options={fieldTypeOptions}
              placeholder='-- Select --'
              dropDown
            />
          </FormControl>
        )}
        {/* VALUE */}
        {formData?.fieldType === 'RANGE' && (
          <SimpleGrid columns={2} spacing={4} pt={1}>
            <FormControl>
              <FormLabel htmlFor='minValue'>Min</FormLabel>
              <Input
                type='number'
                name={'minValue'}
                onChange={handleChange}
                value={formData?.minValue}
                placeholder='Enter min value'
              />
            </FormControl>
            <FormControl>
              <FormLabel htmlFor='maxValue'>Max</FormLabel>
              <Input
                type='number'
                name={'maxValue'}
                onChange={handleChange}
                value={formData?.maxValue}
                placeholder='Enter max value'
              />
            </FormControl>
          </SimpleGrid>
        )}
      </Stack>
    </LynkModal>
  )
}

export default FieldModal
