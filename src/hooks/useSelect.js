import { useThemeColor } from 'hooks/useThemeColors'

export const useSelect = (type) => {
  const isBreadcrumb = type === 'breadcrumb'
  const isVersion = type === 'version'
  const {
    primaryTextColor,
    primaryBgColor,
    secondaryTextInverse,
    secondaryBgColor,
    grayBorderColor
  } = useThemeColor([
    'primaryTextColor',
    'primaryBgColor',
    'secondaryTextInverse',
    'secondaryBgColor',
    'grayBorderColor'
  ])

  const selectStyles = {
    control: (baseStyles, state) => ({
      ...baseStyles,
      color: primaryTextColor,
      overflow: 'hidden',
      minHeight: isBreadcrumb ? '6px' : 'inherit',
      maxWidth: isBreadcrumb ? '200px' : 'inherit',
      border: isBreadcrumb ? 'none' : 'auto',
      fontSize: '14px',
      backgroundColor: isBreadcrumb ? secondaryBgColor : 'transparent',
      '&:hover': {
        borderColor: isBreadcrumb ? 'transparent' : grayBorderColor,
        backgroundColor: isBreadcrumb ? grayBorderColor : 'transparent'
      },
      boxShadow: state.isFocused ? 'none' : baseStyles?.boxShadow,
      borderColor:
        isBreadcrumb && state.isFocused ? 'transparent' : grayBorderColor
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
      color: secondaryTextInverse,
      backgroundColor: primaryBgColor,

      '&:hover': {
        backgroundColor: secondaryBgColor
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
