import { useMutation } from '@apollo/client'
import { useState } from 'react'
import { getTotalDays, splitBySupportLevel } from 'utils'
import { assessmentExpiryWarning } from 'variables/general'

import { FormErrorMessage, Input, Stack } from '@chakra-ui/react'
import { FormControl, FormLabel } from '@chakra-ui/react'

import { SupportIcon } from 'components/Icons/Icons'
import LynkDate from 'components/LynkDate'
import LynkModal from 'components/LynkModal'
import LynkSelect from 'components/LynkSelect'

import useCustomToast from 'hooks/useCustomToast'
import { useRouteFlags } from 'hooks/useRouteFlags'

import {
  ComponentSupportLevelBulkUpdate,
  componentSupportLevelBulkCreate
} from 'graphQL/Mutation'

const SupportStatus = ({
  isOpen,
  onClose,
  selectedItems,
  setToggleClear,
  handleClear
}) => {
  const { isCustomerView } = useRouteFlags()
  const { showToast } = useCustomToast()

  const inputStyle = { size: 'md' }

  const [createSupport, { loading: createLoading }] = useMutation(
    componentSupportLevelBulkCreate,
    { onCompleted: () => handleClear() }
  )
  const [updateSupport, { loading: updateLoading }] = useMutation(
    ComponentSupportLevelBulkUpdate,
    { onCompleted: () => handleClear() }
  )

  const defaultDate = new Date()
  defaultDate.setDate(defaultDate.getDate() + 365)
  const [formData, setFormData] = useState({
    supportLevel: '',
    endOfSupport: '',
    explanation: '',
    assessmentExpiresOn: defaultDate
  })

  const totalDays = Number(getTotalDays(formData?.assessmentExpiresOn))

  const isDisabled = formData?.supportLevel === '' || totalDays > 365

  const noLongerMaintained = formData?.supportLevel === 'no_longer_maintained'

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSelectChange = (selectedItem) => {
    const isUnspecified = selectedItem === 'unspecified' || noLongerMaintained
    if (isUnspecified) {
      setFormData((prev) => ({
        ...prev,
        supportLevel: selectedItem,
        endOfSupport: '',
        explanation: '',
        assessmentExpiresOn: ''
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        supportLevel: selectedItem
      }))
    }
  }

  const handleDateChange = (newDate, field) => {
    setFormData((prev) => ({
      ...prev,
      [field]: newDate ? newDate._d : ''
    }))
  }

  const occurrenceIds = selectedItems?.flatMap((group) =>
    group?.occurrences.map((occurrence) => occurrence?.id)
  )

  const handleUpdate = () => {
    setToggleClear(false)
    updateSupport({
      variables: {
        ids: occurrenceIds,
        level: formData?.supportLevel || undefined,
        notes: formData?.explanation || undefined,
        retainManualOverrideFor: totalDays > 0 ? totalDays : 0,
        endDate: formData?.endOfSupport
          ? new Date(formData?.endOfSupport).toISOString()
          : undefined
      }
    }).then((res) => {
      const { errors } = res?.data?.supportLevelsUpdate || {}
      if (errors?.length > 0) {
        showToast({
          description: errors[0],
          status: 'error'
        })
      } else {
        showToast({
          description: 'Status updated successfully',
          status: 'success'
        })
      }
    })
  }

  const handleCreate = () => {
    createSupport({
      variables: {
        componentIds: occurrenceIds,
        supportLevel: formData?.supportLevel || undefined,
        notes: formData?.explanation || undefined,
        retainManualOverrideFor: totalDays > 0 ? totalDays : 0,
        endDate: formData?.endOfSupport
          ? new Date(formData?.endOfSupport).toISOString()
          : undefined
      }
    }).then((res) => {
      const { errors } = res?.data?.supportLevelsCreate || {}
      if (errors?.length > 0) {
        showToast({
          description: errors[0],
          status: 'error'
        })
      } else {
        showToast({
          description: 'Status updated successfully',
          status: 'success'
        })
      }
    })
  }

  const { withSupport, withoutSupport } = splitBySupportLevel(selectedItems)
  const hasNoSupport = withSupport?.length === 0 && withoutSupport?.length > 0

  const handleSubmit = () => {
    if (hasNoSupport) {
      handleCreate()
    } else {
      handleUpdate()
    }
  }

  const supportOptions = [
    { label: '-- Select --', value: '' },
    { label: 'Unspecified', value: 'unspecified' },
    { label: 'Actively Maintained', value: 'actively_maintained' },
    { label: 'No Longer Maintained', value: 'no_longer_maintained' },
    { label: 'Abandoned', value: 'abandoned' }
  ]

  return (
    <LynkModal
      isOpen={isOpen}
      onClose={onClose}
      Icon={SupportIcon}
      title={'Add Status'}
      disabled={isDisabled}
      onSubmit={handleSubmit}
      isLoading={updateLoading || createLoading}
      buttonText={hasNoSupport ? 'Create' : 'Update'}
    >
      <Stack spacing={4}>
        {/* SUPPRT LEVEL */}
        <FormControl>
          <FormLabel htmlFor='supportLevel'>Support Level</FormLabel>
          <LynkSelect
            styles={inputStyle}
            name='supportLevel'
            value={
              supportOptions.find(
                (option) => option.value === formData?.supportLevel
              ) || null
            }
            onChange={(selected) => {
              handleSelectChange(selected.value)
            }}
            isDisabled={isCustomerView}
            options={supportOptions}
            dropDown
          />
        </FormControl>
        {/* END-OF-SUPPORT DATE */}
        {(formData?.supportLevel === 'actively_maintained' ||
          formData?.supportLevel === 'no_longer_maintained') && (
          <FormControl>
            <FormLabel htmlFor='endOfSupport'>End-Of-Support Date</FormLabel>
            <LynkDate
              name='endOfSupport'
              value={formData?.endOfSupport}
              onChange={(value) => handleDateChange(value, 'endOfSupport')}
            />
          </FormControl>
        )}
        {/* RETAIN MANNUAL OVERRIDE */}
        <FormControl
          hidden={noLongerMaintained}
          isInvalid={totalDays > 365}
          isRequired={formData?.supportLevel !== 'abandoned'}
        >
          <FormLabel htmlFor='assessmentExpiresOn'>
            Assessment Expires On
          </FormLabel>
          <LynkDate
            name='assessmentExpiresOn'
            value={formData?.assessmentExpiresOn}
            onChange={(value) => handleDateChange(value, 'assessmentExpiresOn')}
          />
          <FormErrorMessage>{assessmentExpiryWarning}</FormErrorMessage>
        </FormControl>
        {/* EXPLANATION */}
        <FormControl>
          <FormLabel htmlFor='explanation'>Explanation</FormLabel>
          <Input
            sx={inputStyle}
            name='explanation'
            value={formData?.explanation}
            placeholder='Enter explanation'
            onChange={handleChange}
          />
        </FormControl>
      </Stack>
    </LynkModal>
  )
}

export default SupportStatus
