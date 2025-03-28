import { useMutation } from '@apollo/client'
import { useState } from 'react'
import { getTotalDays } from 'utils'

import { FormErrorMessage, Input, Select, Stack } from '@chakra-ui/react'
import { FormControl, FormLabel } from '@chakra-ui/react'

import { SupportIcon } from 'components/Icons/Icons'
import LynkDate from 'components/LynkDate'
import LynkModal from 'components/LynkModal'

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
  setSelectedItems,
  setToggleClear
}) => {
  const { isCustomerView } = useRouteFlags()
  const { showToast } = useCustomToast()

  const inputStyle = { size: 'md' }

  const handleClear = () => {
    setSelectedItems([])
    setToggleClear(true)
    onClose()
  }

  const [createSupport, { loading: createLoading }] = useMutation(
    componentSupportLevelBulkCreate,
    { onCompleted: () => handleClear() }
  )
  const [updateSupport, { loading: updateLoading }] = useMutation(
    ComponentSupportLevelBulkUpdate,
    { onCompleted: () => handleClear() }
  )

  const componentIds = selectedItems
    ?.filter((item) => item?.componentSupportLevel === null)
    ?.map((comp) => comp?.id)
  const supportIds = selectedItems
    ?.filter((item) => item?.componentSupportLevel !== null)
    ?.map((sup) => sup?.componentSupportLevel?.id)

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
    const isUnspecified =
      name === 'supportLevel' && (value === 'unspecified' || noLongerMaintained)
    if (isUnspecified) {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        endOfSupport: '',
        explanation: '',
        assessmentExpiresOn: ''
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const handleDateChange = (newDate, field) => {
    setFormData((prev) => ({
      ...prev,
      [field]: newDate ? newDate._d : ''
    }))
  }

  const handleUpdate = (data) => {
    setToggleClear(false)
    const ids = data?.length > 0 ? data?.map((item) => item) : []
    updateSupport({
      variables: {
        ids: ids,
        level: formData?.supportLevel || undefined,
        notes: formData?.explanation || undefined,
        retainManualOverrideFor: totalDays > 0 ? totalDays : undefined,
        endDate: formData?.endOfSupport
          ? new Date(formData?.endOfSupport).toISOString()
          : undefined
      }
    }).then((res) => {
      const { errors } = res?.data?.componentSupportLevelBulkUpdate || {}
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

  const handleCreate = (data) => {
    setToggleClear(false)
    const ids = data?.length > 0 ? data?.map((item) => item) : []
    createSupport({
      variables: {
        ids: ids,
        level: formData?.supportLevel || undefined,
        notes: formData?.explanation || undefined,
        retainManualOverrideFor: totalDays > 0 ? totalDays : undefined,
        endDate: formData?.endOfSupport
          ? new Date(formData?.endOfSupport).toISOString()
          : undefined
      }
    }).then((res) => {
      const { errors } = res?.data?.componentSupportLevelBulkCreate || {}
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

  const handleSubmit = () => {
    if (supportIds?.length > 0) {
      handleUpdate(supportIds)
    } else {
      handleCreate(componentIds)
    }
  }

  return (
    <LynkModal
      isOpen={isOpen}
      onClose={onClose}
      Icon={SupportIcon}
      title={'Add Status'}
      disabled={isDisabled}
      onSubmit={handleSubmit}
      isLoading={createLoading || updateLoading}
      buttonText={supportIds?.length > 0 ? 'Update' : 'Save'}
    >
      <Stack spacing={4}>
        {/* SUPPRT LEVEL */}
        <FormControl>
          <FormLabel htmlFor='supportLevel'>Support Level</FormLabel>
          <Select
            sx={inputStyle}
            name='supportLevel'
            value={formData?.supportLevel}
            isDisabled={isCustomerView}
            onChange={handleChange}
          >
            <option value='' style={{ background: 'lightgray' }}>
              -- Select --
            </option>
            <option value='unspecified'>Unspecified</option>
            <option value='actively_maintained'>Actively Maintained</option>
            <option value='no_longer_maintained'>No Longer Maintained</option>
            <option value='abandoned'>Abandoned</option>
          </Select>
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
          isRequired
          hidden={noLongerMaintained}
          isInvalid={totalDays > 365}
        >
          <FormLabel htmlFor='assessmentExpiresOn'>
            Assessment Expires On
          </FormLabel>
          <LynkDate
            name='assessmentExpiresOn'
            value={formData?.assessmentExpiresOn}
            onChange={(value) => handleDateChange(value, 'assessmentExpiresOn')}
          />
          <FormErrorMessage>
            Value must be between 1 and 365 days
          </FormErrorMessage>
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
