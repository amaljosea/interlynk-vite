import { gql, useMutation } from '@apollo/client'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { stages } from 'variables/general'

import { FormControl, FormLabel, Stack } from '@chakra-ui/react'

import LynkAlert from 'components/LynkAlert'
import LynkDate from 'components/LynkDate'
import LynkModal from 'components/LynkModal'
import LynkSelect from 'components/LynkSelect'

import useCustomToast from 'hooks/useCustomToast'

import { FaLifeRing } from 'react-icons/fa6'

const UpdateLifecycle = gql`
  mutation sbomUpdate(
    $id: Uuid!
    $stage: String
    $releaseDate: ISO8601Date
    $endOfLifeDate: ISO8601Date
    $endOfSupportDate: ISO8601Date
  ) {
    sbomUpdate(
      input: {
        id: $id
        productLifeCycleStage: $stage
        releaseDate: $releaseDate
        endOfLifeDate: $endOfLifeDate
        endOfSupportDate: $endOfSupportDate
      }
    ) {
      errors
      sbom {
        id
      }
    }
  }
`

const LifecycleModal = ({ data, isOpen, onClose }) => {
  const params = useParams()
  const { showToast } = useCustomToast()
  const [updateStage, { loading }] = useMutation(UpdateLifecycle)

  const [formData, setFormData] = useState({
    stage: undefined,
    releaseDate: new Date(),
    endOfLifeDate: new Date(),
    endOfSupportDate: new Date()
  })
  const [error, setError] = useState('')

  const handleSelect = (selectedItem, name) => {
    const { value } = selectedItem
    setFormData((prev) => ({
      ...prev,
      [name]: value === '' ? undefined : value
    }))
    setError('')
  }
  const handleDateChange = (type, newDate) => {
    const isValidDate = newDate && !isNaN(newDate)
    setFormData((prev) => ({ ...prev, [type]: newDate?._d || undefined }))
    if (newDate && !isValidDate) {
      setError('Please enter a valid date')
    } else {
      setError('')
    }
  }

  const closeModal = () => {
    onClose()
    setError('')
  }

  const handleSubmit = () => {
    const { stage, releaseDate, endOfLifeDate, endOfSupportDate } =
      formData || ''
    updateStage({
      variables: {
        id: params?.sbomid,
        stage: stage || undefined,
        releaseDate: stage === 'released' ? releaseDate : undefined,
        endOfLifeDate: stage === 'end_of_life' ? endOfLifeDate : undefined,
        endOfSupportDate:
          stage === 'end_of_support' ? endOfSupportDate : undefined
      }
    }).then((res) => {
      if (res?.data?.sbomUpdate?.errors?.length > 0) {
        setError(res?.data?.sbomUpdate?.errors[0])
      } else {
        showToast({
          description: 'Lifecycle updated successfully',
          status: 'success'
        })
        closeModal()
      }
    })
  }

  useEffect(() => {
    if (data) {
      const { stage, releaseDate, endOfLifeDate, endOfSupportDate } = data || ''
      setFormData(() => ({
        stage: stage || undefined,
        releaseDate: releaseDate ? new Date(releaseDate) : undefined,
        endOfLifeDate: endOfLifeDate ? new Date(endOfLifeDate) : undefined,
        endOfSupportDate: endOfSupportDate
          ? new Date(endOfSupportDate)
          : undefined
      }))
    }
  }, [data])

  const stageOptions = [{ value: '', label: '-- Select --' }, ...(stages || [])]

  return (
    <LynkModal
      isOpen={isOpen}
      Icon={FaLifeRing}
      onClose={closeModal}
      isLoading={loading}
      buttonText={'Save'}
      onSubmit={handleSubmit}
      disabled={!formData?.stage}
      title={`${data?.length > 0 ? 'Update' : 'Add'} Lifecycle`}
    >
      <Stack spacing={4}>
        {error && <LynkAlert msg={error} />}
        <FormControl isRequired>
          <FormLabel htmlFor='stage'>Stage</FormLabel>
          <LynkSelect
            name='stage'
            value={
              stageOptions.find((opt) => opt.value === formData?.stage) || null
            }
            onChange={(selected) => handleSelect(selected, 'stage')}
            options={stageOptions}
            placeholder='-- Select --'
            dropDown
          />
        </FormControl>
        <FormControl
          hidden={formData?.stage !== 'released'}
          isRequired={formData?.stage === 'released'}
        >
          <FormLabel htmlFor='releaseDate'>Release</FormLabel>
          <LynkDate
            value={formData?.releaseDate}
            onChange={(newDate) => handleDateChange('releaseDate', newDate)}
          />
        </FormControl>
        <FormControl
          hidden={formData?.stage !== 'end_of_life'}
          isRequired={formData?.stage === 'end_of_life'}
        >
          <FormLabel htmlFor='endOfLifeDate'>End Of Life</FormLabel>
          <LynkDate
            value={formData?.endOfLifeDate}
            onChange={(newDate) => handleDateChange('endOfLifeDate', newDate)}
          />
        </FormControl>
        <FormControl
          hidden={formData?.stage !== 'end_of_support'}
          isRequired={formData?.stage === 'end_of_support'}
        >
          <FormLabel htmlFor='endOfSupportDate'>End Of Support</FormLabel>
          <LynkDate
            value={formData?.endOfSupportDate}
            onChange={(newDate) =>
              handleDateChange('endOfSupportDate', newDate)
            }
          />
        </FormControl>
      </Stack>
    </LynkModal>
  )
}

export default LifecycleModal
