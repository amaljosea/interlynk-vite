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
  const [teamsWebhookUrl, setTeamsWebhookUrl] = useState('')
  const [isSlackChanged, setIsSlackChanged] = useState(false)
  const [isTeamsChanged, setIsTeamsChanged] = useState(false)

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
      setTeamsWebhookUrl(notificationConfigs.teamsWebhookUrl)
      setIsSlackChanged(false)
      setIsTeamsChanged(false)
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

  const handleSaveSlackWebhookUrl = (id) => {
    updateConfig({
      variables: {
        notificationConfigs: {
          slackWebhookUrl: slackWebhookUrl
        }
      }
    }).then((res) => {
      res?.data?.notificationConfigUpdate?.success &&
        setNotificationConfigs({
          ...notificationConfigs,
          slackWebhookUrl
        })
      setIsSlackChanged(false)
    })
  }

  const handleSaveTeamsWebhookUrl = (id) => {
    updateConfig({
      variables: {
        notificationConfigs: {
          teamsWebhookUrl: teamsWebhookUrl
        }
      }
    }).then((res) => {
      res?.data?.notificationConfigUpdate?.success &&
        setNotificationConfigs({
          ...notificationConfigs,
          teamsWebhookUrl
        })
      setIsTeamsChanged(false)
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
          {id === 'slack' && notificationChannels[id] && (
            <>
              <Input
                value={slackWebhookUrl}
                onChange={(e) => {
                  setSlackWebhookUrl(e.target.value)
                  setIsSlackChanged(true)
                }}
                placeholder='Paste Slack Webhook URL'
                color='gray.600'
                ml='23px'
              />
              <Button
                colorScheme='blue'
                ml='20px'
                onClick={handleSaveSlackWebhookUrl}
                disabled={!isSlackChanged}
              >
                Save
              </Button>
            </>
          )}
          {id === 'teams' && notificationChannels[id] && (
            <>
              <Input
                value={teamsWebhookUrl}
                onChange={(e) => {
                  setTeamsWebhookUrl(e.target.value)
                  setIsTeamsChanged(true)
                }}
                placeholder='Paste Teams Webhook URL'
                color='gray.600'
                ml='15px'
              />
              <Button
                colorScheme='blue'
                ml='20px'
                onClick={handleSaveTeamsWebhookUrl}
                disabled={!isTeamsChanged}
              >
                Save
              </Button>
            </>
          )}
        </Flex>
      ))}
    </Card>
  )
}

export default NotificationChannels
