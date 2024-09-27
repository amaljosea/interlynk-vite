import { useCallback, useEffect, useRef } from 'react'

import { CloseIcon, SearchIcon } from '@chakra-ui/icons'
import {
  Box,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement
} from '@chakra-ui/react'

import { useThemeColor } from 'hooks/useThemeColors'

const SearchFilter = ({ id, filterText, onChange, onFilter, onClear }) => {
  const searchInputRef = useRef()
  const { primaryBlueText } = useThemeColor(['primaryBlueText'])
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
          <InputRightElement hidden={filterText === ''}>
            <CloseIcon
              onClick={onClear}
              sx={{ fontSize: 10, cursor: 'pointer' }}
            />
          </InputRightElement>
        </InputGroup>
      </Box>
    </>
  )
}

export default SearchFilter
