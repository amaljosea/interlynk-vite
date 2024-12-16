import { useMutation } from '@apollo/client'
import { useState } from 'react'

import {
  Checkbox,
  FormControl,
  FormErrorMessage,
  FormLabel
} from '@chakra-ui/react'

import LynkDate from 'components/LynkDate'
import LynkModal from 'components/LynkModal'

import { CreateShareLynk } from 'graphQL/Mutation'

import { BiShare } from 'react-icons/bi'

const CreateSharelynk = ({ isOpen, onClose, defaultDate, groupId }) => {
  const [createLynk, { loading }] = useMutation(CreateShareLynk)

  const [selectedDate, setSelectedDate] = useState(null)
  const [isValidDate, setIsValidDate] = useState(true)
  const [noExpire, setNoExpire] = useState(false)

  const handleDateChange = (newDate) => {
    const currentDate = new Date()
    const isValidDate = newDate && !isNaN(newDate) && newDate?._d > currentDate
    setSelectedDate(newDate._d)
    if (isValidDate) {
      setIsValidDate(true)
    } else {
      if (typeof newDate === 'string' && newDate === '') {
        setIsValidDate(true)
      } else {
        setIsValidDate(false)
      }
    }
  }

  const handleExpireChange = (e) => {
    const { checked } = e.target
    setNoExpire(checked)
    setIsValidDate(true)
    if (checked === true) {
      setSelectedDate('')
    } else {
      setSelectedDate(defaultDate)
    }
  }

  const handleCreateLynk = () => {
    createLynk({
      variables: {
        enabled: true,
        id: [groupId],
        expiresAt: noExpire ? undefined : new Date(selectedDate).toISOString()
      }
    }).then((res) => {
      if (res?.data) {
        onClose()
      }
    })
    setSelectedDate('')
    setNoExpire(false)
  }

  const isDisabled =
    (selectedDate !== '' && !isValidDate) ||
    (!selectedDate && noExpire === false)

  return (
    <LynkModal
      Icon={BiShare}
      isOpen={isOpen}
      onClose={onClose}
      buttonText={'Add'}
      isLoading={loading}
      disabled={isDisabled}
      title={'Create ShareLynk'}
      onSubmit={handleCreateLynk}
    >
      {!noExpire && (
        <FormControl mb={3} isInvalid={!isValidDate}>
          <FormLabel htmlFor='expire'>Expiration Date</FormLabel>
          <LynkDate value={selectedDate} onChange={handleDateChange} />
          {!isValidDate && (
            <FormErrorMessage>
              Please enter a valid expiry date
            </FormErrorMessage>
          )}
        </FormControl>
      )}
      <FormControl mb={3}>
        <Checkbox isChecked={noExpire} onChange={handleExpireChange}>
          No Expiration
        </Checkbox>
      </FormControl>
    </LynkModal>
  )
}

export default CreateSharelynk
