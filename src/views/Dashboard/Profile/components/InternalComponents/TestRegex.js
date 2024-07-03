import { useState } from 'react'
import { v4 as uuidv4 } from 'uuid'

import { Box, Button, Text, Textarea, Tooltip } from '@chakra-ui/react'

import { FaCircleCheck } from 'react-icons/fa6'
import { IoIosCloseCircle } from 'react-icons/io'

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

  return (
    <div>
      <Text fontWeight='bold'>Test Regular Expression</Text>
      {items.map((item) => {
        const { isMatch } = checkIsMatch({ regex, ignoreCase, item })
        const color = isMatch ? 'green' : 'red'
        return (
          <Box display='flex' key={item.id} m={1}>
            <Textarea
              placeholder='Enter a string to check if it will match the expression.'
              my={1}
              borderColor={color}
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
            <Tooltip
              label={
                isMatch
                  ? 'Matches regular expression'
                  : `Doesn't matches regular expression`
              }
            >
              <Box
                display='flex'
                w={10}
                justifyContent='center'
                alignItems='center'
              >
                {isMatch ? (
                  <FaCircleCheck size={25} color={color} />
                ) : (
                  <IoIosCloseCircle size={30} color={color} />
                )}
              </Box>
            </Tooltip>
          </Box>
        )
      })}

      <Button
        onClick={() => {
          setItems([...items, { id: uuidv4(), value: '' }])
        }}
      >
        Add more test
      </Button>
    </div>
  )
}
