import { useQuery } from '@apollo/client'
import { useEffect, useState } from 'react'

import { CheckIcon } from '@chakra-ui/icons'
import { Button, Flex, Text, Wrap, useDisclosure } from '@chakra-ui/react'

import { GetConnections } from 'graphQL/Queries'

import { FaJira, FaMicrosoft, FaSlack } from 'react-icons/fa'

import Card from '../Card/Card'
import CardBody from '../Card/CardBody'
import CardHeader from '../Card/CardHeader'
import ConnectionCard from './ConnectionCard'
import JiraConfigModal from './JiraConfigModal'
import SlackConfigModal from './SlackConfigModal'
import TeamsConfigModal from './TeamsConfigModal'

const Connections = () => {
  const { data, refetch } = useQuery(GetConnections, {
    fetchPolicy: 'network-only'
  })

  const {
    isOpen: isJiraOpen,
    onOpen: onJiraOpen,
    onClose: onJiraClose
  } = useDisclosure()

  const {
    isOpen: isSlackOpen,
    onOpen: onSlackOpen,
    onClose: onSlackClose
  } = useDisclosure()

  const {
    isOpen: isTeamsOpen,
    onOpen: onTeamsOpen,
    onClose: onTeamsClose
  } = useDisclosure()

  const [greenCheck, setGreenCheck] = useState({
    jira: false,
    slack: false,
    teams: false
  })

  const [jiraData, setJiraData] = useState(null)
  const [slackData, setSlackData] = useState(null)
  const [teamsData, setTeamsData] = useState(null)

  useEffect(() => {
    setJiraData(null)
    setSlackData(null)
    setTeamsData(null)
    if (data?.organization?.connections?.nodes) {
      data.organization.connections.nodes.forEach((connection) => {
        if (connection.connection.__typename === 'JiraConnection') {
          setGreenCheck((prev) => ({ ...prev, jira: true }))
          setJiraData(connection)
        } else if (connection.connection.__typename === 'SlackConnection') {
          setGreenCheck((prev) => ({ ...prev, slack: true }))
          setSlackData(connection)
        } else if (connection.connection.__typename === 'TeamsConnection') {
          setGreenCheck((prev) => ({ ...prev, teams: true }))
          setTeamsData(connection)
        }
      })
    }
  }, [data])

  return (
    <>
      <Card p={0}>
        <CardHeader p='12px 0' mb='12px'>
          <Text fontSize='lg' fontWeight='bold'>
            Connected Accounts
          </Text>
        </CardHeader>
        <CardBody px='5px'>
          <Wrap spacing='30px'>
            <ConnectionCard
              icon={FaJira}
              name='Jira'
              onConfigure={onJiraOpen}
              isConnected={greenCheck.jira}
              color='#0070f3'
            />
            <ConnectionCard
              icon={FaSlack}
              name='Slack'
              onConfigure={onSlackOpen}
              isConnected={greenCheck.slack}
              color='#E01E5A'
            />
            <ConnectionCard
              icon={FaMicrosoft}
              name='Teams'
              onConfigure={onTeamsOpen}
              isConnected={greenCheck.teams}
              color='#6264A7'
            />
          </Wrap>
        </CardBody>
      </Card>

      {isJiraOpen && (
        <JiraConfigModal
          isOpen={isJiraOpen}
          onClose={onJiraClose}
          data={jiraData}
          setGreenCheck={setGreenCheck}
          refetch={refetch}
        />
      )}
      {isSlackOpen && (
        <SlackConfigModal
          isOpen={isSlackOpen}
          onClose={onSlackClose}
          data={slackData}
          setGreenCheck={setGreenCheck}
          refetch={refetch}
        />
      )}
      {isTeamsOpen && (
        <TeamsConfigModal
          isOpen={isTeamsOpen}
          onClose={onTeamsClose}
          data={teamsData}
          setGreenCheck={setGreenCheck}
          refetch={refetch}
        />
      )}
    </>
  )
}

export default Connections
