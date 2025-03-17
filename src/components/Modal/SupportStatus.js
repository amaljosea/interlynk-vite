import { useMutation } from '@apollo/client'
import { useState } from 'react'

import { FormErrorMessage, Select, Stack } from '@chakra-ui/react'
import { Input, InputGroup, InputRightAddon } from '@chakra-ui/react'
import { FormControl, FormLabel } from '@chakra-ui/react'
import { NumberInput, NumberInputField } from '@chakra-ui/react'

import { SupportIcon } from 'components/Icons/Icons'
import LynkDate from 'components/LynkDate'
import LynkModal from 'components/LynkModal'

import useCustomToast from 'hooks/useCustomToast'
import { useRouteFlags } from 'hooks/useRouteFlags'

import {
  componentSupportLevelCreate,
  componentSupportLevelUpdate
} from 'graphQL/Mutation'

const SupportStatus = ({ isOpen, selectedItems, handleClear }) => {
  const { isCustomerView } = useRouteFlags()
  const { showToast } = useCustomToast()

  const inputStyle = { size: 'md' }

  const [createSupport, { loading: createLoading }] = useMutation(
    componentSupportLevelCreate
  )
  const [updateSupport, { loading: updateLoading }] = useMutation(
    componentSupportLevelUpdate
  )

  console.warn('selectedItems', selectedItems)

  const componentIds = selectedItems?.flatMap((item) => [
    item?.id,
    ...(item.duplicates?.map((dup) => dup?.id) || [])
  ])
  const supportIds = selectedItems
    ?.filter((sup) => sup?.componentSupportLevel !== null)
    ?.flatMap((item) => [
      item?.componentSupportLevel?.id,
      ...(item?.duplicates
        ?.filter((level) => level?.componentSupportLevel !== null)
        ?.map((dup) => dup?.componentSupportLevel?.id) || [])
    ])

  const [formData, setFormData] = useState({
    supportLevel: '',
    endOfSupport: '',
    explanation: '',
    assessmentExpiresOn: 365
  })

  const isDisabled =
    (formData?.supportLevel === '' && formData?.endOfSupport === '') ||
    formData?.assessmentExpiresOn > 365

  const handleChange = (e) => {
    const { name, value } = e.target
    const isUnspecified = name === 'supportLevel' && value === 'unspecified'
    if (isUnspecified) {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        endOfSupport: '',
        explanation: '',
        assessmentExpiresOn: 0
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
    data?.map((item) => {
      updateSupport({
        variables: {
          id: item,
          level: formData?.supportLevel || undefined,
          notes: formData?.explanation || undefined,
          retainManualOverrideFor:
            Number(formData?.assessmentExpiresOn) || undefined,
          endDate: formData?.endOfSupport
            ? new Date(formData?.endOfSupport).toISOString()
            : undefined
        }
      }).then((res) => {
        const { errors } = res?.data?.componentSupportLevelCreate || {}
        if (errors?.length > 0) {
          showToast({
            description: errors[0],
            status: 'error'
          })
        } else {
          handleClear()
        }
      })
    })
  }

  const handleCreate = (data) => {
    data?.map((item) => {
      createSupport({
        variables: {
          id: item,
          level: formData?.supportLevel || undefined,
          notes: formData?.explanation || undefined,
          retainManualOverrideFor:
            Number(formData?.assessmentExpiresOn) || undefined,
          endDate: formData?.endOfSupport
            ? new Date(formData?.endOfSupport).toISOString()
            : undefined
        }
      }).then((res) => {
        const { errors } = res?.data?.componentSupportLevelCreate || {}
        if (errors?.length > 0) {
          showToast({
            description: errors[0],
            status: 'error'
          })
        } else {
          handleClear()
        }
      })
    })
  }

  const handleSubmit = async () => {
    if (componentIds?.length > 0 && supportIds?.length > 0) {
      handleUpdate(supportIds)
    }

    if (componentIds?.length > 0 && supportIds?.length === 0) {
      handleCreate(componentIds)
    }

    if (componentIds?.length === 0 && supportIds?.length > 0) {
      handleUpdate(supportIds)
    }
  }

  return (
    <LynkModal
      isOpen={isOpen}
      Icon={SupportIcon}
      buttonText={'Save'}
      title={'Add Status'}
      disabled={isDisabled}
      onClose={handleClear}
      onSubmit={handleSubmit}
      isLoading={createLoading || updateLoading}
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
        <FormControl>
          <FormLabel htmlFor='endOfSupport'>End-Of-Support Date</FormLabel>
          <LynkDate
            name='endOfSupport'
            value={formData?.endOfSupport}
            onChange={(value) => handleDateChange(value, 'endOfSupport')}
          />
        </FormControl>
        {/* RETAIN MANNUAL OVERRIDE */}
        <FormControl isRequired isInvalid={formData?.assessmentExpiresOn > 365}>
          <FormLabel htmlFor='assessmentExpiresOn'>
            Assessment Expires On
          </FormLabel>
          <InputGroup>
            <NumberInput
              w={'100%'}
              name='assessmentExpiresOn'
              value={formData?.assessmentExpiresOn}
              onChange={(valueString) =>
                setFormData((prev) => ({
                  ...prev,
                  assessmentExpiresOn: valueString
                }))
              }
            >
              <NumberInputField fontSize={'sm'} borderRightRadius={0} />
            </NumberInput>
            <InputRightAddon>Days</InputRightAddon>
          </InputGroup>
          <FormErrorMessage>Value must be between 1 and 365</FormErrorMessage>
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
