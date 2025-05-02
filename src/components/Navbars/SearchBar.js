import { useKBar } from 'kbar'

import { IconButton } from '@chakra-ui/react'

import { useThemeColor } from 'hooks/useThemeColors'

import { LuSearch } from 'react-icons/lu'

export const SearchBar = () => {
  const { query } = useKBar()

  const { secondaryTextColor } = useThemeColor(['secondaryTextColor'])

  return (
    <IconButton
      size={'sm'}
      variant={'ghost'}
      onClick={query?.toggle}
      icon={<LuSearch fontSize={20} color={secondaryTextColor} />}
    />
  )
}
