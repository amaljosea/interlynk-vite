import { useLazyQuery, useMutation, useQuery } from '@apollo/client'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import { Box, Icon, IconButton, Tooltip } from '@chakra-ui/react'
import {
  Menu,
  MenuButton,
  MenuItemOption,
  MenuList,
  MenuOptionGroup
} from '@chakra-ui/react'

import useCustomToast from 'hooks/useCustomToast'

import { UpdateNotificationPreference } from 'graphQL/Mutation'
import {
  GetOrgConnections,
  GetPersonalConnections,
  GetUserNotificationChannels,
  GetUserNotificationPreferences
} from 'graphQL/Queries'

import { LuBell } from 'react-icons/lu'

import CheckMark from '../Misc/CheckMark'

const NotificationMenuBell = () => {
  const { showToast } = useCustomToast()
  const params = useParams()
  const productId = params.productid
  const [updatePreference] = useMutation(UpdateNotificationPreference)
  const { data } = useQuery(GetUserNotificationPreferences, {
    variables: { envId: productId }
  })
  const [getChannelsInfo] = useLazyQuery(GetUserNotificationChannels)
  const [getOrgConnections] = useLazyQuery(GetOrgConnections)
  const [getPersonalConnections] = useLazyQuery(GetPersonalConnections)

  useEffect(() => {
    if (data) {
      setPreference(data.notificationPreferences || ['none'])
    }
  }, [data])

  const [preference, setPreference] = useState([])
  const notificationPreferences = {
    Off: 'none',
    'All Activities': 'all',
    Vulnerabilities: 'vulnerabilities',
    Licenses: 'licenses',
    Policies: 'policies'
  }

  const handlePreferenceChange = (newPreference) => {
    if (newPreference.includes('none') || newPreference.includes('all')) {
      newPreference = [newPreference[newPreference.length - 1]] // only allow one status at a time
    }
    //API call to update user's notification preferences
    updatePreference({
      variables: { notificationPreferences: newPreference, envId: productId }
    }).then(() => {
      setPreference(newPreference)
      let enabledChannelCount = 0

      Promise.all([
        getChannelsInfo(),
        getOrgConnections(),
        getPersonalConnections()
      ]).then((values) => {
        const channelsData = values[0].data.notificationChannels
        const orgConnectionsData = values[1].data.organization.connections.nodes
        const personalConnectionsData =
          values[2].data.organizationUser.connections.nodes

        enabledChannelCount = Object.values(channelsData).filter(
          (value) => value === true
        ).length

        const orgConnectionsCount = orgConnectionsData.filter(
          (node) => node.connection.__typename !== 'JiraConnection'
        ).length
        const personalConnectionsCount = personalConnectionsData.filter(
          (node) => node.connection.__typename !== 'JiraConnection'
        ).length

        enabledChannelCount += orgConnectionsCount + personalConnectionsCount

        if (enabledChannelCount === 0 && !newPreference.includes('none')) {
          showToast({
            title: 'No notification medium enabled',
            description:
              'Please configure at least one notification medium under settings.',
            status: 'warning'
          })
        }
      })
    })
  }

  const generateMenuItems = (notificationPreferences) => {
    return Object.entries(notificationPreferences).map(([key, value]) => (
      <MenuItemOption key={key} value={value} fontSize={'sm'}>
        {key}
      </MenuItemOption>
    ))
  }

  return (
    <Box width={'fit-content'} position={'relative'}>
      <Menu closeOnSelect={false}>
        {preference[0] !== 'none' && <CheckMark zIndex={1} />}
        <Tooltip label='Edit Notifications'>
          <MenuButton as={IconButton} colorScheme='blue'>
            <Icon as={LuBell} fontSize={18} mt={1} />
          </MenuButton>
        </Tooltip>
        <MenuList fontSize={'sm'}>
          <MenuOptionGroup
            type='checkbox'
            value={preference}
            onChange={handlePreferenceChange}
          >
            {generateMenuItems(notificationPreferences)}
          </MenuOptionGroup>
        </MenuList>
      </Menu>
    </Box>
  )
}

export default NotificationMenuBell
