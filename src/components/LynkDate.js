import { useState } from 'react'
import Datetime from 'react-datetime'
import 'react-datetime/css/react-datetime.css'
import { useParams } from 'react-router-dom'

import { useColorMode, useColorModeValue } from '@chakra-ui/system'

const LynkDate = (props) => {
  const params = useParams()
  const { colorMode } = useColorMode()
  const [focus, setFocus] = useState(false)
  const borderColor = useColorModeValue('#3182ce', '#63b3ed')
  const defaultColor = useColorModeValue('#E2E8F0', '#ffffff29')
  const react_datatime = `${params?.sbomid && 'picker_top'} ${colorMode === 'light' ? 'light_picker' : 'dark_picker'}`
  const border = focus
    ? `2px solid ${borderColor}`
    : `1px solid ${defaultColor}`

  return (
    <Datetime
      {...props}
      timeFormat={false}
      closeOnSelect={true}
      className={react_datatime}
      inputProps={{
        placeholder: 'Select Date',
        onBlur: () => setFocus(false),
        onFocus: () => setFocus(true),
        onCopy: (e) => e.preventDefault(),
        onPaste: (e) => e.preventDefault(),
        style: {
          border: border,
          outline: 'none',
          fontSize: '14px',
          boxShadow: 'none',
          background: 'none'
        }
      }}
    />
  )
}

export default LynkDate
