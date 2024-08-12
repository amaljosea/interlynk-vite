import React from 'react'
import { components } from 'react-select'

import { FaChevronDown } from 'react-icons/fa6'
import { useColorModeValue } from '@chakra-ui/system'

const CustomDropdownIndicator = (props) => {
  const color = useColorModeValue('darkgray','lightgray')
  return (
    <components.DropdownIndicator {...props}>
      <FaChevronDown size={10} color={color} />
    </components.DropdownIndicator>
  )
}

export default CustomDropdownIndicator
