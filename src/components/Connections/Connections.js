import { useQuery } from '@apollo/client'
import { useEffect, useState } from 'react'

import { Flex, Text, useDisclosure } from '@chakra-ui/react'

import useGithubConfigSaved from 'hooks/useGithubConfigSaved'
import { useGlobalQueryContext } from 'hooks/useGlobalQueryContext'
import { useHasPermission } from 'hooks/useHasPermission'
import useQueryParam from 'hooks/useQueryParam'
import { useShouldShowDemoFeatures } from 'hooks/useShouldShowDemoFeatures'
import { useThemeColor } from 'hooks/useThemeColors'

import { GetOrgConnections, GetPersonalConnections } from 'graphQL/Queries'

import { FaGithub } from 'react-icons/fa'

import jiraPng from '../../assets/img/Jira.png'
import mailPng from '../../assets/img/Mail.png'
import slackPng from '../../assets/img/Slack.png'
import teamsPng from '../../assets/img/Teams.png'
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
  const isGithubConfigSaved = useGithubConfigSaved()
  const { orgView, isFreeTier } = useGlobalQueryContext()
  const { shouldShowDemoFeatures } = useShouldShowDemoFeatures()
  const { primaryTextColor } = useThemeColor(['primaryTextColor'])

  const updateCon = useHasPermission({
    parentKey: 'view_connections',
    childKey: 'create_update_connection'
  })

  const isIntegration =
    activetab === 'integrations' || activetab === 'integrations-org'
  const { data } = useQuery(org ? GetOrgConnections : GetPersonalConnections, {
    skip: !orgView ? true : isIntegration ? false : true
  })

  const JIRA = useDisclosure()
  const SLACK = useDisclosure()
  const TEAM = useDisclosure()
  const EMAIL = useDisclosure()
  const GITHUB = useDisclosure()

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
  }, [data, org])

  useEffect(() => {
    if (isGithubConfigSaved) {
      setGreenCheck((prev) => ({ ...prev, github: true }))
    }
  }, [isGithubConfigSaved])

  return (
    <>
      <Card p={0} boxShadow='none'>
        <CardHeader mb={'16px'} display={'flex'} flexDirection={'column'}>
          <Text fontSize='lg' color={primaryTextColor} fontWeight='bold'>
            Connect Apps
          </Text>
          <Text fontSize={'sm'}>
            Integrate with your favorite tools to streamline SBOM management.
          </Text>
        </CardHeader>
        <CardBody>
          <Flex wrap='wrap' gap={'20px'}>
            {org && !isFreeTier && (
              <ConnectionCard
                iconSrc={jiraPng}
                name='Jira'
                onConfigure={JIRA.onOpen}
                isConnected={greenCheck.jira}
                description={
                  'Sync tasks within SBOM compliance, improving issue tracking and management.'
                }
              />
            )}
            {!isFreeTier && (
              <ConnectionCard
                iconSrc={slackPng}
                name='Slack'
                onConfigure={SLACK.onOpen}
                isConnected={greenCheck.slack}
                description={
                  'Get instant SBOM updates in Slack, ensuring real-time compliance monitoring.'
                }
              />
            )}
            {!isFreeTier && (
              <ConnectionCard
                iconSrc={teamsPng}
                name='Teams'
                onConfigure={TEAM.onOpen}
                isConnected={greenCheck.teams}
                description={
                  'Track SBOM changes in Teams, boosting collaboration and compliance efficiency'
                }
              />
            )}
            <ConnectionCard
              iconSrc={mailPng}
              name='Email'
              onConfigure={EMAIL.onOpen}
              isConnected={greenCheck.email}
              description={
                'Receive immediate SBOM alerts via email, staying informed on critical updates.'
              }
            />
            {org && shouldShowDemoFeatures && (
              <ConnectionCard
                icon={FaGithub}
                name='Github'
                onConfigure={GITHUB.onOpen}
                isConnected={greenCheck.github}
                isDisabled={!updateCon}
                color={primaryTextColor}
                description={
                  'Monitor SBOM directly in GitHub, simplifying compliance checks within repositories'
                }
              />
            )}
          </Flex>
        </CardBody>
      </Card>

      {JIRA.isOpen && (
        <JiraConfigModal
          org={org}
          data={jiraData}
          isOpen={JIRA.isOpen}
          onClose={JIRA.onClose}
          updateCon={updateCon}
          setGreenCheck={setGreenCheck}
        />
      )}

      {SLACK.isOpen && (
        <SlackConfigModal
          org={org}
          data={slackData}
          isOpen={SLACK.isOpen}
          updateCon={updateCon}
          onClose={SLACK.onClose}
          setGreenCheck={setGreenCheck}
          hostId={hostId}
        />
      )}

      {TEAM.isOpen && (
        <TeamsConfigModal
          org={org}
          data={teamsData}
          isOpen={TEAM.isOpen}
          updateCon={updateCon}
          onClose={TEAM.onClose}
          setGreenCheck={setGreenCheck}
          hostId={hostId}
        />
      )}

      {EMAIL.isOpen && (
        <EmailConfigModal
          org={org}
          data={emailData}
          isOpen={EMAIL.isOpen}
          updateCon={updateCon}
          onClose={EMAIL.onClose}
          setGreenCheck={setGreenCheck}
          hostId={hostId}
        />
      )}

      {GITHUB.isOpen && (
        <GithubConfigModal
          org={org}
          isOpen={GITHUB.isOpen}
          onClose={GITHUB.onClose}
          data={githubData}
          setGreenCheck={setGreenCheck}
        />
      )}
    </>
  )
}

export default Connections
