import { useQuery } from '@apollo/client'
import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ProductDetailsTabs } from 'utils/TabsObjects'

import { Box, Flex, Menu, Text } from '@chakra-ui/react'

import CustomList from 'components/Misc/CustomList'
import MenuHeading from 'components/Misc/MenuHeading'

import { GetLogFilters } from 'graphQL/Queries'

const ChangelogFilterMenu = ({ id, setFilter }) => {
  const queryParams = useSearchParams()
  const tab = queryParams[0].get('tab')

  const [user, setUser] = useState([])
  const [type, setType] = useState([])
  const [object, setObject] = useState([])

  const { CHANGE_LOG } = ProductDetailsTabs

  const { data, error, loading } = useQuery(GetLogFilters, {
    fetchPolicy: 'network-only',
    skip: tab === CHANGE_LOG ? false : true,
    variables: { id: id }
  })
  const { logChangeTypes, logChangeBys, logChangeObjects } =
    data?.project?.activityLogFilters || ''

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

  const typeOptions = logChangeTypes?.map((item) => item)
  const userOptions = logChangeBys?.map((item) => item)
  const objectOptions = logChangeObjects?.map((item) => item)

  if (loading) return <Text pt={2}>Loading...</Text>

  if (error) return <Text pt={2}>Something went wrong...</Text>

  return (
    <Flex alignItems={'center'} gap={3}>
      {/* TYPE FILTER */}
      <Box width={'fit-content'}>
        <Menu closeOnSelect={true}>
          <MenuHeading title={'Type'} active={type.length !== 0} />
          {logChangeTypes?.length > 0 && (
            <CustomList
              value={type}
              options={typeOptions}
              onChange={onFilterType}
            />
          )}
        </Menu>
      </Box>
      {/* USER FILTER */}
      <Box width={'fit-content'}>
        <Menu closeOnSelect={true}>
          <MenuHeading title={'User'} active={user.length !== 0} />
          {logChangeBys?.length > 0 && (
            <CustomList
              value={user}
              options={userOptions}
              onChange={onFilterUser}
            />
          )}
        </Menu>
      </Box>
      {/* OBJECTS FILTER */}
      <Box width={'fit-content'}>
        <Menu closeOnSelect={true}>
          <MenuHeading title={'Object'} active={object.length !== 0} />
          {logChangeObjects?.length > 0 && (
            <CustomList
              value={object}
              options={objectOptions}
              onChange={onFilterObject}
            />
          )}
        </Menu>
      </Box>
    </Flex>
  )
}

export default ChangelogFilterMenu
