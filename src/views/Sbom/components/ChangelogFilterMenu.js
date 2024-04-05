import { useQuery } from '@apollo/client'

import {
  Box,
  Flex,
  Menu,
  MenuItemOption,
  MenuList,
  MenuOptionGroup,
  Text
} from '@chakra-ui/react'

import CheckMark from 'components/Misc/CheckMark'
import MenuHeading from 'components/Misc/MenuHeading'

import { useGlobalState } from 'hooks/useGlobalState'

import { GetLogFilters } from 'graphQL/Queries'

const ChangelogFilterMenu = ({ id, refetch }) => {
  const { totalRows, activeProdTab, prodLogState, dispatch } = useGlobalState()
  const { field, direction, searchInput, user, type, object } = prodLogState
  const { prodLogDispatch } = dispatch

  const { data, error, loading } = useQuery(GetLogFilters, {
    skip: activeProdTab === 4 ? false : true,
    variables: { id: id },
    fetchPolicy: 'network-only'
  })

  const logData = {
    id,
    field,
    direction,
    first: totalRows,
    search: searchInput !== '' ? searchInput : undefined
  }

  const onFilterType = async (value) => {
    await refetch({
      variables: {
        changeType: value.includes('all') ? undefined : value,
        changedBy: user?.length === 0 ? undefined : user,
        changeObject: object?.length === 0 ? undefined : object,
        ...logData
      }
    }).then((res) => {
      if (res.data) {
        prodLogDispatch({ type: 'FILTER_TYPE', payload: value })
      }
    })
  }

  const onFilterUser = async (value) => {
    await refetch({
      variables: {
        changeType: type?.length === 0 ? undefined : type,
        changedBy: value.includes('all') ? undefined : value,
        changeObject: object?.length === 0 ? undefined : object,
        ...logData
      }
    }).then((res) => {
      if (res.data) {
        prodLogDispatch({ type: 'FILTER_USER', payload: value })
      }
    })
  }

  const onFilterObject = async (value) => {
    await refetch({
      variables: {
        changeType: type?.length === 0 ? undefined : type,
        changedBy: user?.length === 0 ? undefined : user,
        changeObject: value.includes('all') ? undefined : value,
        ...logData
      }
    }).then((res) => {
      if (res.data) {
        prodLogDispatch({ type: 'FILTER_OBJECT', payload: value })
      }
    })
  }

  if (loading) return <Text pt={2}>Loading...</Text>

  if (error) return <Text pt={2}>Something went wrong...</Text>

  return (
    <Flex alignItems={'center'} gap={4}>
      {/* TYPE FILTER */}
      <Box width={'fit-content'} position={'relative'}>
        <Menu closeOnSelect={true}>
          {type.length !== 0 && <CheckMark />}
          <MenuHeading title={'Type'} />
          <MenuList minWidth='240px'>
            <MenuOptionGroup
              type='checkbox'
              value={type}
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
          {user.length !== 0 && <CheckMark />}
          <MenuHeading title={'User'} />
          <MenuList minWidth='240px'>
            <MenuOptionGroup
              type='checkbox'
              value={user}
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
          {object.length !== 0 && <CheckMark />}
          <MenuHeading title={'Object'} />
          <MenuList minWidth='240px'>
            <MenuOptionGroup
              type='checkbox'
              value={object}
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
