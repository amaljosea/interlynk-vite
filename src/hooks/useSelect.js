import { useColorModeValue } from '@chakra-ui/system'

import { useThemeColor } from 'hooks/useThemeColors'

export const useSelect = (type) => {
  const isBreadcrumb = type === 'breadcrumb'
  const isVersion = type === 'version'
  const { primaryTextColor, primaryBgColor } = useThemeColor([
    'primaryTextColor',
    'primaryBgColor'
  ])

  const optionColor = useColorModeValue('#718096', '#A0AEC0')
  const textHoverColor = useColorModeValue('#EDF2F7', '#4A5568')
  const borderColor = useColorModeValue('#E2E8F0', '#4A5568')
  const btnBgColor = useColorModeValue('#EDF2F7', '#ffffff14')
  const bgHoverColor = useColorModeValue('#e2e8f0', '#4A5568')

  const selectStyles = {
    control: (baseStyles, state) => ({
      ...baseStyles,
      color: primaryTextColor,
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
      backgroundColor: primaryBgColor,
      width: isBreadcrumb ? '130px' : '100%'
    }),
    menuList: (provided) => ({
      ...provided,
      zIndex: 1111,
      backgroundColor: primaryBgColor,
      '&:hover': {
        backgroundColor: 'transparent'
      }
    }),
    input: (provided) => ({
      ...provided,
      color: primaryTextColor,
      backgroundColor: 'transparent'
    }),
    option: (provided) => ({
      ...provided,
      color: optionColor,
      backgroundColor: primaryBgColor,
      // textTransform: 'capitalize',
      '&:hover': {
        backgroundColor: textHoverColor
      }
    }),
    singleValue: (provided) => ({
      ...provided,
      color: primaryTextColor,
      '&:hover': {
        color: primaryTextColor
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
        height: isBreadcrumb ? '32px' : '39px',
        paddingLeft: isVersion ? '36px' : 'auto'
      }
    }
  }

  return { style: selectStyles }
}
