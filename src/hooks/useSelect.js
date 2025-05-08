/* eslint-disable */
import { useParams } from 'react-router-dom'

import { useThemeColor } from 'hooks/useThemeColors'

export const useSelect = (type, category) => {
  const params = useParams()
  const isBreadcrumb = type === 'breadcrumb'
  const isVersion = type === 'version'
  const isLynkSelect = type === 'lynkSelect'

  const isActive =
    category === 'version' || (!params?.sbomid && !params?.vulnerabilityid)

  const {
    primaryBlueText,
    primaryTextColor,
    primaryBgColor,
    secondaryTextColor,
    secondaryTextInverse,
    secondaryBgColor,
    grayBorderColor
  } = useThemeColor([
    'primaryBlueText',
    'primaryTextColor',
    'primaryBgColor',
    'secondaryTextColor',
    'secondaryTextInverse',
    'secondaryBgColor',
    'grayBorderColor'
  ])

  const selectStyles = {
    container: (provided) => ({
      ...provided,
      width: '100%'
    }),
    control: (baseStyles, state) => ({
      ...baseStyles,
      color: primaryTextColor,
      overflow: 'hidden',
      padding: isBreadcrumb ? 0 : '0 6px',
      opacity: state.isDisabled ? 0.5 : 1,
      cursor: isBreadcrumb ? 'pointer' : 'text',
      maxWidth: isBreadcrumb ? '200px' : isLynkSelect ? '100%' : 'inherit',
      minWidth: isBreadcrumb ? '120px' : 'inherit',
      minHeight: isBreadcrumb ? '6px' : 'inherit',
      border: isBreadcrumb ? 'none' : 'auto',
      fontSize: '14px',
      backgroundColor: 'transparent',
      '&:hover': {
        borderColor: isBreadcrumb
          ? 'transparent'
          : state.isFocused
            ? primaryBlueText
            : grayBorderColor,
        backgroundColor: 'transparent'
      },
      outline:
        !isBreadcrumb && state.isFocused
          ? `${primaryBlueText} solid 1.5px`
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
      backgroundColor: primaryBgColor,
      zIndex: 1111,
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
      fontSize: isLynkSelect && '14px',
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
      color: isActive ? primaryTextColor : secondaryTextColor
    })
  }

  return { style: selectStyles }
}
