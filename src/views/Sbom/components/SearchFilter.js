/* eslint-disable no-unused-vars */
import { motion } from 'framer-motion'
import { useCallback, useEffect, useRef, useState } from 'react'

import {
  Box,
  Flex,
  IconButton,
  Input,
  InputGroup,
  InputRightElement
} from '@chakra-ui/react'

import { LuSearch, LuX } from 'react-icons/lu'

const MotionBox = motion(Box)

const SearchFilter = ({ id, filterText, onChange, onFilter, onClear }) => {
  const searchInputRef = useRef()
  const focusSearchInput = () => {
    if (searchInputRef?.current) {
      searchInputRef?.current.focus()
    }
  }

  const [isOpen, setIsOpen] = useState(false)

  const handleKeyPress = useCallback((e) => {
    if (e.ctrlKey && e.key === '/') {
      setIsOpen(true)
      focusSearchInput()
    }
  }, [])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress)
    return () => {
      window.removeEventListener('keydown', handleKeyPress)
    }
  }, [handleKeyPress])

  useEffect(() => {
    if (isOpen && searchInputRef?.current) {
      searchInputRef.current.focus()
    }
  }, [isOpen])

  return (
    <Flex align='center'>
      <MotionBox
        initial={{ width: 0, opacity: 0 }}
        animate={
          isOpen ? { width: '220px', opacity: 1 } : { width: 0, opacity: 0 }
        }
        transition={{ duration: 0.3 }}
        overflow='hidden'
      >
        <InputGroup>
          <Input
            id={id}
            name={id}
            type='text'
            fontSize='sm'
            placeholder='Search'
            ref={searchInputRef}
            value={filterText}
            onChange={onChange}
            onKeyDown={onFilter}
          />
          <InputRightElement>
            <LuX
              fontSize={18}
              cursor={'pointer'}
              onClick={() => setIsOpen((prev) => !prev)}
            />
          </InputRightElement>
        </InputGroup>
      </MotionBox>
      <IconButton
        hidden={isOpen}
        icon={<LuSearch />}
        variant={'outline'}
        onClick={() => setIsOpen((prev) => !prev)}
        colorScheme={filterText !== '' ? 'blue' : 'gray'}
        aria-label={isOpen ? 'Close search' : 'Open search'}
      />
    </Flex>
  )
}

export default SearchFilter
