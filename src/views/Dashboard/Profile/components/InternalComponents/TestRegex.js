import { useState } from 'react'
import { v4 as uuidv4 } from 'uuid'

import {
  Box,
  Button,
  FormLabel,
  Icon,
  IconButton,
  Input,
  InputGroup,
  InputRightElement,
  Tooltip
} from '@chakra-ui/react'

import LynkAlert from 'components/LynkAlert'

import useCustomToast from 'hooks/useCustomToast'
import { useThemeColor } from 'hooks/useThemeColors'

import { FaCircleCheck, FaPlus } from 'react-icons/fa6'
import { IoIosCloseCircle } from 'react-icons/io'
import { MdDeleteOutline } from 'react-icons/md'

export const TextRegex = ({ regex, ignoreCase }) => {
  const [items, setItems] = useState([{ id: uuidv4(), value: '' }])
  const [error, setError] = useState('')
  const { grayBorderColor, primaryErrorColor } = useThemeColor([
    'grayBorderColor',
    'primaryErrorColor'
  ])

  const hasSimilarRow = (data) => {
    const emptyValues = data.filter((item) => item.value === '')
    return emptyValues.length >= 2
  }

  const addMoreTest = () => {
    if (hasSimilarRow(items)) {
      setError(
        `A row with empty values already exists. Please update or remove it before continuing.`
      )
    } else {
      setItems([...items, { id: uuidv4(), value: '' }])
    }
  }

  const handleDelete = (id) => {
    setError('')
    setItems(items.filter((item) => item.id !== id))
  }

  const showToast = useCustomToast()

  const checkIsMatch = ({ ignoreCase, regex, item }) => {
    let isMatch = false
    let test = ignoreCase ? item.value.toLowerCase() : item.value
    let re = ignoreCase ? regex.toLowerCase() : regex
    try {
      isMatch = new RegExp(re).test(test)
    } catch (error) {
      showToast({
        description: `Something went wrong, please try again.`,
        status: 'error'
      })
      console.log(error.message)
    }
    return { isMatch }
  }

  return (
    <div>
      <FormLabel>Test Expressions</FormLabel>
      {items.map((item) => {
        const { isMatch } = checkIsMatch({ regex, ignoreCase, item })
        const color = isMatch ? 'green' : 'red'
        return (
          <Box display='flex' key={item.id} m={1} alignItems='center' gap={2}>
            <InputGroup>
              <Input
                placeholder='Enter a string to check if it will match the expression.'
                my={1}
                fontSize={12}
                onChange={(e) => {
                  setError('')
                  const newItems = items.map((oldItem) =>
                    oldItem.id === item.id
                      ? {
                          id: item.id,
                          value: e.target.value
                        }
                      : oldItem
                  )
                  setItems(newItems)
                }}
                value={item.value}
              />
              <InputRightElement width='3rem'>
                <Tooltip
                  label={
                    isMatch
                      ? 'Matches regular expression'
                      : `Doesn't match regular expression`
                  }
                >
                  <Box marginTop={2}>
                    {isMatch ? (
                      <FaCircleCheck size={18} color={color} />
                    ) : (
                      <IoIosCloseCircle size={22} color={color} />
                    )}
                  </Box>
                </Tooltip>
              </InputRightElement>
            </InputGroup>
            <IconButton
              border='1px solid'
              colorScheme='white'
              borderColor={grayBorderColor}
              aria-label='Remove'
              hidden={items.length === 1}
              onClick={() => handleDelete(item.id)}
              icon={
                <Icon
                  color={primaryErrorColor}
                  w={6}
                  h={6}
                  as={MdDeleteOutline}
                />
              }
            />
          </Box>
        )
      })}

      <Button
        onClick={addMoreTest}
        aria-label='Add config'
        colorScheme='blue'
        leftIcon={<FaPlus />}
        marginTop='10px'
        fontWeight={'medium'}
        fontSize={'sm'}
        variant='link'
        paddingLeft={'2px'}
        title='Add more test'
      >
        Add more test
      </Button>
      {error !== '' && <LynkAlert msg={error} />}
    </div>
  )
}
