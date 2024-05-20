import { useState } from 'react'

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

import { useGlobalState } from 'hooks/useGlobalState'

const LogFilters = ({ setLogState }) => {
  const { sbomLogState } = useGlobalState()
  const { filters } = sbomLogState
  const { logChangeBys, logChangeObjects, logChangeTypes } = filters || ''

  const [users, setUser] = useState([])
  const onFilterChangeBy = (value) => {
    const filterValue = value?.includes('all') ? undefined : value
    setUser(value?.includes('all') ? [] : value)
    setLogState((oldFilters) => ({
      ...oldFilters,
      changedBy: filterValue
    }))
  }

  const [objects, setObjects] = useState([])
  const onFilterChangeObj = (value) => {
    const filterValue = value?.includes('all') ? undefined : value
    setObjects(value?.includes('all') ? [] : value)
    setLogState((oldFilters) => ({
      ...oldFilters,
      changeObject: filterValue
    }))
  }

  const [types, setTypes] = useState([])
  const onFilterChangeType = (value) => {
    const filterValue = value?.includes('all') ? undefined : value
    setTypes(value?.includes('all') ? [] : value)
    setLogState((oldFilters) => ({
      ...oldFilters,
      changeType: filterValue
    }))
  }

  return (
    <Stack direction={'row'} alignItems={'center'} gap={1}>
      {/* USER */}
      <Box width={'fit-content'} position={'relative'}>
        <Menu closeOnBlur={true}>
          {users?.length !== 0 && <CheckMark />}
          <MenuHeading title={'User'} />
          <MenuList
            minHeight={'auto'}
            maxHeight={'300px'}
            overflow={'hidden'}
            overflowY={'scroll'}
          >
            <MenuOptionGroup
              type='checkbox'
              value={users}
              onChange={onFilterChangeBy}
            >
              <MenuItemOption value={'all'} fontSize={'sm'}>
                All
              </MenuItemOption>
              {logChangeBys?.map((item, index) => (
                <MenuItemOption key={index} value={item} fontSize={'sm'}>
                  {item}
                </MenuItemOption>
              ))}
            </MenuOptionGroup>
          </MenuList>
        </Menu>
      </Box>
      {/* OBJECT */}
      <Box width={'fit-content'} position={'relative'}>
        <Menu closeOnSelect={true}>
          {objects?.length !== 0 && <CheckMark />}
          <MenuHeading title={'Object'} />
          <MenuList
            minHeight={'auto'}
            maxHeight={'300px'}
            overflow={'hidden'}
            overflowY={'scroll'}
          >
            <MenuOptionGroup
              type='checkbox'
              value={objects}
              onChange={onFilterChangeObj}
            >
              <MenuItemOption value={'all'} fontSize={'sm'}>
                All
              </MenuItemOption>
              {logChangeObjects?.map((item, index) => (
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
      {/* TYPE */}
      <Box width={'fit-content'} position={'relative'}>
        <Menu closeOnSelect={true}>
          {types?.length !== 0 && <CheckMark />}
          <MenuHeading title={'Type'} />
          <MenuList
            minHeight={'auto'}
            maxHeight={'300px'}
            overflow={'hidden'}
            overflowY={'scroll'}
          >
            <MenuOptionGroup
              type='checkbox'
              value={types}
              onChange={onFilterChangeType}
            >
              <MenuItemOption value={'all'} fontSize={'sm'}>
                All
              </MenuItemOption>
              {logChangeTypes?.map((item, index) => (
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
    </Stack>
  )
}

export default LogFilters
