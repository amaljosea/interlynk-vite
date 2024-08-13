import { useCallback, useEffect, useRef } from 'react'

import { CloseIcon, SearchIcon } from '@chakra-ui/icons'
import { Box, Input, InputGroup, InputLeftElement } from '@chakra-ui/react'

const SearchFilter = ({ id, filterText, onChange, onFilter, onClear }) => {
  const searchInputRef = useRef()

  const focusSearchInput = () => {
    if (searchInputRef?.current) {
      searchInputRef?.current.focus()
    }
  }

  const handleKeyPress = useCallback((e) => {
    if (e.ctrlKey && e.key === '/') {
      focusSearchInput()
    }
  }, [])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress)
    return () => {
      window.removeEventListener('keydown', handleKeyPress)
    }
  }, [handleKeyPress])

  return (
    <>
      <Box pos={'relative'} width={'300px'}>
        <InputGroup>
          <InputLeftElement pointerEvents='none'>
            <SearchIcon color='#60686F' />
          </InputLeftElement>
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
        </InputGroup>
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
