import React, {useEffect, useState} from 'react';
import { Flex, Switch, Text } from '@chakra-ui/react';
import Card from "../Card/Card";
import CardHeader from "../Card/CardHeader";
import {useMutation, useQuery} from "@apollo/client";
import {GetUserNotificationChannels} from "graphQL/Queries";
import {UpdateNotificationChannel} from "graphQL/Mutation";

const NotificationChannels = () => {
  const [updateChannel] = useMutation(UpdateNotificationChannel)
  const [notificationChannels, setNotificationChannels] = useState({})
  const { data } = useQuery(GetUserNotificationChannels)


  useEffect(() => {
    if (data) {
      let notificationChannels = { ...data.notificationChannels } || {}
      if ('__typename' in notificationChannels) {
        delete notificationChannels.__typename;
      }
      setNotificationChannels(notificationChannels);
    }
  }, [data]);

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
      res?.data?.notificationChannelUpdate?.success && setNotificationChannels(selectedChannels)
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
            isDisabled={['slack', 'teams'].includes(id)}
          />
          <Text
            noOfLines={1}
            color='gray.500'
            fontWeight='400'
            textTransform={'capitalize'}
          >
            {id}
          </Text>
        </Flex>
      ))}
      <Text color='gray.500' fontSize='sm' mt='20px'>
        * More channels will be enabled soon
      </Text>
    </Card>
  )
}

export default NotificationChannels;