import { useQuery } from '@apollo/client'
import { useEffect, useState } from 'react'

import { Text, Wrap, useColorModeValue, useDisclosure } from '@chakra-ui/react'

import useGithubConfigSaved from 'hooks/useGithubConfigSaved'
import { useGlobalQueryContext } from 'hooks/useGlobalQueryContext'
import { useHasPermission } from 'hooks/useHasPermission'
import useQueryParam from 'hooks/useQueryParam'
import { useShouldShowDemoFeatures } from 'hooks/useShouldShowDemoFeatures'

import { GetOrgConnections, GetPersonalConnections } from 'graphQL/Queries'

import {
  FaEnvelope,
  FaGithub,
  FaJira,
  FaMicrosoft,
  FaSlack
} from 'react-icons/fa'

import Card from '../Card/Card'
import CardBody from '../Card/CardBody'
import CardHeader from '../Card/CardHeader'
import ConnectionCard from './ConnectionCard'
import EmailConfigModal from './EmailConfigModal'
import GithubConfigModal from './GithubConfigModal'
import JiraConfigModal from './JiraConfigModal'
import SlackConfigModal from './SlackConfigModal'
import TeamsConfigModal from './TeamsConfigModal'

const Connections = ({ org }) => {
  const activetab = useQueryParam('tab')
  const { orgView, isFreeTier } = useGlobalQueryContext()
  const { data } = useQuery(org ? GetOrgConnections : GetPersonalConnections, {
    skip: !orgView
      ? true
      : activetab === 'integrations' || activetab === 'integrations-org'
        ? false
        : true
  })
  const isGithubConfigSaved = useGithubConfigSaved()

  const iconColor = useColorModeValue('#24292f', '#f1f1f1')

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

  const {
    isOpen: isEmailOpen,
    onOpen: onEmailOpen,
    onClose: onEmailClose
  } = useDisclosure()

  const {
    isOpen: isGithubOpen,
    onOpen: onGithubOpen,
    onClose: onGithubClose
  } = useDisclosure()

  const { shouldShowDemoFeatures } = useShouldShowDemoFeatures()

  const [greenCheck, setGreenCheck] = useState({
    jira: false,
    slack: false,
    teams: false,
    github: false
  })

  const [hostId, setHostId] = useState(null)

  const [jiraData, setJiraData] = useState(null)
  const [slackData, setSlackData] = useState([])
  const [teamsData, setTeamsData] = useState([])
  const [emailData, setEmailData] = useState([])
  const [githubData, setGithubData] = useState(null)

  const handleConnectionData = (connections) => {
    connections.forEach((connection) => {
      switch (connection.connection.__typename) {
        case 'JiraConnection':
          setGreenCheck((prev) => ({ ...prev, jira: true }))
          setJiraData(connection)
          break
        case 'SlackConnection':
          setGreenCheck((prev) => ({ ...prev, slack: true }))
          setSlackData((prev) => [...(prev || []), connection])
          break
        case 'TeamsConnection':
          setGreenCheck((prev) => ({ ...prev, teams: true }))
          setTeamsData((prev) => [...(prev || []), connection])
          break
        case 'EmailConnection':
          setGreenCheck((prev) => ({ ...prev, email: true }))
          setEmailData((prev) => [...(prev || []), connection])
          break
        case 'GithubConnection':
          setGreenCheck((prev) => ({ ...prev, github: true }))
          setGithubData(connection)
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
    setEmailData(null)
    setGithubData(null)

    const hostId = org ? data?.organization?.id : data?.organizationUser?.id
    setHostId(hostId)

    const nodes = org
      ? data?.organization?.connections?.nodes
      : data?.organizationUser?.connections?.nodes

    if (nodes) {
      handleConnectionData(nodes)
    }
  }, [data])

  useEffect(() => {
    if (isGithubConfigSaved) {
      setGreenCheck((prev) => ({ ...prev, github: true }))
    }
  }, [isGithubConfigSaved])

  return (
    <>
      <Card p={0}>
        <CardHeader p='12px 0' mb='12px'>
          <Text fontSize='lg' fontWeight='bold'>
            Integrations {org && '(Organization Level)'}
          </Text>
        </CardHeader>
        <CardBody px='5px'>
          <Wrap spacing={4}>
            {org && !isFreeTier && (
              <ConnectionCard
                icon={FaJira}
                name='Jira'
                onConfigure={onJiraOpen}
                isConnected={greenCheck.jira}
                color='#0070f3'
              />
            )}
            {!isFreeTier && (
              <ConnectionCard
                icon={FaSlack}
                name='Slack'
                onConfigure={onSlackOpen}
                isConnected={greenCheck.slack}
                color='#E01E5A'
              />
            )}

            {!isFreeTier && (
              <ConnectionCard
                icon={FaMicrosoft}
                name='Teams'
                onConfigure={onTeamsOpen}
                isConnected={greenCheck.teams}
                color='#6264A7'
              />
            )}

            <ConnectionCard
              icon={FaEnvelope}
              name='Email'
              onConfigure={onEmailOpen}
              isConnected={greenCheck.email}
              color='#FF4500'
            />
            {org && shouldShowDemoFeatures && (
              <ConnectionCard
                icon={FaGithub}
                name='Github'
                onConfigure={onGithubOpen}
                isConnected={greenCheck.github}
                isDisabled={!updateCon}
                color={iconColor}
              />
            )}
          </Wrap>
        </CardBody>
      </Card>

      {isJiraOpen && (
        <JiraConfigModal
          org={org}
          data={jiraData}
          isOpen={isJiraOpen}
          onClose={onJiraClose}
          updateCon={updateCon}
          setGreenCheck={setGreenCheck}
        />
      )}

      {isSlackOpen && (
        <SlackConfigModal
          org={org}
          data={slackData}
          isOpen={isSlackOpen}
          updateCon={updateCon}
          onClose={onSlackClose}
          setGreenCheck={setGreenCheck}
          hostId={hostId}
        />
      )}

      {isTeamsOpen && (
        <TeamsConfigModal
          org={org}
          data={teamsData}
          isOpen={isTeamsOpen}
          updateCon={updateCon}
          onClose={onTeamsClose}
          setGreenCheck={setGreenCheck}
          hostId={hostId}
        />
      )}

      {isEmailOpen && (
        <EmailConfigModal
          org={org}
          data={emailData}
          isOpen={isEmailOpen}
          updateCon={updateCon}
          onClose={onEmailClose}
          setGreenCheck={setGreenCheck}
          hostId={hostId}
        />
      )}

      {isGithubOpen && (
        <GithubConfigModal
          org={org}
          isOpen={isGithubOpen}
          onClose={onGithubClose}
          data={githubData}
          setGreenCheck={setGreenCheck}
        />
      )}
    </>
  )
}

export default Connections
