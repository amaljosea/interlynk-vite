/* eslint-disable */
import { useColorModeValue } from '@chakra-ui/system'

import { useThemeColor } from 'hooks/useThemeColors'

export const useSelect = (type) => {
  const isBreadcrumb = type === 'breadcrumb'
  const isVersion = type === 'version'
  const isLynkSelect = type === 'lynkSelect'

  const {
    primaryBlueText,
    primaryTextColor,
    primaryBgColor,
    secondaryTextInverse,
    secondaryBgColor,
    grayBorderColor
  } = useThemeColor([
    'primaryBlueText',
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
      padding: '0 6px',
      opacity: state.isDisabled ? 0.5 : 1,
      maxWidth: isBreadcrumb ? '200px' : isLynkSelect ? '100%' : 'inherit',
      minWidth: isBreadcrumb ? '120px' : 'inherit',
      minHeight: isBreadcrumb ? '6px' : 'inherit',
      border: isBreadcrumb ? 'none' : 'auto',
      fontSize: '14px',
      backgroundColor: isBreadcrumb ? secondaryBgColor : 'transparent',
      '&:hover': {
        borderColor: isBreadcrumb
          ? 'transparent'
          : state.isFocused
            ? primaryBlueText
            : grayBorderColor,
        backgroundColor: isBreadcrumb ? grayBorderColor : 'transparent'
      },
      outline:
        isBreadcrumb && state.isFocused
          ? `${primaryBlueText} solid 1px`
          : 'none',
      boxShadow: state.isFocused ? 'none' : baseStyles?.boxShadow,
      borderColor: isBreadcrumb
        ? 'transparent'
        : state.isFocused
          ? primaryBlueText
          : grayBorderColor
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
    option: (provided, state) => ({
      ...provided,
      color: isBreadcrumb ? primaryTextColor : secondaryTextInverse,
      backgroundColor: state?.isFocused
        ? 'rgba(0, 0, 0, 0.04)'
        : primaryBgColor,
      textOverflow: 'ellipsis',
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
      overflow: 'hidden',
      textTransform: 'capitalize'
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
    placeholder: (provided) => ({
      ...provided,
      color: primaryTextColor
    })
  }

  return { style: selectStyles }
}
