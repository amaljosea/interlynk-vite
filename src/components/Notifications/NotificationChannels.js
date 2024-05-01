import { useMutation, useQuery } from '@apollo/client'
import React, { useEffect, useState } from 'react'

import { Button, Flex, Input, Switch, Text } from '@chakra-ui/react'

import {
  UpdateNotificationChannel,
  UpdateNotificationConfig
} from 'graphQL/Mutation'
import {
  GetUserNotificationChannels,
  GetUserNotificationConfigs
} from 'graphQL/Queries'

import Card from '../Card/Card'
import CardHeader from '../Card/CardHeader'

const NotificationChannels = () => {
  const [slackWebhookUrl, setSlackWebhookUrl] = useState('')
  const [isChanged, setIsChanged] = useState(false)

  const [updateChannel] = useMutation(UpdateNotificationChannel)
  const [updateConfig] = useMutation(UpdateNotificationConfig)
  const [notificationChannels, setNotificationChannels] = useState({})
  const [notificationConfigs, setNotificationConfigs] = useState({})

  const { data: channels } = useQuery(GetUserNotificationChannels, {
    fetchPolicy: 'network-only'
  })

  const { data: configs } = useQuery(GetUserNotificationConfigs, {
    fetchPolicy: 'network-only'
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
      setNotificationConfigs(notificationConfigs)
      setSlackWebhookUrl(notificationConfigs.slackWebhookUrl)
      setIsChanged(false)
    }
  }, [configs])

  const handleSwitchChange = (id) => {
    const selectedChannels = {
      ...notificationChannels,
      [id]: !notificationChannels[id]
    }

    updateChannel({
      variables: {
        notificationChannels: selectedChannels
      }
    }).then((res) => {
      res?.data?.notificationChannelUpdate?.success &&
        setNotificationChannels(selectedChannels)
    })
  }

  const handleSaveWebhookUrl = () => {
    updateConfig({
      variables: {
        notificationConfigs: {
          slackWebhookUrl: slackWebhookUrl
        }
      }
    }).then((res) => {
      console.log(notificationConfigs, slackWebhookUrl)
      res?.data?.notificationConfigUpdate?.success &&
        setNotificationConfigs({
          ...notificationConfigs,
          slackWebhookUrl
        })
      setIsChanged(false)
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
            isDisabled={['teams'].includes(id)}
          />
          <Text color='gray.500' fontWeight='400' textTransform={'capitalize'}>
            {id}
          </Text>
          {id === 'slack' && notificationChannels[id] && (
            <>
              <Input
                value={slackWebhookUrl}
                onChange={(e) => {
                  setSlackWebhookUrl(e.target.value)
                  setIsChanged(true)
                }}
                placeholder='Paste Slack Webhook URL'
                color='gray.600'
                ml='20px'
              />
              <Button
                colorScheme='blue'
                ml='20px'
                onClick={handleSaveWebhookUrl}
                disabled={!isChanged}
              >
                Save
              </Button>
            </>
          )}
        </Flex>
      ))}

      <Text color='gray.500' fontSize='sm' mt='20px'>
        * Teams will be enabled soon
      </Text>
    </Card>
  )
}

export default NotificationChannels
