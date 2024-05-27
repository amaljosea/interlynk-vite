import { useState } from 'react'

import { Box, Menu, Stack } from '@chakra-ui/react'

import CheckMark from 'components/Misc/CheckMark'
import CustomList from 'components/Misc/CustomList'
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

  if (filters) {
    return (
      <Stack direction={'row'} alignItems={'center'} gap={1}>
        {/* USER */}
        <Box width={'fit-content'} position={'relative'}>
          <Menu closeOnBlur={true}>
            {users?.length !== 0 && <CheckMark />}
            <MenuHeading title={'User'} />
            <CustomList
              options={logChangeBys}
              value={users}
              onChange={onFilterChangeBy}
            />
          </Menu>
        </Box>
        {/* OBJECT */}
        <Box width={'fit-content'} position={'relative'}>
          <Menu closeOnSelect={true}>
            {objects?.length !== 0 && <CheckMark />}
            <MenuHeading title={'Object'} />
            <CustomList
              options={logChangeObjects}
              value={objects}
              onChange={onFilterChangeObj}
            />
          </Menu>
        </Box>
        {/* TYPE */}
        <Box width={'fit-content'} position={'relative'}>
          <Menu closeOnSelect={true}>
            {types?.length !== 0 && <CheckMark />}
            <MenuHeading title={'Type'} />
            <CustomList
              options={logChangeTypes}
              value={types}
              onChange={onFilterChangeType}
            />
          </Menu>
        </Box>
      </Stack>
    )
  }

  return null
}

export default LogFilters
