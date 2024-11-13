import React from 'react'
import { FixedSizeList as List } from 'react-window'
import { truncatedValue } from 'utils'

import { CheckIcon } from '@chakra-ui/icons'
import {
  Box,
  Flex,
  MenuItem,
  MenuList,
  Skeleton,
  Stack,
  Text
} from '@chakra-ui/react'

const LynkMenuList = ({ type, options, value, loading, onFilter }) => {
  const itemCount = options?.length
  const listHeight = Math.min(itemCount * 35, 320)

  return (
    <MenuList py={2} minH='auto' overflow={'hidden'} fontSize={'sm'}>
      {loading ? (
        <Stack spacing={2} px={2}>
          {[1, 2, 3, 4, 5].map((item) => (
            <Skeleton key={item} width={'full'} height={4} />
          ))}
        </Stack>
      ) : (
        <List
          itemSize={35}
          width={300}
          height={listHeight}
          itemCount={itemCount}
        >
          {({ index, style }) => {
            const option = options[index]
            const isSelected = value?.includes(option)
            return (
              <MenuItem
                key={option}
                style={style}
                onClick={() => onFilter(type, option)}
              >
                <Flex gap={2}>
                  <Box width={4}>
                    {isSelected && <CheckIcon fontSize={11} />}
                  </Box>
                  <Text fontSize={'sm'}>{truncatedValue(option, 24)}</Text>
                </Flex>
              </MenuItem>
            )
          }}
        </List>
      )}
    </MenuList>
  )
}

export default LynkMenuList
