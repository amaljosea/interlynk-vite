import { CloseIcon } from '@chakra-ui/icons'
import { Box, Input } from '@chakra-ui/react'
import { useEffect, useRef } from 'react'

const SearchFilter = ({ filterText, onFilter, onClear }) => {
  const searchInputRef = useRef()

  const focusSearchInput = () => {
    if (searchInputRef?.current) {
      searchInputRef?.current.focus()
    }
  }

  const handleKeyPress = (e) => {
    if (e.ctrlKey && e.key === '/') {
      focusSearchInput()
    }
  }

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress)

    return () => {
      window.removeEventListener('keydown', handleKeyPress)
    }
  }, [])

  return (
    <>
      <Box pos={'relative'} width={'300px'}>
        <Input
          id='search'
          type='text'
          placeholder='Search'
          aria-label='Search Input'
          ref={searchInputRef}
          value={filterText}
          onChange={onFilter}
        />
        {filterText !== '' && (
          <CloseIcon
            w={'18px'}
            h={'18px'}
            bg={'blue.500'}
            color={'white'}
            p={1}
            rounded={'full'}
            position={'absolute'}
            zIndex={9999}
            right={3}
            top={'11px'}
            onClick={onClear}
            cursor={'pointer'}
          />
        )}
      </Box>
    </>
  )
}

export default SearchFilter
