import { useEffect, useRef } from 'react'

import { CloseIcon } from '@chakra-ui/icons'
import { Box, Input } from '@chakra-ui/react'

const SearchFilter = ({ id, filterText, onChange, onFilter, onClear }) => {
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
          id={id}
          name={id}
          type='text'
          placeholder='Search'
          ref={searchInputRef}
          value={filterText}
          onChange={onChange}
          onKeyDown={onFilter}
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
            zIndex={11}
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
