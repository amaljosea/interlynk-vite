import { useColorModeValue } from '@chakra-ui/system'

export const useSelect = (type) => {
  const isBreadcrumb = type === 'breadcrumb'
  const textColor = useColorModeValue('#1A202C', '#F7FAFC')
  const bgColor = useColorModeValue('#F7FAFC', '#1A202C')
  const optionColor = useColorModeValue('#718096', '#A0AEC0')
  const textHoverColor = useColorModeValue('#EDF2F7', '#4A5568')
  const borderColor = useColorModeValue('#E2E8F0', '#4A5568')
  const btnBgColor = useColorModeValue('#EDF2F7', '#ffffff14')
  const bgHoverColor = useColorModeValue('#e2e8f0', '#4A5568')

  const selectStyles = {
    control: (baseStyles, state) => ({
      ...baseStyles,
      color: textColor,
      overflow: 'hidden',
      minHeight: isBreadcrumb ? '6px' : 'inherit',
      maxWidth: isBreadcrumb ? '200px' : 'inherit',
      border: isBreadcrumb ? 'none' : 'auto',
      fontSize: '14px',
      backgroundColor: isBreadcrumb ? btnBgColor : 'transparent',
      '&:hover': {
        borderColor: isBreadcrumb ? 'transparent' : borderColor,
        backgroundColor: isBreadcrumb ? bgHoverColor : 'transparent'
      },
      boxShadow: state.isFocused ? 'none' : baseStyles?.boxShadow,
      borderColor: isBreadcrumb && state.isFocused ? 'transparent' : borderColor
    }),
    menu: (provided) => ({
      ...provided,
      zIndex: 1111,
      backgroundColor: bgColor,
      width: isBreadcrumb ? '130px' : '100%'
    }),
    menuList: (provided) => ({
      ...provided,
      zIndex: 1111,
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
      // textTransform: 'capitalize',
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
    }),
    multiValueRemove: (provided) => ({
      ...provided,
      color: 'red',
      ':hover': {
        backgroundColor: 'red',
        color: 'white'
      }
    }),
    dropdownIndicator: (provided) => {
      return {
        ...provided,
        padding: '0 8px 0 0'
      }
    },
    valueContainer: (provided) => {
      return {
        ...provided,
        height: isBreadcrumb ? '32px' : '39px'
        // padding: isBreadcrumb ? '1px 5px' : '5px 10px'
      }
    }
  }

  return { style: selectStyles }
}
