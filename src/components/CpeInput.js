import { TabContext } from 'context/TabContext'
import { PackageURL } from 'packageurl-js'
import React, { useContext, useEffect, useRef, useState } from 'react'
import { validateCpe } from 'utils'

import {
  Box,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  List,
  ListItem,
  VStack
} from '@chakra-ui/react'

import { useThemeColor } from 'hooks/useThemeColors'

const CpeInput = ({
  name,
  string,
  isDisabled,
  inputValue,
  setInputValue,
  cpeList,
  setCpeList,
  inputRef,
  validation,
  onChange,
  setString
}) => {
  const { tabData, setTabData } = useContext(TabContext)
  const { identifiers } = tabData
  const [focusedIndex, setFocusedIndex] = useState(null)
  const listItemsRef = useRef([])

  const { primaryBgColor, secondaryBgColor } = useThemeColor([
    'primaryBgColor',
    'secondaryBgColor'
  ])

  const updatePurl = (field, value) => {
    try {
      const pkg = PackageURL.fromString(string)
      pkg[field] = value
      setString(pkg.toString())
    } catch (error) {
      console.log('Something went wrong', error)
    }
  }

  const updateCpe = (index, value) => {
    const cpeParts = string?.split(':')
    console.log('cpe', cpeParts)
    cpeParts[index] = value
    const cpe = cpeParts.join(':')
    setString(cpe)
  }

  const nameMapping = {
    packageName: 'Package Name',
    packageVersion: 'Version',
    cpeVersion: 'Version'
  }

  const label = nameMapping[name] || name

  const updateString = (name, value) => {
    if (name === 'vendor') {
      updateCpe(3, value)
    } else if (name === 'product') {
      updateCpe(4, value)
    } else if (name === 'cpeVersion') {
      updateCpe(5, value)
    } else if (name === 'namespace') {
      updatePurl('namespace', value === '' ? 'namespace' : value)
    } else if (name === 'name') {
      updatePurl('name', value === '' ? 'name' : value)
    } else if (name === 'version') {
      updatePurl('version', value === '' ? 'version' : value)
    }
  }

  const handleSelect = () => {
    const value = cpeList.length > 0 && cpeList[focusedIndex]
    updateString(name, String(value))
    setInputValue((prev) => ({ ...prev, [name]: value }))
    setFocusedIndex(null)
    setCpeList([])
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === 'Tab') {
      setInputValue((prev) => ({ ...prev, [name]: inputValue }))
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
      const matches = validateCpe(string)
      if (matches) {
        setTabData((prev) => ({
          ...prev,
          identifiers: { ...prev?.identifiers, cpeError: '' }
        }))
      } else {
        setTabData((prev) => ({
          ...prev,
          identifiers: { ...prev?.identifiers, cpeError: 'Invalid CPE' }
        }))
      }
    }
  }, [string, setTabData, validation])

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
          name === 'cpe' && inputValue !== '' && identifiers?.cpeError !== ''
        }
      >
        {name !== 'cpe' && (
          <FormLabel textTransform={'capitalize'}>{label}</FormLabel>
        )}
        <Input
          id={name}
          name={name}
          size='md'
          fontSize={'sm'}
          placeholder={name === 'cpe' ? 'CPE' : `Enter ${name}`}
          value={inputValue}
          onChange={onChange}
          autoComplete='off'
          data-testid={name}
          onBlur={() => updateString(name, inputValue)}
          onKeyDown={handleKeyDown}
        />
        <FormErrorMessage>{identifiers?.cpeError}</FormErrorMessage>
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
          bg={primaryBgColor}
          border={`1px solid ${secondaryBgColor}`}
        >
          <List>
            {cpeList.map((item, index) => (
              <ListItem
                key={index}
                ref={(el) => (listItemsRef.current[index] = el)}
                tabIndex='0'
                bg={index === focusedIndex ? secondaryBgColor : 'transparent'}
                _hover={{ background: secondaryBgColor }}
                onMouseEnter={() => setFocusedIndex(null)}
                outline='none'
                p={2}
                fontSize={'sm'}
                width={'100%'}
                cursor={'pointer'}
                onClick={() => {
                  setInputValue((prev) => ({ ...prev, [name]: item }))
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
