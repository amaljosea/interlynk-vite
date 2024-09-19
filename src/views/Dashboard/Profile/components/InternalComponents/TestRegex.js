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
  Tooltip,
  useColorModeValue
} from '@chakra-ui/react'

import { FaCircleCheck, FaPlus } from 'react-icons/fa6'
import { IoIosCloseCircle } from 'react-icons/io'
import { MdDeleteOutline } from 'react-icons/md'

const checkIsMatch = ({ ignoreCase, regex, item }) => {
  let isMatch = false
  try {
    isMatch = new RegExp(regex).test(
      ignoreCase ? item.value.toLowerCase() : item.value
    )
  } catch (error) {
    console.log(error.message)
  }
  return { isMatch }
}

export const TextRegex = ({ regex, ignoreCase }) => {
  const [items, setItems] = useState([{ id: uuidv4(), value: '' }])
  const borderColor = useColorModeValue('gray.200', 'gray.600')

  const handleDelete = (id) => {
    setItems(items.filter((item) => item.id !== id))
  }

  return (
    <div>
      <FormLabel fontSize={12}>Test Regular Expression</FormLabel>
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
              borderColor={borderColor}
              aria-label='Remove'
              hidden={items.length === 1}
              onClick={() => handleDelete(item.id)}
              icon={<Icon color={'#E53E3E'} w={6} h={6} as={MdDeleteOutline} />}
            />
          </Box>
        )
      })}

      <Button
        onClick={() => {
          setItems([...items, { id: uuidv4(), value: '' }])
        }}
        aria-label='Add config'
        colorScheme='blue'
        leftIcon={<FaPlus />}
        marginTop='10px'
        fontWeight={'medium'}
        fontSize={'sm'}
        variant='link'
        paddingLeft={'2px'}
      >
        Add more test
      </Button>
    </div>
  )
}
