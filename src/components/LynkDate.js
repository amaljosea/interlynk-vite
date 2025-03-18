import { useState } from 'react'
import Datetime from 'react-datetime'
import 'react-datetime/css/react-datetime.css'

// import { useParams } from 'react-router-dom'
import { useColorMode } from '@chakra-ui/react'

import { useThemeColor } from 'hooks/useThemeColors'

const LynkDate = (props) => {
  // const params = useParams()
  const { colorMode } = useColorMode()
  const [focus, setFocus] = useState(false)
  const { primaryBlueBorder, grayBorderColor } = useThemeColor([
    'primaryBlueBorder',
    'grayBorderColor'
  ])
  // ${params?.sbomid && 'picker_top'}
  const react_datatime = `${colorMode === 'light' ? 'light_picker' : 'dark_picker'}`
  const border = focus
    ? `2px solid ${primaryBlueBorder}`
    : `1px solid ${grayBorderColor}`

  return (
    <Datetime
      {...props}
      utc={true}
      timeFormat={false}
      closeOnSelect={true}
      className={react_datatime}
      inputProps={{
        name: props?.name,
        placeholder: 'Select date',
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
