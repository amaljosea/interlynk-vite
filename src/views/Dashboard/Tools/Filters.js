import {
  Box,
  Menu,
  MenuItemOption,
  MenuList,
  MenuOptionGroup,
  Stack
} from '@chakra-ui/react'

import MenuHeading from 'components/Misc/MenuHeading'

import { useGlobalState } from 'hooks/useGlobalState'

const ToolsFilterMenu = () => {
  const { toolsState, dispatch } = useGlobalState()
  const { filters, difference, component } = toolsState
  const { toolsDispatch } = dispatch

  const onFilterStatus = (value) => {
    console.log('value', value)
    if (value === 'all') {
      toolsDispatch({ type: 'FILTER_DIFF', payload: '' })
    } else {
      toolsDispatch({ type: 'FILTER_DIFF', payload: value })
    }
  }

  const onFilterComponent = (value) => {
    if (value === 'all') {
      toolsDispatch({ type: 'FILTER_COMP', payload: '' })
    } else {
      toolsDispatch({ type: 'FILTER_COMP', payload: value })
    }
  }

  return (
    <Stack direction={'row'} alignItems={'center'} gap={2}>
      {/* STATUS */}
      <Box width={'fit-content'} position={'relative'}>
        <Menu placement='top' closeOnSelect={false}>
          <MenuHeading
            active={difference !== 'all' && difference !== ''}
            title={'Difference'}
          />
          <MenuList fontSize={'sm'}>
            <MenuOptionGroup
              type='radio'
              value={difference}
              onChange={onFilterStatus}
            >
              {filters?.statusList?.map((item, index) => (
                <MenuItemOption
                  key={index}
                  value={item}
                  fontSize={'sm'}
                  textTransform={'capitalize'}
                >
                  {item}
                </MenuItemOption>
              ))}
            </MenuOptionGroup>
          </MenuList>
        </Menu>
      </Box>
      {/* COMPONENTS */}
      <Box width={'fit-content'} position={'relative'}>
        <Menu placement='top' closeOnSelect={false}>
          <MenuHeading
            active={component !== 'all' && component !== ''}
            title={'Components'}
          />
          <MenuList
            minW='auto'
            fontSize={'sm'}
            maxW={'320px'}
            minH={'auto'}
            maxH={'300px'}
            overflowY={'scroll'}
          >
            <MenuOptionGroup
              type='radio'
              value={component}
              onChange={onFilterComponent}
            >
              <MenuItemOption fontSize={'sm'} value='all'>
                All
              </MenuItemOption>
              {filters?.componentList?.map((item, index) => (
                <MenuItemOption
                  key={index}
                  value={item}
                  fontSize={'sm'}
                  textTransform={'capitalize'}
                  wordBreak={'break-all'}
                >
                  {item}
                </MenuItemOption>
              ))}
            </MenuOptionGroup>
          </MenuList>
        </Menu>
      </Box>
    </Stack>
  )
}

export default ToolsFilterMenu
