import { useQuery } from '@apollo/client'
import { useEffect, useState } from 'react'

import { Flex, Text, useColorMode, useDisclosure } from '@chakra-ui/react'

import CustomLoader from 'components/CustomLoader'

import useGithubConfigSaved from 'hooks/useGithubConfigSaved'
import { useGlobalQueryContext } from 'hooks/useGlobalQueryContext'
import { useHasPermission } from 'hooks/useHasPermission'
import useQueryParam from 'hooks/useQueryParam'
import { useShouldShowDemoFeatures } from 'hooks/useShouldShowDemoFeatures'
import { useThemeColor } from 'hooks/useThemeColors'

import { GetOrgConnections, GetPersonalConnections } from 'graphQL/Queries'

import bitbucketPng from '../../assets/img/BitBucket.png'
import jiraPng from '../../assets/img/Jira.png'
import mailPng from '../../assets/img/Mail.png'
import slackPng from '../../assets/img/Slack.png'
import teamsPng from '../../assets/img/Teams.png'
import githubBlackPng from '../../assets/img/github-black.png'
import githubWhitePng from '../../assets/img/github-white.png'
import linearDark from '../../assets/img/linear_dark.png'
import linearLight from '../../assets/img/linear_light.png'
import Card from '../Card/Card'
import CardBody from '../Card/CardBody'
import CardHeader from '../Card/CardHeader'
import BitbucketConfigModal from './BitbucketConfigModal'
import ConnectionCard from './ConnectionCard'
import EmailConfigModal from './EmailConfigModal'
import GithubConfigModal from './GithubConfigModal'
import JiraConfigModal from './JiraConfigModal'
import LinearConfigModal from './LinearConfigModal'
import SlackConfigModal from './SlackConfigModal'
import TeamsConfigModal from './TeamsConfigModal'

