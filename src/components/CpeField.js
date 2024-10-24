import { TabContext } from 'context/TabContext'
import React, { useContext, useEffect, useRef, useState } from 'react'
import { getSignedUrlParams, validateCpe } from 'utils'

import { Box, Input, List, ListItem, VStack } from '@chakra-ui/react'
import { FormControl, FormErrorMessage } from '@chakra-ui/react'

import { useThemeColor } from 'hooks/useThemeColors'

const CpeField = ({ cpeList, setCpeList, inputRef, onChange }) => {
  const { tabData, handleChange } = useContext(TabContext)
  const { identifiers } = tabData || ''

  const signedUrlParams = getSignedUrlParams()

  const [focusedIndex, setFocusedIndex] = useState(null)
  const listItemsRef = useRef([])
  const { primaryBgColor, secondaryBgColor } = useThemeColor([
    'primaryBgColor',
    'secondaryBgColor'
  ])

  const handleValidate = (value) => {
    const matches = validateCpe(value)
    if (matches) {
      handleChange('identifiers', 'cpeError', '')
    } else {
      handleChange('identifiers', 'cpeError', 'Invalid CPE')
    }
  }

  const onBlur = (e) => handleValidate(e.target.value)

  const handleSelect = (value) => {
    handleChange('identifiers', 'cpe', value)
    value !== '' && handleValidate(value)
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
      spacing={4}
      align='stretch'
      ref={inputRef}
      sx={{ w: '100%', pos: 'relative' }}
    >
      <FormControl
        isInvalid={identifiers?.cpe !== '' && identifiers?.cpeError !== ''}
      >
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
          onBlur={onBlur}
          onKeyDown={handleKeyDown}
        />
        <FormErrorMessage>{identifiers?.cpeError}</FormErrorMessage>
      </FormControl>
      {identifiers?.cpe !== '' && cpeList?.length > 0 && (
        <Box
          zIndex={111}
          pos={'absolute'}
          bg={primaryBgColor}
          borderRadius={'md'}
          overflowY={'scroll'}
          border={'1px solid #CBD5E0'}
          sx={{ w: '100%', maxH: '260px', left: 0, right: 0, top: 8 }}
        >
          <List>
            {cpeList.map((item, index) => (
              <ListItem
                py={1}
                px={4}
                p={2}
                key={index}
                ref={(el) => (listItemsRef.current[index] = el)}
                tabIndex='0'
                bg={index === focusedIndex ? secondaryBgColor : 'transparent'}
                _hover={{
                  bg: focusedIndex === null ? secondaryBgColor : 'transparent'
                }}
                onMouseEnter={() => setFocusedIndex(null)}
                outline='none'
                data-testid='cpe_list'
                onClick={() => handleSelect(item)}
                sx={{ w: '100%', fontSize: 'sm', cursor: 'pointer' }}
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
