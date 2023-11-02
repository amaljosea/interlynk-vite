import { CloseIcon } from '@chakra-ui/icons'
import { Box, Input } from '@chakra-ui/react'
import GlobalContext from 'context/GlobalContext'
import { useContext, useEffect, useRef, useState } from 'react'

const SearchFilter = ({ onFilter, onClear }) => {
  const searchInputRef = useRef()
  const { vulnSearchInput, setVulnSearchInput } = useContext(GlobalContext)

  const [focused, setFocused] = useState(false)
  const onFocus = () => setFocused(true)
  const onBlur = () => setFocused(false)

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

  useEffect(() => {
    if (vulnSearchInput === '' && focused === true) {
      onClear()
    }
  }, [vulnSearchInput, focused])

  return (
    <>
      <Box pos={'relative'} width={'300px'}>
        <Input
          id='search'
          type='text'
          placeholder='Search'
          aria-label='Search Input'
          ref={searchInputRef}
          value={vulnSearchInput}
          autoComplete='search'
          onChange={(e) => setVulnSearchInput(e.target.value)}
          onKeyDown={onFilter}
          onFocus={onFocus}
          onBlur={onBlur}
        />
        {vulnSearchInput !== '' && (
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
