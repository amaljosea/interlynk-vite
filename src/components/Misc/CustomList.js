import React from 'react'

import {
  MenuItemOption,
  MenuList,
  MenuOptionGroup,
  Skeleton,
  Stack
} from '@chakra-ui/react'

const CustomList = ({ type, options, value, onChange, loading }) => {
  const filterOptions = ['all', ...options]
  return (
    <MenuList minH='auto' maxH={'350px'} overflowY={'scroll'} fontSize={'sm'}>
      {loading ? (
        <Stack spacing={2} pl={2.5} pr={1}>
          {[1, 2, 3, 4, 5].map((item) => (
            <Skeleton key={item} width={'full'} height={4} />
          ))}
        </Stack>
      ) : (
        <MenuOptionGroup
          type={type || 'checkbox'}
          value={value}
          onChange={onChange}
        >
          {filterOptions?.map((item, index) => (
            <MenuItemOption
              key={index}
              value={item}
              maxW={'300px'}
              fontSize={'sm'}
              wordBreak={'break-all'}
              textTransform={'capitalize'}
              name={item}
            >
              {item?.replace(/_/g, ' ')}
            </MenuItemOption>
          ))}
        </MenuOptionGroup>
      )}
    </MenuList>
  )
}

export default CustomList
