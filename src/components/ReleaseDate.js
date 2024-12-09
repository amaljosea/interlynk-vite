import { useEffect, useRef, useState } from 'react'
import { getSignedUrlParams } from 'utils'

import { Box, IconButton, Tooltip } from '@chakra-ui/react'

import { FaCalendarAlt } from 'react-icons/fa'

import LynkDate from './LynkDate'

const ReleaseDate = ({ status, updateSboms, noPrimaryComp }) => {
  const signedUrlParams = getSignedUrlParams()

  const [selectedDate, setSelectedDate] = useState(null)
  const [isPickerOpen, setPickerOpen] = useState(false)
  const datePickerRef = useRef(null)

  const handleDateChange = (date) => {
    setSelectedDate(date)
    setPickerOpen(false)
  }

  const handleClickOutside = (event) => {
    if (
      datePickerRef.current &&
      !datePickerRef.current.contains(event.target)
    ) {
      setPickerOpen(false)
    }
  }

  useEffect(() => {
    if (isPickerOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    } else {
      document.removeEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isPickerOpen])

  return (
    <Box position='relative'>
      <Tooltip label={'Release Date'}>
        <IconButton
          colorScheme='blue'
          icon={<FaCalendarAlt />}
          display={signedUrlParams ? 'none' : 'flex'}
          onClick={() => setPickerOpen(!isPickerOpen)}
          isDisabled={status === 'signed' || !updateSboms || noPrimaryComp}
        />
      </Tooltip>
      {isPickerOpen && (
        <Box
          position='absolute'
          right={2}
          zIndex='10'
          p={1.5}
          ref={datePickerRef}
        >
          <LynkDate
            value={selectedDate}
            onChange={handleDateChange}
            input={false}
          />
        </Box>
      )}
    </Box>
  )
}

export default ReleaseDate
