import { useState } from 'react'

import { Box, Flex, Menu } from '@chakra-ui/react'

import CustomList from 'components/Misc/CustomList'
import MenuHeading from 'components/Misc/MenuHeading'

const LogFilters = ({ filters, setLogState }) => {
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

  if (filters) {
    return (
      <Flex gap={2} alignItems={'center'}>
        {/* USER */}
        <Box width={'fit-content'}>
          <Menu closeOnBlur={true}>
            <MenuHeading title={'User'} active={users?.length !== 0} />
            <CustomList
              options={logChangeBys}
              value={users}
              onChange={onFilterChangeBy}
            />
          </Menu>
        </Box>
        {/* OBJECT */}
        <Box width={'fit-content'}>
          <Menu closeOnSelect={true}>
            <MenuHeading title={'Object'} active={objects?.length !== 0} />
            <CustomList
              options={logChangeObjects}
              value={objects}
              onChange={onFilterChangeObj}
            />
          </Menu>
        </Box>
        {/* TYPE */}
        <Box width={'fit-content'}>
          <Menu closeOnSelect={true}>
            <MenuHeading title={'Type'} active={types?.length !== 0} />
            <CustomList
              options={logChangeTypes}
              value={types}
              onChange={onFilterChangeType}
            />
          </Menu>
        </Box>
      </Flex>
    )
  }

  return null
}

export default LogFilters
