import { TabContext } from 'context/TabContext'
import { PackageURL } from 'packageurl-js'
import React, { useContext, useEffect, useRef, useState } from 'react'
import { validateCpe } from 'utils'

import { CheckIcon, WarningTwoIcon } from '@chakra-ui/icons'
import {
  Box,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  List,
  ListItem,
  VStack,
  useColorModeValue
} from '@chakra-ui/react'

const CpeInput = ({
  name,
  isDisabled,
  inputValue,
  setInputValue,
  cpeList,
  setCpeList,
  inputRef,
  validation,
  onChange
}) => {
  const { tabData, setTabData, handleChange } = useContext(TabContext)
  const { identifiers } = tabData
  const [focusedIndex, setFocusedIndex] = useState(null)
  const listItemsRef = useRef([])

  const bgColor = useColorModeValue('#F7FAFC', '#1A202C')
  const hoverColor = useColorModeValue('#EDF2F7', '#2D3748')

  const updateString = (name, value) => {
    const cpeParts = identifiers?.cpe?.split(':')
    if (value !== '') {
      if (name === 'vendor') {
        cpeParts[3] = value
        const cpe = cpeParts.join(':')
        handleChange('identifiers', 'cpe', cpe)
      } else if (name === 'product') {
        cpeParts[4] = value
        cpeParts[5] = '*'
        const cpe = cpeParts.join(':')
        handleChange('identifiers', 'cpe', cpe)
      } else if (name === 'version') {
        cpeParts[5] = value === '' ? '*' : value
        const cpe = cpeParts.join(':')
        handleChange('identifiers', 'cpe', cpe)
      } else if (name === 'namespace') {
        const pkg = PackageURL.fromString(identifiers?.purl)
        pkg.namespace = value
        handleChange('identifiers', 'purl', pkg.toString())
      } else if (name === 'packageName') {
        const pkg = PackageURL.fromString(identifiers?.purl)
        pkg.name = value
        handleChange('identifiers', 'purl', pkg.toString())
      } else if (name === 'packageVersion') {
        const pkg = PackageURL.fromString(identifiers?.purl)
        pkg.version = value
        handleChange('identifiers', 'purl', pkg.toString())
      }
    }
  }

  const handleSelect = () => {
    const value = cpeList.length > 0 && cpeList[focusedIndex]
    console.log('value', value)
    updateString(name, String(value))
    setInputValue(value)
    setFocusedIndex(null)
    setCpeList([])
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === 'Tab') {
      setInputValue(inputValue)
      setCpeList([])
      if (inputValue === '') {
        updateString(name, inputValue)
      }
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
      return handleSelect()
    }
  }

  // Set initial focus when component mounts
  useEffect(() => {
    listItemsRef.current[0]?.focus()
  }, [])

  useEffect(() => {
    if (validation) {
      const matches = validateCpe(inputValue)
      console.log('matches', matches)
      if (matches) {
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
  }, [inputValue, setTabData, validation])

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
        isDisabled={isDisabled}
        isInvalid={
          name === 'cpe' && inputValue !== '' && !identifiers?.isValidCpe
        }
      >
        {name !== 'cpe' && (
          <FormLabel fontSize={12} textTransform={'capitalize'}>
            {name === 'packageName'
              ? 'Package Name'
              : name === 'packageVersion'
                ? 'Version'
                : name}
          </FormLabel>
        )}
        <InputGroup>
          <Input
            id={name}
            name={name}
            size='md'
            fontSize={'sm'}
            placeholder={name === 'cpe' ? 'CPE' : `Enter ${name}`}
            value={inputValue}
            onChange={onChange}
            autoComplete='off'
            onBlur={() => updateString(name, inputValue)}
            onKeyDown={handleKeyDown}
          />
          {validation === true && (
            <InputRightElement align='center' zIndex={-1}>
              {inputValue != null && inputValue !== '' ? (
                identifiers?.isValidCpe ? (
                  <CheckIcon color='green' />
                ) : (
                  <WarningTwoIcon color='red' />
                )
              ) : null}
            </InputRightElement>
          )}
        </InputGroup>
      </FormControl>
      {inputValue !== '' && cpeList && cpeList.length > 0 && (
        <Box
          pos={'absolute'}
          width={'100%'}
          left={0}
          right={0}
          zIndex={111}
          top={name === 'cpe' ? 8 : 14}
          borderRadius={'md'}
          maxH={'260px'}
          overflowY={'scroll'}
          bg={bgColor}
          border={`1px solid ${hoverColor}`}
        >
          <List>
            {cpeList.map((item, index) => (
              <ListItem
                key={index}
                ref={(el) => (listItemsRef.current[index] = el)}
                tabIndex='0'
                bg={index === focusedIndex ? hoverColor : 'transparent'}
                _hover={{ background: hoverColor }}
                onMouseEnter={() => setFocusedIndex(null)}
                outline='none'
                p={2}
                fontSize={'sm'}
                width={'100%'}
                cursor={'pointer'}
                onClick={() => {
                  setInputValue(item)
                  updateString(name, item)
                  setFocusedIndex(null)
                  setCpeList([])
                }}
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

export default CpeInput
