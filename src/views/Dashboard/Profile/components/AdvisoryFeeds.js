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
import { useMutation, useQuery } from '@apollo/client'
import { OrgSettingUpdate, OrgSettingCreate } from 'graphQL/Mutation'
import { GetOrgSettings } from 'graphQL/Queries'

const AdvisoryFeeds = () => {
  const textColor = useColorModeValue('gray.700', 'white')

  const { data, refetch } = useQuery(GetOrgSettings)

  const [organizationSettingCreate] = useMutation(OrgSettingCreate)
  const [organizationSettingUpdate] = useMutation(OrgSettingUpdate)

  const filteredFeed =
    data &&
    data.organization.organizationSettings.filter(
      (item) => item.setting.kind === `advisory_feed`
    )

  const handleChange = async (e, id, feed) => {
    try {
      if (feed && feed.id !== undefined) {
        await organizationSettingUpdate({
          variables: {
            id: feed.id,
            value: e.target.checked ? true : false
          }
        }).then(() => refetch())
      } else {
        await organizationSettingCreate({
          variables: {
            settingId: id,
            value: e.target.checked ? true : false
          }
        }).then(() => refetch())
      }
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <Card p={0}>
      <CardHeader p='12px 0' mb='12px'>
        <Text fontSize='lg' color={textColor} fontWeight='bold'>
          Advisory Feeds
        </Text>
      </CardHeader>
      <CardBody px='5px'>
        {data && (
          <Flex direction='column'>
            {filteredFeed &&
              filteredFeed.map((feed, index) => {
                const activeFeed = data.organization.organizationSettings.find(
                  (org) => org.id === feed.id
                )
                return (
                  <Link
                    href='https://nvd.nist.gov/'
                    target='_blank'
                    key={index}
                  >
                    <Flex align='center' mb='20px'>
                      <Switch
                        size='md'
                        colorScheme='blue'
                        me='10px'
                        disabled={true}
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
                        color='gray.500'
                        fontWeight='400'
                        htmlFor={feed.friendlyName}
                      >
                        {feed.setting.friendlyName}
                      </Text>
                    </Flex>
                  </Link>
                )
              })}
          </Flex>
        )}
      </CardBody>
    </Card>
  )
}

export default AdvisoryFeeds
