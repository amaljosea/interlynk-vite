import React, { useContext, useEffect, useState } from 'react'
import {
  Box,
  Input,
  VStack,
  Text,
  InputGroup,
  InputRightElement,
  FormControl,
  FormLabel
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
  onChange,
  onBlur
}) => {
  const [isValid, setIsValid] = useState(true)

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
      pkg.name = value
      setPurlString(pkg.toString())
    } else if (name === 'packageVersion') {
      const pkg = PackageURL.fromString(purlString)
      pkg.version = value
      setPurlString(pkg.toString())
    }
  }

  const handleSelect = (value) => {
    value !== '' && updateString(name, value)
    setInputValue(value)
    setCpeList([])
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === 'Tab') {
      inputValue !== '' && updateString(name, inputValue)
      setCpeList([])
    }
  }

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
            placeholder={name === 'cpe' ? 'CPE' : ''}
            value={inputValue}
            onChange={onChange}
            autoComplete='off'
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
      {cpeList !== null && cpeList.length > 0 && (
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
          <VStack spacing={0} py={1} alignItems={'flex-start'}>
            {cpeList?.map((item, index) => (
              <Text
                key={index}
                fontSize={'sm'}
                _hover={{ bg: '#f1f1f1' }}
                width={'100%'}
                cursor={'pointer'}
                onClick={() => handleSelect(item)}
                py={1}
                px={4}
                borderBottom={'1px solid #E2E8F0'}
              >
                {item}
              </Text>
            ))}
          </VStack>
        </Box>
      )}
    </VStack>
  )
}

export default CpeInput
