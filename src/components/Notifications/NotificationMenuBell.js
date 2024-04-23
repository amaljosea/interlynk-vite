import { useLazyQuery, useMutation, useQuery } from '@apollo/client'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import {
  Box,
  IconButton,
  Menu,
  MenuButton,
  MenuItemOption,
  MenuList,
  MenuOptionGroup,
  useToast
} from '@chakra-ui/react'

import { UpdateNotificationPreference } from 'graphQL/Mutation'
import {
  GetUserNotificationChannels,
  GetUserNotificationPreferences
} from 'graphQL/Queries'

import { FaBell } from 'react-icons/fa'

import CheckMark from '../Misc/CheckMark'

const NotificationMenuBell = () => {
  const toast = useToast()
  const params = useParams()
  const productId = params.productid
  const [updatePreference] = useMutation(UpdateNotificationPreference)
  const { data } = useQuery(GetUserNotificationPreferences, {
    variables: {
      envId: productId
    }
  })
  const [getChannelsInfo] = useLazyQuery(GetUserNotificationChannels)

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
      variables: {
        notificationPreferences: newPreference,
        envId: localStorage['activeEnv']
      }
    }).then((res) => {
      setPreference(newPreference)
      getChannelsInfo().then(({ data: { notificationChannels } }) => {
        const enabledChannelCount = Object.values(notificationChannels).filter(
          (value) => value === true
        ).length

        if (enabledChannelCount === 0 && !newPreference.includes('none')) {
          toast({
            title: 'No notification channel enabled',
            description:
              'Please enable at least one channel under personal settings.',
            status: 'warning',
            duration: 5000,
            isClosable: true,
            position: 'top'
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
        {preference[0] != 'none' && <CheckMark zIndex={1} />}
        <MenuButton>
          <IconButton colorScheme='blue' icon={<FaBell />} />
        </MenuButton>
        <MenuList>
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
