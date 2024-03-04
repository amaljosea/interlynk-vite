import {
  Box,
  Menu,
  MenuItemOption,
  MenuList,
  MenuOptionGroup,
  Stack
} from '@chakra-ui/react'
import CheckMark from 'components/Misc/CheckMark'
import MenuHeading from 'components/Misc/MenuHeading'
import React, { useState } from 'react'

const ToolsFilterMenu = ({ data, setData }) => {
  const [diffs, setDiffs] = useState([])
  const [components, setComponents] = useState([])

  const componentList = data?.map((item) => item?.targetComponent?.name || item?.subjectComponent?.name)
  const statusList = ['all', 'added', 'changed', 'removed']

  const onFilterStatus = (value) => {
    if (value.includes('all') || value?.length === 0) {
      setDiffs([])
      setData(data)
    } else {
      setDiffs(value)
      const filterData = data?.filter((item) => value?.includes(item?.diffType))
      setData(filterData)
    }
  }

  const onFilterComponent = (value) => {
    if (value.includes('all') || value?.length === 0) {
      setComponents([])
      setData(data)
    } else {
      setComponents(value)
      const filterData = data?.filter((item) => value?.includes(
          item?.targetComponent?.name || item?.subjectComponent?.name
        )
      )
      setData(filterData)
    }
  }

  return (
    <Stack direction={'row'} alignItems={'center'} gap={2}>
      {/* STATUS */}
      <Box width={'fit-content'} position={'relative'}>
        <Menu placement='top' closeOnSelect={false}>
          {diffs?.length !== 0 && !diffs.includes('all') && <CheckMark />}
          <MenuHeading title={'Difference'} />
          <MenuList>
            <MenuOptionGroup type='checkbox' value={diffs} onChange={onFilterStatus}>
              {statusList?.map((item, index) => (
                <MenuItemOption key={index} value={item} fontSize={'sm'} textTransform={'capitalize'}>
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
          {components?.length !== 0 && !components.includes('all') && (
            <CheckMark />
          )}
          <MenuHeading title={'Components'} />
          <MenuList minW='auto' maxW={'320px'} minH={'auto'} maxH={'300px'} overflowY={'scroll'}>
            <MenuOptionGroup type='checkbox' value={components} onChange={onFilterComponent}>
              <MenuItemOption fontSize={'sm'} value='all'>All</MenuItemOption>
              {componentList?.map((item, index) => (
                <MenuItemOption key={index} value={item} fontSize={'sm'} textTransform={'capitalize'} wordBreak={'break-all'}>
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
