import { useCallback, useEffect, useRef } from 'react'

import {
  Box,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement
} from '@chakra-ui/react'

import { useThemeColor } from 'hooks/useThemeColors'

import { LuSearch, LuX } from 'react-icons/lu'

const ProductSearchFilter = ({
  id,
  filterText,
  onChange,
  onFilter,
  onClear
}) => {
  const searchInputRef = useRef()
  const { secondaryTextColor } = useThemeColor(['secondaryTextColor'])
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
            <LuSearch fontSize={18} color={secondaryTextColor} />
          </InputLeftElement>
          <Input
            id={id}
            name={id}
            type='text'
            placeholder='Search...'
            _placeholder={{ color: secondaryTextColor }}
            ref={searchInputRef}
            value={filterText}
            onChange={onChange}
            onKeyDown={onFilter}
          />
          <InputRightElement hidden={filterText === ''}>
            <LuX onClick={onClear} fontSize={18} cursor={'pointer'} />
          </InputRightElement>
        </InputGroup>
      </Box>
    </>
  )
}

export default ProductSearchFilter
