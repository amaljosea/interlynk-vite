import { useMutation, useQuery } from '@apollo/client'
import React, { useEffect, useState } from 'react'

import { Flex, Switch, Text } from '@chakra-ui/react'

import { useGlobalQueryContext } from 'hooks/useGlobalQueryContext'
import useQueryParam from 'hooks/useQueryParam'

import { UpdateNotificationChannel } from 'graphQL/Mutation'
import {
  GetUserNotificationChannels,
  GetUserNotificationConfigs
} from 'graphQL/Queries'

import Card from '../Card/Card'
import CardHeader from '../Card/CardHeader'

const NotificationChannels = () => {
  const activetab = useQueryParam('tab')
  const { orgView } = useGlobalQueryContext()

  const [updateChannel] = useMutation(UpdateNotificationChannel)
  const [notificationChannels, setNotificationChannels] = useState({})

  const status = !orgView ? true : activetab === 'notifications' ? false : true

  const { data: channels } = useQuery(GetUserNotificationChannels, {
    skip: status
  })

  const { data: configs } = useQuery(GetUserNotificationConfigs, {
    skip: status
  })

  useEffect(() => {
    if (channels) {
      let notificationChannels = { ...channels.notificationChannels } || {}
      if ('__typename' in notificationChannels) {
        delete notificationChannels.__typename
      }
      setNotificationChannels(notificationChannels)
    }
  }, [channels])

  useEffect(() => {
    if (configs) {
      let notificationConfigs = { ...configs.notificationConfigs } || {}
      if ('__typename' in notificationConfigs) {
        delete notificationConfigs.__typename
      }
    }
  }, [configs])

  const handleSwitchChange = (id) => {
    const selectedChannels = {
      ...notificationChannels,
      [id]: !notificationChannels[id]
    }

    updateChannel({
      variables: {
        notificationChannels: {
          ...selectedChannels
        }
      }
    }).then((res) => {
      res?.data?.notificationChannelUpdate?.success &&
        setNotificationChannels(selectedChannels)
    })
  }

  return (
    <Card p={0}>
      <CardHeader p='12px 0' mb='12px'>
        <Text fontSize='lg' fontWeight='bold'>
          Channels
        </Text>
      </CardHeader>
      {Object.keys(notificationChannels).map((id, index) => (
        <Flex align='center' mb='20px' key={index}>
          <Switch
            size='md'
            colorScheme='blue'
            isChecked={notificationChannels[id]}
            me='20px'
            onChange={() => handleSwitchChange(id)}
          />
          <Text color='gray.500' fontWeight='400' textTransform={'capitalize'}>
            {id}
          </Text>
        </Flex>
      ))}
    </Card>
  )
}

export default NotificationChannels
