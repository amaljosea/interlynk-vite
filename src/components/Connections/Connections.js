import { useQuery } from '@apollo/client'
import { useEffect, useState } from 'react'

import { Text, Wrap, useDisclosure } from '@chakra-ui/react'

import ViewAlert from 'components/Misc/ViewAlert'

import { useGlobalState } from 'hooks/useGlobalState'
import { useHasPermission } from 'hooks/useHasPermission'
import useQueryParam from 'hooks/useQueryParam'

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
  const activetab = useQueryParam('tab')
  const org = localStorage.getItem('organization')
  const { data, refetch } = useQuery(GetConnections, {
    skip:
      org === 'undefined' ? true : activetab === 'connections' ? false : true
  })

  const con = useHasPermission({
    parentKey: 'view_connections'
  })
  const updateCon = useHasPermission({
    parentKey: 'view_connections',
    childKey: 'create_update_connection'
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

  const handleConnectionData = (connections) => {
    connections.forEach((connection) => {
      switch (connection.connection.__typename) {
        case 'JiraConnection':
          setGreenCheck((prev) => ({ ...prev, jira: true }))
          setJiraData(connection)
          break
        case 'SlackConnection':
          setGreenCheck((prev) => ({ ...prev, slack: true }))
          setSlackData(connection)
          break
        case 'TeamsConnection':
          setGreenCheck((prev) => ({ ...prev, teams: true }))
          setTeamsData(connection)
          break
        default:
          break
      }
    })
  }

  useEffect(() => {
    setJiraData(null)
    setSlackData(null)
    setTeamsData(null)
    if (data?.organization?.connections?.nodes) {
      handleConnectionData(data.organization.connections.nodes)
    }
  }, [data])

  if (con === false) {
    return <ViewAlert category='connections' />
  }

  return (
    <>
      <Card p={4}>
        <CardHeader p='12px 0' mb='12px'>
          <Text fontSize='xl' fontWeight='bold'>
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
          data={jiraData}
          refetch={refetch}
          isOpen={isJiraOpen}
          onClose={onJiraClose}
          updateCon={updateCon}
          setGreenCheck={setGreenCheck}
        />
      )}
      {isSlackOpen && (
        <SlackConfigModal
          data={slackData}
          refetch={refetch}
          isOpen={isSlackOpen}
          updateCon={updateCon}
          onClose={onSlackClose}
          setGreenCheck={setGreenCheck}
        />
      )}
      {isTeamsOpen && (
        <TeamsConfigModal
          data={teamsData}
          refetch={refetch}
          isOpen={isTeamsOpen}
          updateCon={updateCon}
          onClose={onTeamsClose}
          setGreenCheck={setGreenCheck}
        />
      )}
    </>
  )
}

export default Connections
