import { useKBar } from 'kbar'
import React from 'react'
import { getSignedUrlParams } from 'utils'
import { detectOS } from 'utils'

import { SearchIcon } from '@chakra-ui/icons'
import { Box, Input, InputGroup, InputLeftElement, Kbd } from '@chakra-ui/react'

import { useThemeColor } from 'hooks/useThemeColors'

export const SearchBar = () => {
  const { query } = useKBar()

  const signedUrlParams = getSignedUrlParams()
  const { secondaryBgColor, secondaryTextColor } = useThemeColor([
    'secondaryBgColor',
    'secondaryTextColor'
  ])

  const os = detectOS()

  return (
    <InputGroup
      size='sm'
      width={'250px'}
      pos={'relative'}
      display={signedUrlParams ? 'none' : 'block'}
    >
      <InputLeftElement>
        <SearchIcon color={secondaryTextColor} />
      </InputLeftElement>
      <Input
        isReadOnly
        bg={secondaryBgColor}
        border='none'
        borderRadius={6}
        placeholder='Search..'
        onClick={query?.toggle}
      />
      <Box pos='absolute' top='0.2rem' right={1.5}>
        <Kbd>{os?.startsWith('Windows') ? 'Ctrl' : 'Cmd'} + K</Kbd>
      </Box>
    </InputGroup>
  )
}
