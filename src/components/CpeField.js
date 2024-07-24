import React, { useEffect, useRef, useState } from 'react'
import { validateCpe } from 'utils'

import { CheckIcon, WarningTwoIcon } from '@chakra-ui/icons'
import {
  Box,
  FormControl,
  Input,
  InputGroup,
  InputRightElement,
  List,
  ListItem,
  VStack
} from '@chakra-ui/react'

import { useGlobalState } from 'hooks/useGlobalState'

const CpeField = ({
  inputValue,
  setInputValue,
  cpeList,
  setCpeList,
  inputRef,
  onChange
}) => {
  const signedUrlParams = sessionStorage.getItem('signedUrlParams')
  const { prodCompState, dispatch } = useGlobalState()
  const { isCpeValid } = prodCompState
  const { prodCompDispatch } = dispatch

  const [focusedIndex, setFocusedIndex] = useState(null)
  const listItemsRef = useRef([])

  const handleValidate = (value) => {
    const matches = validateCpe(value)
    if (matches && value !== '') {
      prodCompDispatch({ type: 'SET_CPE_VALIDATION', payload: true })
    } else {
      prodCompDispatch({ type: 'SET_CPE_VALIDATION', payload: false })
    }
  }

  const handleSelect = (value) => {
    handleValidate(value)
    setInputValue(value)
    setFocusedIndex(null)
    setCpeList([])
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === 'Tab') {
      setInputValue(inputValue)
      setCpeList([])
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setFocusedIndex((prevIndex) => {
        const newIndex =
          prevIndex === null
            ? 0
            : Math.min(prevIndex + 1, listItemsRef.current.length - 1)
        cpeList.length > 0 &&
          listItemsRef.current[newIndex].scrollIntoView({
            behavior: 'smooth',
            block: 'nearest'
          })
        return newIndex
      })
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setFocusedIndex((prevIndex) => {
        const newIndex = prevIndex === null ? 0 : Math.max(prevIndex - 1, 0)
        cpeList.length > 0 &&
          listItemsRef.current[newIndex].scrollIntoView({
            behavior: 'smooth',
            block: 'nearest'
          })
        return newIndex
      })
    } else if (e.key === 'Enter' && focusedIndex !== null) {
      const value = cpeList.length > 0 && cpeList[focusedIndex]
      return handleSelect(value)
    }
  }

  const handleBlur = (e) => {
    e.preventDefault()
    inputValue !== '' && handleValidate(inputValue)
  }

  useEffect(() => {
    listItemsRef.current[0]?.focus()
  }, [])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (inputRef.current && !inputRef.current.contains(event.target)) {
        setCpeList([])
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [inputRef, setCpeList])

  return (
    <VStack
      width={'100%'}
      spacing={4}
      align='stretch'
      pos={'relative'}
      ref={inputRef}
    >
      <FormControl isInvalid={inputValue !== '' && !isCpeValid}>
        <InputGroup>
          <Input
            id={'cpe'}
            name={'cpe'}
            size='md'
            fontSize={'sm'}
            placeholder={'CPE'}
            readOnly={signedUrlParams}
            value={inputValue}
            onChange={onChange}
            autoComplete='off'
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
          />
          {inputValue !== '' && (
            <InputRightElement align='center' zIndex={-1}>
              {isCpeValid === true ? (
                <CheckIcon color='green' />
              ) : (
                <WarningTwoIcon color='red' />
              )}
            </InputRightElement>
          )}
        </InputGroup>
      </FormControl>
      {inputValue !== '' && cpeList?.length > 0 && (
        <Box
          pos={'absolute'}
          width={'100%'}
          left={0}
          right={0}
          bg={'white'}
          zIndex={111}
          top={8}
          borderRadius={'md'}
          border={'1px solid #CBD5E0'}
          maxH={'260px'}
          overflowY={'scroll'}
        >
          <List>
            {cpeList.map((item, index) => (
              <ListItem
                key={index}
                ref={(el) => (listItemsRef.current[index] = el)}
                tabIndex='0'
                bg={index === focusedIndex ? '#E2E8F0' : 'transparent'}
                _hover={{
                  bg: focusedIndex === null ? '#E2E8F0' : 'transparent'
                }}
                onMouseEnter={() => setFocusedIndex(null)}
                outline='none'
                p={2}
                fontSize={'sm'}
                width={'100%'}
                cursor={'pointer'}
                onClick={() => handleSelect(item)}
                py={1}
                px={4}
              >
                {item}
              </ListItem>
            ))}
          </List>
        </Box>
      )}
    </VStack>
  )
}

export default CpeField