const Connections = ({ org }) => {
  const activetab = useQueryParam('tab')
  const { colorMode } = useColorMode()
  const isGithubConfigSaved = useGithubConfigSaved()
  const { orgView, isFreeTier } = useGlobalQueryContext()
  const { shouldShowDemoFeatures } = useShouldShowDemoFeatures()
  const { primaryTextColor, primaryBlueText } = useThemeColor([
    'primaryTextColor',
    'primaryBlueText'
  ])

  const updateCon = useHasPermission({
    parentKey: 'view_connections',
    childKey: 'edit_connections'
  })

  const isIntegration =
    activetab === 'integrations' || activetab === 'integrations-org'
  const { data, loading } = useQuery(
    org ? GetOrgConnections : GetPersonalConnections,
    {
      skip: !orgView ? true : isIntegration ? false : true
    }
  )

  const JIRA = useDisclosure()
  const SLACK = useDisclosure()
  const TEAM = useDisclosure()
  const EMAIL = useDisclosure()
  const GITHUB = useDisclosure()
  const LINEAR = useDisclosure()
  const BITBUCKET = useDisclosure()

  const [greenCheck, setGreenCheck] = useState({
    jira: false,
    slack: false,
    teams: false,
    github: false,
    bitbucket: false,
    linear: false
  })

  const [hostId, setHostId] = useState(null)
  const [jiraData, setJiraData] = useState(null)
  const [slackData, setSlackData] = useState([])
  const [teamsData, setTeamsData] = useState([])
  const [emailData, setEmailData] = useState([])
  const [linearData, setLinearData] = useState(null)
  const [githubData, setGithubData] = useState(null)
  const [bitbucketData, setBitbucketData] = useState(null)

  const handleConnectionData = (connections) => {
    connections.forEach((connection) => {
      switch (connection.connection.__typename) {
        case 'JiraConnection':
          setGreenCheck((prev) => ({ ...prev, jira: true }))
          setJiraData(connection)
          break
        case 'LinearConnection':
          setGreenCheck((prev) => ({ ...prev, linear: true }))
          setLinearData(connection)
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
        case 'BitbucketConnection':
          setGreenCheck((prev) => ({ ...prev, bitbucket: true }))
          setBitbucketData(connection)
          break
        default:
          break
      }
    })
  }

  const getDescription = (type) => {
    switch (type) {
      case 'Jira':
        return 'Jira integration allows easy creation of vulnerability, license or component issues on connected Jira boards.'
      case 'Linear':
        return 'Linear streamline issues, projects, and product roadmaps.'
      case 'Slack':
        return 'Slack integration supports delivering Interlynk notifications in configured Slack Channel.'
      case 'Teams':
        return 'Microsoft Teams integration supports delivering Interlynk notifications in configured Teams Channel.'
      case 'Email':
        return 'Email aliases can be configured to deliver all notifications at organizational level or subscribed notifications at personal level.'
      case 'Github':
        return 'Monitor SBOM directly in GitHub, simplifying compliance checks within repositories'
      case 'BitBucket':
        return 'Monitor SBOM directly in BitBucket, simplifying compliance checks within repositories'
      default:
        return ''
    }
  }

  useEffect(() => {
    setJiraData(null)
    setSlackData(null)
    setTeamsData(null)
    setEmailData(null)
    setGithubData(null)
    setLinearData(null)
    setBitbucketData(null)

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

  if (loading) return <CustomLoader />

  return (
    <>
      <Card p={0} boxShadow='none'>
        <CardHeader mb={'16px'} display={'flex'} flexDirection={'column'}>
          <Text fontSize='lg' color={primaryTextColor} fontWeight='bold'>
            Manage Integrations
          </Text>
          <Text fontSize={'sm'}>
            Manage integration with other applications to streamline workflows
            and notifications
          </Text>
        </CardHeader>
        <CardBody>
          <Flex wrap='wrap' gap={'20px'}>
            {org && !isFreeTier && (
              <ConnectionCard
                name='Bitbucket'
                iconSrc={bitbucketPng}
                color={primaryBlueText}
                onConfigure={BITBUCKET.onOpen}
                isConnected={greenCheck.bitbucket}
                description={getDescription('BitBucket')}
              />
            )}
            {org && !isFreeTier && (
              <ConnectionCard
                iconSrc={jiraPng}
                name='Jira'
                onConfigure={JIRA.onOpen}
                isConnected={greenCheck.jira}
                description={getDescription('Jira')}
              />
            )}
            {org && !isFreeTier && (
              <ConnectionCard
                name='Linear'
                onConfigure={LINEAR.onOpen}
                isConnected={greenCheck.linear}
                description={getDescription('Linear')}
                iconSrc={colorMode === 'light' ? linearDark : linearLight}
              />
            )}
            {!isFreeTier && (
              <ConnectionCard
                iconSrc={slackPng}
                name='Slack'
                onConfigure={SLACK.onOpen}
                isConnected={greenCheck.slack}
                description={getDescription('Slack')}
              />
            )}
            {!isFreeTier && (
              <ConnectionCard
                iconSrc={teamsPng}
                name='Teams'
                onConfigure={TEAM.onOpen}
                isConnected={greenCheck.teams}
                description={getDescription('Teams')}
              />
            )}
            <ConnectionCard
              iconSrc={mailPng}
              name='Email'
              onConfigure={EMAIL.onOpen}
              isConnected={greenCheck.email}
              description={getDescription('Email')}
            />
            {org && shouldShowDemoFeatures && (
              <ConnectionCard
                name='Github'
                onConfigure={GITHUB.onOpen}
                isConnected={greenCheck.github}
                isDisabled={!updateCon}
                color={primaryTextColor}
                description={getDescription('Github')}
                iconSrc={
                  colorMode === 'light' ? githubBlackPng : githubWhitePng
                }
              />
            )}
          </Flex>
        </CardBody>
      </Card>

      {BITBUCKET.isOpen && (
        <BitbucketConfigModal
          org={org}
          data={bitbucketData}
          updateCon={updateCon}
          isOpen={BITBUCKET.isOpen}
          onClose={BITBUCKET.onClose}
          setGreenCheck={setGreenCheck}
        />
      )}

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

      {LINEAR.isOpen && (
        <LinearConfigModal
          data={linearData}
          updateCon={updateCon}
          isOpen={LINEAR.isOpen}
          onClose={LINEAR.onClose}
          setGreenCheck={setGreenCheck}
        />
      )}

      {SLACK.isOpen && (
        <SlackConfigModal
          org={org}
          data={slackData}
          isOpen={SLACK.isOpen}
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
