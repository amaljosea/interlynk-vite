import { Flex } from '@chakra-ui/react'
import {
  Menu,
  MenuItemOption,
  MenuList,
  MenuOptionGroup
} from '@chakra-ui/react'

import MenuHeading from 'components/Misc/MenuHeading'

const Filters = ({ filters, setFilters }) => {
  const { result } = filters || {}

  const onFilterResult = (value) => {
    const filterValue = value?.includes('all') ? [] : value
    setFilters((oldFilters) => ({
      ...oldFilters,
      result: filterValue
    }))
  }

  return (
    <Flex gap={2} alignItems={'center'}>
      <Menu closeOnSelect={false}>
        <MenuHeading
          title={'Result'}
          active={result?.length !== 0 && !result?.includes('all')}
        />
        <MenuList
          minH={'auto'}
          maxH={'300px'}
          overflowY={'scroll'}
          fontSize={'sm'}
        >
          <MenuOptionGroup
            type='checkbox'
            value={result}
            onChange={onFilterResult}
          >
            {['all', 'detected', 'not_detected'].map((item, index) => (
              <MenuItemOption
                key={index}
                value={item}
                fontSize={'sm'}
                textTransform={'capitalize'}
              >
                {item?.replace('_', ' ')}
              </MenuItemOption>
            ))}
          </MenuOptionGroup>
        </MenuList>
      </Menu>
    </Flex>
  )
}

export default Filters
