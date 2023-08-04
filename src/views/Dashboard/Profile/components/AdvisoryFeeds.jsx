// Chakra imports
import {
  Flex,
  Switch,
  Text,
  useColorModeValue,
  Icon,
  Link
} from '@chakra-ui/react'
// Custom components
import Card from 'components/Card/Card'
import CardBody from 'components/Card/CardBody'
import CardHeader from 'components/Card/CardHeader'
import React from 'react'
import { ExternalLinkIcon } from '@chakra-ui/icons'
import { useMutation } from '@apollo/client'
import { OrgSettingUpdate, OrgSettingCreate } from 'graphQL/Mutation'

const AdvisoryFeeds = ({ data, orgInfo }) => {
  const textColor = useColorModeValue('gray.700', 'white')

  const [organizationSettingCreate] = useMutation(OrgSettingCreate)
  const [organizationSettingUpdate] = useMutation(OrgSettingUpdate)

  const filteredFeed =
    data && data.settings.filter((item) => item.kind === `advisory_feed`)

  const handleChange = async (e, id, feed) => {
    try {
      if (feed && feed.id !== undefined) {
        await organizationSettingUpdate({
          variables: {
            id: feed.id,
            value: e.target.checked ? true : false
          }
        }).then(() => {
          window.location.reload()
        })
      } else {
        await organizationSettingCreate({
          variables: {
            settingId: id,
            value: e.target.checked ? true : false
          }
        }).then(() => {
          window.location.reload()
        })
      }
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <Card p='16px'>
      <CardHeader p='12px 5px' mb='12px'>
        <Text fontSize='lg' color={textColor} fontWeight='bold'>
          Advisory Feeds
        </Text>
      </CardHeader>
      <CardBody px='5px'>
        <Flex direction='column'>
          {filteredFeed &&
            filteredFeed.map((feed, index) => {
              const activeFeed = orgInfo.organization.organizationSettings.find(
                (org) => org.setting.id === feed.id
              )
              return (
                <Link href='https://nvd.nist.gov/' isExternal key={index}>
                  <Flex align='center' mb='20px'>
                    <Switch
                      colorScheme='blue'
                      me='10px'
                      isChecked={activeFeed && activeFeed.value}
                      onChange={(e) => handleChange(e, feed.id, activeFeed)}
                      id={feed.id}
                    />
                    <Icon
                      as={ExternalLinkIcon}
                      h={'16px'}
                      w={'16px'}
                      me='5px'
                    />
                    <Text
                      noOfLines={1}
                      fontSize='md'
                      color='gray.500'
                      fontWeight='400'
                      htmlFor={feed.friendlyName}
                    >
                      {feed.friendlyName}
                    </Text>
                  </Flex>
                </Link>
              )
            })}
        </Flex>
      </CardBody>
    </Card>
  )
}

export default AdvisoryFeeds
