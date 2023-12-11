import React, { useContext, useEffect, useRef, useState } from 'react'
import {
  Box,
  Input,
  VStack,
  InputGroup,
  InputRightElement,
  FormControl,
  FormLabel,
  ListItem,
  List
} from '@chakra-ui/react'
import { CheckIcon, WarningTwoIcon } from '@chakra-ui/icons'
import GlobalContext from 'context/GlobalContext'
import { PackageURL } from 'packageurl-js'

const regexPattern =
  /cpe:2\.3:[aho\*\-](:(((\?*|\*?)([a-zA-Z0-9\-\._]|(\\[\\\*\?!"#$$%&'\(\)\+,\/:;<=>@\[\]\^`\{\|}~]))+(\?*|\*?))|[\*\-])){5}(:(([a-zA-Z]{2,3}(-([a-zA-Z]{2}|[0-9]{3}))?)|[\*\-]))(:(((\?*|\*?)([a-zA-Z0-9\-\._]|(\\[\\\*\?!"#$$%&'\(\)\+,\/:;<=>@\[\]\^`\{\|}~]))+(\?*|\*?))|[\*\-])){4}/

const CpeInput = ({
  name,
  inputValue,
  setInputValue,
  cpeList,
  setCpeList,
  inputRef,
  validation,
  onChange
}) => {
  const [isValid, setIsValid] = useState(true)
  const [focusedIndex, setFocusedIndex] = useState(null)
  const listItemsRef = useRef([])

  const { cpeString, setCpeString, purlString, setPurlString } =
    useContext(GlobalContext)

  const updateString = (name, value) => {
    const cpeParts = cpeString.split(':')
    if (name === 'vendor') {
      cpeParts[3] = value
      const cpe = cpeParts.join(':')
      setCpeString(cpe)
    } else if (name === 'product') {
      cpeParts[4] = value
      const cpe = cpeParts.join(':')
      setCpeString(cpe)
    } else if (name === 'version') {
      cpeParts[5] = value
      const cpe = cpeParts.join(':')
      setCpeString(cpe)
    } else if (name === 'namespace') {
      const pkg = PackageURL.fromString(purlString)
      pkg.namespace = value
      setPurlString(pkg.toString())
    } else if (name === 'packageName') {
      const pkg = PackageURL.fromString(purlString)
      if (value === '') {
        pkg.name = 'name'
        setPurlString(pkg.toString())
      } else {
        pkg.name = value
        setPurlString(pkg.toString())
      }
    } else if (name === 'packageVersion') {
      const pkg = PackageURL.fromString(purlString)
      pkg.version = value
      setPurlString(pkg.toString())
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
      const matches = regexPattern.test(inputValue)
      if (matches) {
        setIsValid(true)
      } else {
        setIsValid(false)
      }
    }
  }, [inputValue])

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
  }, [])

  return (
    <VStack
      width={'100%'}
      spacing={4}
      align='stretch'
      pos={'relative'}
      ref={inputRef}
    >
      <FormControl>
        {name !== 'cpe' && (
          <FormLabel textTransform={'capitalize'}>
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
                isValid ? (
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
          bg={'white'}
          zIndex={111}
          top={name === 'cpe' ? 8 : 14}
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
                _hover={{ bg: focusedIndex === null ? '#E2E8F0' : 'transparent' }}
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
