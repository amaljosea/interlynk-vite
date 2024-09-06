import { TabContext } from 'context/TabContext'
import React, { useContext, useEffect, useRef, useState } from 'react'
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
  VStack,
  useColorModeValue
} from '@chakra-ui/react'

const CpeField = ({ cpeList, setCpeList, inputRef, onChange }) => {
  const { tabData, setTabData, handleChange } = useContext(TabContext)
  const { identifiers } = tabData || ''

  const signedUrlParams = sessionStorage.getItem('signedUrlParams')

  const [focusedIndex, setFocusedIndex] = useState(null)
  const listItemsRef = useRef([])

  const bgColor = useColorModeValue('#F7FAFC', '#1A202C')
  const hoverColor = useColorModeValue('#EDF2F7', '#2D3748')

  const handleValidate = (value) => {
    const matches = validateCpe(value)
    if (matches && value !== '') {
      setTabData((prev) => ({
        ...prev,
        identifiers: { ...prev?.identifiers, isValidCpe: true }
      }))
    } else {
      setTabData((prev) => ({
        ...prev,
        identifiers: { ...prev?.identifiers, isValidCpe: false }
      }))
    }
  }

  const handleSelect = (value) => {
    handleValidate(value)
    handleChange('identifiers', 'cpe', value)
    setFocusedIndex(null)
    setCpeList([])
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === 'Tab') {
      handleChange('identifiers', 'cpe', identifiers?.cpe)
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
    identifiers?.cpe !== '' && handleValidate(identifiers?.cpe)
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
      <FormControl
        isInvalid={identifiers?.cpe !== '' && !identifiers?.isValidCpe}
      >
        <InputGroup>
          <Input
            id={'cpe'}
            name={'cpe'}
            size='md'
            fontSize={'sm'}
            placeholder={'CPE'}
            readOnly={signedUrlParams}
            value={identifiers?.cpe}
            onChange={onChange}
            autoComplete='off'
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
          />
          {identifiers?.cpe !== '' && (
            <InputRightElement align='center' zIndex={-1}>
              {identifiers?.isValidCpe === true ? (
                <CheckIcon color='green' />
              ) : (
                <WarningTwoIcon color='red' />
              )}
            </InputRightElement>
          )}
        </InputGroup>
      </FormControl>
      {identifiers?.cpe !== '' && cpeList?.length > 0 && (
        <Box
          pos={'absolute'}
          width={'100%'}
          left={0}
          right={0}
          bg={bgColor}
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
                bg={index === focusedIndex ? hoverColor : 'transparent'}
                _hover={{
                  bg: focusedIndex === null ? hoverColor : 'transparent'
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
