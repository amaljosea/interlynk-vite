import { supportLevels } from 'variables/general'

import {
  Menu,
  MenuItemOption,
  MenuList,
  MenuOptionGroup,
  Stack
} from '@chakra-ui/react'

import MenuHeading from 'components/Misc/MenuHeading'

import { useGlobalState } from 'hooks/useGlobalState'

const SupportFilters = ({ reset }) => {
  const { supportState, dispatch } = useGlobalState()
  const { level } = supportState
  const { supportDispatch } = dispatch

  const onFilterSupport = (value) => {
    supportDispatch({ type: 'FILTER_LEVEL', payload: value })
    reset()
  }

  return (
    <Stack direction={'row'} alignItems={'center'} gap={1}>
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
    </Stack>
  )
}

export default SupportFilters
