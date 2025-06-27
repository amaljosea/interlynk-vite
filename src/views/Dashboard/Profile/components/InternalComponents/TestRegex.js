import { useState } from 'react'
import { v4 as uuidv4 } from 'uuid'

import {
  Box,
  Button,
  Flex,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  Spacer,
  Tooltip
} from '@chakra-ui/react'

import DeleteButton from 'components/Icons/DeleteButton'
import LynkAlert from 'components/LynkAlert'

import useCustomToast from 'hooks/useCustomToast'

import { LuCheck, LuCirclePlus, LuX } from 'react-icons/lu'

export const TextRegex = ({ regex, ignoreCase }) => {
  const [items, setItems] = useState([{ id: uuidv4(), value: '' }])
  const [error, setError] = useState('')

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
      console.warn(error.message)
    }
    return { isMatch }
  }

  const handleChange = (e, item) => {
    setError('')
    const newItems = items.map((oldItem) =>
      oldItem.id === item.id ? { id: item.id, value: e.target.value } : oldItem
    )
    setItems(newItems)
  }

  return (
    <div>
      <FormLabel>Test Expressions</FormLabel>
      {items.map((item) => {
        const { isMatch } = checkIsMatch({ regex, ignoreCase, item })
        const expressionInfo = isMatch
          ? 'Matches regular expression'
          : `Doesn't match regular expression`
        return (
          <Flex gap={2} key={item.id} my={2}>
            <InputGroup>
              <Input
                placeholder='Enter a string to check if it will match the expression.'
                onChange={(e) => handleChange(e, item)}
                value={item.value}
              />
              <InputRightElement hidden={item.value === ''}>
                <Tooltip label={expressionInfo}>
                  <Box>
                    {isMatch ? <LuCheck size={18} /> : <LuX size={18} />}
                  </Box>
                </Tooltip>
              </InputRightElement>
            </InputGroup>
            <DeleteButton
              aria-label='Remove'
              hidden={items.length === 1}
              onClick={() => handleDelete(item.id)}
            />
          </Flex>
        )
      })}

      <Button
        onClick={addMoreTest}
        aria-label='Add config'
        colorScheme='blue'
        leftIcon={<LuCirclePlus size={18} />}
        marginTop='10px'
        fontWeight={'medium'}
        fontSize={'sm'}
        variant='link'
        paddingLeft={'2px'}
        title='Add more test'
      >
        Add more test
      </Button>
      <Spacer my={2} />
      {error !== '' && <LynkAlert msg={error} />}
    </div>
  )
}
