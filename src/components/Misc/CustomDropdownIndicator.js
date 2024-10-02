import React from 'react'
import { components } from 'react-select'

import { useThemeColor } from 'hooks/useThemeColors'

import { FaChevronDown } from 'react-icons/fa6'

const CustomDropdownIndicator = (props) => {
  const { inverseSecondaryBgColor } = useThemeColor(['inverseSecondaryBgColor'])
  return (
    <components.DropdownIndicator {...props}>
      <FaChevronDown size={10} color={inverseSecondaryBgColor} />
    </components.DropdownIndicator>
  )
}

export default CustomDropdownIndicator
