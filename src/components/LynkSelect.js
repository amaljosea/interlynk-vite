import ReactSelect from 'react-select'

import { useColorModeValue } from '@chakra-ui/system'

const LynkSelect = (props) => {
  const textColor = useColorModeValue('#1A202C', '#F7FAFC')
  const bgColor = useColorModeValue('#F7FAFC', '#1A202C')
  const optionColor = useColorModeValue('#718096', '#A0AEC0')
  const textHoverColor = useColorModeValue('#EDF2F7', '#4A5568')
  const borderColor = useColorModeValue('#CBD5E0', '#4A5568')

  const selectStyles = {
    control: (baseStyles) => ({
      ...baseStyles,
      color: textColor,
      backgroundColor: 'transparent',
      borderColor: borderColor,
      fontSize: '14px',
      padding: '2px 0',
      '&:hover': {
        borderColor: borderColor,
        backgroundColor: 'transparent'
      }
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: bgColor
    }),
    menuList: (provided) => ({
      ...provided,
      backgroundColor: bgColor,
      '&:hover': {
        backgroundColor: 'transparent'
      }
    }),
    input: (provided) => ({
      ...provided,
      color: textColor,
      backgroundColor: 'transparent'
    }),
    option: (provided) => ({
      ...provided,
      color: optionColor,
      backgroundColor: bgColor,
      '&:hover': {
        backgroundColor: textHoverColor
      }
    }),
    singleValue: (provided) => ({
      ...provided,
      color: textColor,
      '&:hover': {
        color: textColor
      }
    })
  }

  return (
    <ReactSelect styles={selectStyles} className='react-select' {...props} />
  )
}

export default LynkSelect
