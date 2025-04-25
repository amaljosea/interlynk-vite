import { useKBar } from 'kbar'
import React from 'react'
import { getSignedUrlParams } from 'utils'

import { Search2Icon } from '@chakra-ui/icons'
import { Button } from '@chakra-ui/react'

import { useThemeColor } from 'hooks/useThemeColors'

export const SearchBar = () => {
  const { query } = useKBar()

  const signedUrlParams = getSignedUrlParams()
  const { secondaryTextColor } = useThemeColor(['secondaryTextColor'])

  return (
    <Button
      size={'sm'}
      variant={'ghost'}
      onClick={query?.toggle}
      display={signedUrlParams ? 'none' : 'block'}
      mt={-0.5}
    >
      <Search2Icon color={secondaryTextColor} />
    </Button>
  )
}
