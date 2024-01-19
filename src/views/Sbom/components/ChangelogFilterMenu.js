import { useQuery } from '@apollo/client'
import {
  Menu,
  MenuList,
  MenuOptionGroup,
  MenuItemOption,
  Flex,
  Box,
  Text
} from '@chakra-ui/react'
import CheckMark from 'components/Misc/CheckMark'
import FilterButton from 'components/Misc/FilterButton'
import { GetLogFilters } from 'graphQL/Queries'
import { useGlobalState } from 'hooks/useGlobalState'
import React, { useState } from 'react'

const ChangelogFilterMenu = ({ id, refetch }) => {
  const { totalRows, prodLogState, dispatch } = useGlobalState()
  const { field, direction, searchInput } = prodLogState
  const { prodLogDispatch } = dispatch

  const { data, error, loading } = useQuery(GetLogFilters, {
    variables: { id: id },
    fetchPolicy: 'network-only'
  })

  const [selectedType, setSelectedType] = useState([])
  const [selectedUser, setSelectedUser] = useState([])
  const [selectObject, setSelectObject] = useState([])

  const logData = {
    id,
    field,
    direction,
    first: totalRows,
    search: searchInput !== '' ? searchInput : undefined
  }

  const onFilterType = (value) => {
    setSelectedType(value.includes('all') ? [] : value)
    refetch({
      variables: {
        changeType: value.includes('all') ? undefined : value,
        ...logData
      }
    })
    prodLogDispatch({ type: 'FETCH_DATA_SUCCESS' })
  }

  const onFilterUser = (value) => {
    setSelectedUser(value.includes('all') ? [] : value)
    refetch({
      variables: {
        changedBy: value.includes('all') ? undefined : value,
        ...logData
      }
    })
    prodLogDispatch({ type: 'FETCH_DATA_SUCCESS' })
  }

  const onFilterObject = (value) => {
    setSelectObject(value.includes('all') ? [] : value)
    refetch({
      variables: {
        changeObject: value.includes('all') ? undefined : value,
        ...logData
      }
    })
    prodLogDispatch({ type: 'FETCH_DATA_SUCCESS' })
  }

  if (loading) return <Text>Loading...</Text>

  if (error) return <Text>Something went wrong...</Text>

  return (
    <Flex alignItems={'center'} gap={4}>
      {/* TYPE FILTER */}
      <Box width={'fit-content'} position={'relative'}>
        <Menu closeOnSelect={true}>
          {selectedType.length !== 0 && <CheckMark />}
          <FilterButton>Type</FilterButton>
          <MenuList minWidth='240px'>
            <MenuOptionGroup
              type='checkbox'
              value={selectedType}
              onChange={onFilterType}
            >
              <MenuItemOption value={'all'} fontSize={'sm'}>
                All
              </MenuItemOption>
              {data?.project?.activityLogFilters?.logChangeTypes?.length > 0 &&
                data?.project?.activityLogFilters?.logChangeTypes?.map(
                  (p, index) => (
                    <MenuItemOption
                      value={p}
                      key={index}
                      fontSize={'sm'}
                      textTransform={'capitalize'}
                    >
                      {p}
                    </MenuItemOption>
                  )
                )}
            </MenuOptionGroup>
          </MenuList>
        </Menu>
      </Box>
      {/* USER FILTER */}
      <Box width={'fit-content'} position={'relative'}>
        <Menu closeOnSelect={true}>
          {selectedUser.length !== 0 && <CheckMark />}
          <FilterButton>User</FilterButton>
          <MenuList minWidth='240px'>
            <MenuOptionGroup
              type='checkbox'
              value={selectedUser}
              onChange={onFilterUser}
            >
              <MenuItemOption value={'all'} fontSize={'sm'}>
                All
              </MenuItemOption>
              {data?.project?.activityLogFilters?.logChangeBys?.length > 0 &&
                data?.project?.activityLogFilters?.logChangeBys?.map(
                  (p, index) => (
                    <MenuItemOption value={p} key={index} fontSize={'sm'}>
                      {p}
                    </MenuItemOption>
                  )
                )}
            </MenuOptionGroup>
          </MenuList>
        </Menu>
      </Box>
      {/* OBJECTS FILTER */}
      <Box width={'fit-content'} position={'relative'}>
        <Menu closeOnSelect={true}>
          {selectObject.length !== 0 && <CheckMark />}
          <FilterButton>Object</FilterButton>
          <MenuList minWidth='240px'>
            <MenuOptionGroup
              type='checkbox'
              value={selectObject}
              onChange={onFilterObject}
            >
              <MenuItemOption value={'all'} fontSize={'sm'}>
                All
              </MenuItemOption>
              {data?.project?.activityLogFilters?.logChangeObjects?.length >
                0 &&
                data?.project?.activityLogFilters?.logChangeObjects?.map(
                  (p, index) => (
                    <MenuItemOption
                      value={p}
                      key={index}
                      fontSize={'sm'}
                      textTransform={'capitalize'}
                    >
                      {p?.replace(/_/g, ' ')}
                    </MenuItemOption>
                  )
                )}
            </MenuOptionGroup>
          </MenuList>
        </Menu>
      </Box>
    </Flex>
  )
}

export default ChangelogFilterMenu
