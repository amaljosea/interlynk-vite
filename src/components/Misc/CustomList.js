import React from 'react'

import { MenuItemOption, MenuList, MenuOptionGroup } from '@chakra-ui/react'

const CustomList = ({ type, options, value, onChange }) => {
  const filterOptions = ['all', ...options]
  return (
    <MenuList minH='auto' maxH={'350px'} overflowY={'scroll'}>
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
          >
            {item}
          </MenuItemOption>
        ))}
      </MenuOptionGroup>
    </MenuList>
  )
}

export default CustomList
