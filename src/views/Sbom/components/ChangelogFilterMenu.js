import { useQuery } from '@apollo/client'
import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ProductGeneralTabs } from 'utils/TabsObjects'

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

import { GetLogFilters } from 'graphQL/Queries'

const ChangelogFilterMenu = ({ id, setFilter }) => {
  const queryParams = useSearchParams()
  const tab = queryParams[0].get('tab')

  const [user, setUser] = useState([])
  const [type, setType] = useState([])
  const [object, setObject] = useState([])

  const { CHANGELOG } = ProductGeneralTabs

  const { data, error, loading } = useQuery(GetLogFilters, {
    fetchPolicy: 'network-only',
    skip: tab === CHANGELOG ? false : true,
    variables: { id: id }
  })

  const onFilterType = (value) => {
    const filterValue = value?.includes('all') ? undefined : value
    setType(value?.includes('all') ? [] : value)
    setFilter((oldFilters) => ({
      ...oldFilters,
      changeType: filterValue
    }))
  }

  const onFilterUser = (value) => {
    const filterValue = value?.includes('all') ? undefined : value
    setUser(value?.includes('all') ? [] : value)
    setFilter((oldFilters) => ({
      ...oldFilters,
      changedBy: filterValue
    }))
  }

  const onFilterObject = (value) => {
    const filterValue = value?.includes('all') ? undefined : value
    setObject(value?.includes('all') ? [] : value)
    setFilter((oldFilters) => ({
      ...oldFilters,
      changeObject: filterValue
    }))
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
