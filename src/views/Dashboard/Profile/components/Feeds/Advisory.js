import { useMutation } from '@apollo/client'

import { Flex, Tag, Text, useColorModeValue } from '@chakra-ui/react'

// Custom components
import Card from 'components/Card/Card'
import CardBody from 'components/Card/CardBody'
import CardHeader from 'components/Card/CardHeader'
import LynkSwitch from 'components/Misc/LynkSwitch'

import { OrgSettingCreate, OrgSettingUpdate } from 'graphQL/Mutation'

const AdvisoryFeeds = ({ data, manageFeeds }) => {
  const textColor = useColorModeValue('gray.700', 'white')
  const [organizationSettingCreate] = useMutation(OrgSettingCreate)
  const [organizationSettingUpdate] = useMutation(OrgSettingUpdate)

  const handleChange = async (e, id, feed) => {
    try {
      if (feed && feed.id !== undefined) {
        await organizationSettingUpdate({
          variables: {
            id: feed.id,
            value: e.target.checked ? true : false
          }
        })
      } else {
        await organizationSettingCreate({
          variables: {
            settingId: id,
            value: e.target.checked ? true : false
          }
        })
      }
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <Card p={0} boxShadow='none'>
      <CardHeader p='12px 0' mb='12px'>
        <Text fontSize='lg' color={textColor} fontWeight='bold'>
          Advisory Feeds
        </Text>
      </CardHeader>
      <CardBody px='5px'>
        <Flex direction='column'>
          {data?.length > 0 &&
            [...data]
              .sort((a, b) =>
                a?.setting?.friendlyName.localeCompare(b?.setting?.friendlyName)
              )
              .map((feed, index) => {
                const activeFeed = data?.find((org) => org.id === feed.id)
                return (
                  <Flex align='center' mb='20px' key={index}>
                    <LynkSwitch
                      size='md'
                      me='10px'
                      id={feed.id}
                      isReadOnly
                      colorScheme='blue'
                      disabled={!manageFeeds}
                      isChecked={activeFeed?.value}
                      onChange={(e) => handleChange(e, feed.id, activeFeed)}
                    />
                    <Text
                      mr={2}
                      noOfLines={1}
                      color='gray.500'
                      fontWeight='400'
                      htmlFor={feed.friendlyName}
                    >
                      {feed.setting.friendlyName}
                    </Text>
                    <Tag hidden={activeFeed?.value} size='sm' fontSize='10'>
                      Coming soon
                    </Tag>
                  </Flex>
                )
              })}
        </Flex>
      </CardBody>
    </Card>
  )
}

export default AdvisoryFeeds
