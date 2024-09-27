import React from 'react'

import { SearchIcon } from '@chakra-ui/icons'
import {
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  useColorModeValue
} from '@chakra-ui/react'

import { useThemeColor } from 'hooks/useThemeColors'

export function SearchBar(props) {
  // Pass the computed styles into the `__css` prop
  const { variant, children, ...rest } = props
  // Chakra Color Mode
  const { inverseSecondaryBgColor } = useThemeColor(['inverseSecondaryBgColor'])
  const mainTeal = useColorModeValue('teal.300', 'teal.300')
  const inputBg = useColorModeValue('white', 'gray.800')
  return (
    <InputGroup
      bg={inputBg}
      borderRadius='15px'
      w='200px'
      _focus={{
        borderColor: { mainTeal }
      }}
      _active={{
        borderColor: { mainTeal }
      }}
    >
      <InputLeftElement>
        <IconButton
          bg='inherit'
          borderRadius='inherit'
          _hover='none'
          _active={{
            bg: 'inherit',
            transform: 'none',
            borderColor: 'transparent'
          }}
          _focus={{
            boxShadow: 'none'
          }}
          icon={
            <SearchIcon color={inverseSecondaryBgColor} w='15px' h='15px' />
          }
        />
      </InputLeftElement>
      <Input
        fontSize='xs'
        py='11px'
        placeholder='Type here...'
        borderRadius='inherit'
      />
    </InputGroup>
  )
}
