/* eslint-disable */
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
      maxWidth: isBreadcrumb ? '200px' : 'inherit',
      minWidth: isBreadcrumb ? '120px' : 'inherit',
      minHeight: isBreadcrumb ? '6px' : 'inherit',
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
      width: '100%'
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
      color: isBreadcrumb ? primaryTextColor : secondaryTextInverse,
      backgroundColor: primaryBgColor,
      textOverflow: 'ellipsis',
      // textTransform: 'capitalize',
      '&:hover': {
        backgroundColor: secondaryBgColor
      }
    }),
    singleValue: (provided) => ({
      ...provided,
      color: primaryTextColor,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      '&:hover': {
        color: primaryTextColor
      }
    }),
    multiValue: (provided) => ({
      ...provided,
      backgroundColor: '#EDF2F7',
      whiteSpace: 'nowrap',
      overflow: 'hidden'
    }),
    multiValueRemove: (provided) => ({
      ...provided,
      color: '#A0AEC0',
      backgroundColor: 'transparent',
      ':hover': {
        color: '#A0AEC0'
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
    },
    clearIndicator: (provided, state) => ({
      ...provided,
      cursor: 'pointer',
      color: state.isFocused ? 'lightgray' : 'lightgray',
      '&:hover': {
        color: '#4299e1'
      }
    })
  }

  return { style: selectStyles }
}
