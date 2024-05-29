import { useState } from 'react'
import { v4 as uuidv4 } from 'uuid'

import { DeleteIcon } from '@chakra-ui/icons'
import { Box, Button, IconButton, Input, Text } from '@chakra-ui/react'

import { FaCircleCheck } from 'react-icons/fa6'
import { IoIosCloseCircle } from 'react-icons/io'

export const TextRegex = ({ regex }) => {
  const [items, setItems] = useState([{ id: uuidv4(), value: '' }])

  return (
    <div>
      <Text fontWeight='bold'>Testing:</Text>
      {items.map((item) => {
        const isMatch = new RegExp(regex).test(item.value)
        const color = isMatch ? 'green' : 'red'
        return (
          <Box display='flex' key={item.id} m={1}>
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
            <Input
              m={1}
              borderColor={color}
              borderWidth='medium'
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
            <IconButton
              mt={2}
              icon={<DeleteIcon />}
              colorScheme='red'
              size='sm'
              disabled={items.length === 1}
              onClick={() => {
                const newItems = items.filter(
                  (oldItem) => oldItem.id !== item.id
                )
                setItems(newItems)
              }}
            >
              Delete
            </IconButton>
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
