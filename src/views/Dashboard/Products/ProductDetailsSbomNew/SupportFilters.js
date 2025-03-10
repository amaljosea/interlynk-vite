import { supportLevels } from 'variables/general'

import {
  Flex,
  Menu,
  MenuItemOption,
  MenuList,
  MenuOptionGroup
} from '@chakra-ui/react'

import MenuHeading from 'components/Misc/MenuHeading'

import { useGlobalState } from 'hooks/useGlobalState'

const SupportFilters = ({ reset }) => {
  const { supportState, dispatch } = useGlobalState()
  const { level, include } = supportState
  const { supportDispatch } = dispatch

  const onFilterSupport = (value) => {
    supportDispatch({ type: 'FILTER_LEVEL', payload: value })
    reset()
  }

  const onFilterInclude = (value) => {
    supportDispatch({ type: 'FILTER_INCLUDE', payload: value })
    reset()
  }

  return (
    <Flex alignItems={'center'} gap={2}>
      <Menu closeOnSelect={false} isLazy>
        <MenuHeading
          title={'Support'}
          active={level?.length !== 0 && !level.includes('all')}
        />
        <MenuList
          minH='auto'
          maxH={'350px'}
          minW={'300px'}
          fontSize={'sm'}
          overflowY={'scroll'}
        >
          <MenuOptionGroup
            type={'checkbox'}
            value={level}
            onChange={onFilterSupport}
          >
            {supportLevels?.map((item) => (
              <MenuItemOption
                key={item?.id}
                fontSize={'sm'}
                value={item?.value}
              >
                {item?.label}
              </MenuItemOption>
            ))}
          </MenuOptionGroup>
        </MenuList>
      </Menu>
      <Menu closeOnSelect={false}>
        <MenuHeading title={'Include'} active={include?.length !== 0} />
        <MenuList fontSize={'sm'}>
          <MenuOptionGroup
            type='checkbox'
            value={include}
            onChange={onFilterInclude}
          >
            <MenuItemOption value={'parts'} fontSize={'sm'}>
              Parts
            </MenuItemOption>
          </MenuOptionGroup>
        </MenuList>
      </Menu>
    </Flex>
  )
}

export default SupportFilters
