import React from 'react'
import { components } from 'react-select'

import { useThemeColor } from 'hooks/useThemeColors'


import { LuChevronDown } from 'react-icons/lu'

const CustomDropdownIndicator = (props) => {
  const { inverseSecondaryBgColor } = useThemeColor(['inverseSecondaryBgColor'])
  return (
    <components.DropdownIndicator {...props}>
      <LuChevronDown size={18} color={inverseSecondaryBgColor} />
    </components.DropdownIndicator>
  )
}

export default CustomDropdownIndicator
