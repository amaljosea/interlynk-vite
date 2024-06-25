import { gql, useQuery } from '@apollo/client'
import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { displayErrorMessage } from 'utils'
import OrgRegister from 'views/Dashboard/Profile/components/OrgRegister'

import { WarningTwoIcon } from '@chakra-ui/icons'
import {
  Flex,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text
} from '@chakra-ui/react'

import Card from 'components/Card/Card'
import NotificationChannels from 'components/Notifications/NotificationChannels'
import LegalTable from 'components/Tables/LegalTable'
import OrgTable from 'components/Tables/OrgTable'
import RoleTable from 'components/Tables/RoleTable'
import TeamTable from 'components/Tables/TeamTable'

import { useGlobalState } from 'hooks/useGlobalState'

import { AllOrganizations, MyOrganizations } from 'graphQL/Queries'

import { FaBuilding, FaUserCircle } from 'react-icons/fa'

import Connections from '../../../components/Connections/Connections'
import Checks from './components/Checks'
import Feeds from './components/Feeds'
import GeneralFeed from './components/GeneralFeed'
import Header from './components/Header'
import { InternalComponents } from './components/InternalComponents'
import PersonalInfo from './components/PersonalInfo'
import TokenInfo from './components/TokenInfo'

const GetOrganization = gql`
  query GetOrganization {
    organization {
      id
      currentUser {
        superAdmin
      }
    }
  }
`

const orgTabs = [
  'general',
  'users',
  'roles',
  'feeds',
  'checks',
  'lists',
  'legal',
  'connections'
]

const psTabs = [
  'personal-details',
  'organizations',
  'security-tokens',
  'notifications'
]

function Profile() {
  const navigate = useNavigate()
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const activetab = queryParams.get('tab')
  const org = localStorage.getItem('organization')
  const { totalRows, userPermissions } = useGlobalState()

  const [orgIndex, setOrgIndex] = useState(0)
  const [psIndex, setPsIndex] = useState(0)

  useEffect(() => {
    if (activetab) {
      if (orgTabs?.includes(activetab)) {
        setOrgIndex(Math.max(orgTabs.indexOf(activetab), 0))
      } else {
        setPsIndex(Math.max(psTabs.indexOf(activetab), 0))
      }
    }
  }, [activetab])

  const tabs = useMemo(() => {
    return [
      { name: 'PERSONAL', icon: FaUserCircle },
      { name: 'ORGANIZATION', icon: FaBuilding }
    ]
  }, [])

  const [selectedTab, setSelectedTab] = useState('')

  const viewUsers = userPermissions?.find((item) => item.key === 'view_users')
  const viewFeeds = userPermissions?.find((item) => item.key === 'view_feeds')
  const manageFeeds = viewFeeds?.supersededBy?.some(
    (permission) =>
      permission.key === 'manage_feeds' && permission.value === true
  )
  const manageListing = viewFeeds?.supersededBy?.some(
    (permission) =>
      permission.key === 'manage_listing' && permission.value === true
  )

  const { data, error } = useQuery(GetOrganization, {
    skip: !org || org === 'undefined' ? true : false
  })

  const { organization } = data || ''
  const { id, currentUser } = organization || ''

  const isAdmin = currentUser?.superAdmin

  const { data: myOrgs, refetch: myOrgRefetch } = useQuery(MyOrganizations, {
    skip: org === 'undefined' ? true : isAdmin === true ? true : false,
    variables: { invitationStatuses: ['ACCEPTED', 'INVITED'] }
  })
  const { nodes: myOrgList } = myOrgs?.myOrganizations || ''

  const { data: allOrgs, refetch: allOrgRefetch } = useQuery(AllOrganizations, {
    skip: org === 'undefined' ? true : isAdmin === true ? false : true,
    variables: { first: totalRows, status: 'approved' }
  })
  const { nodes: allOrgList } = allOrgs?.allOrganizations || ''

  const onOrgTabChange = (index) => {
    navigate(`/vendor/settings?tab=${orgTabs[index]}`)
  }

  const onPsTabChange = (index) => {
    navigate(`/vendor/settings?tab=${psTabs[index]}`)
  }

  const getDisplay = (item) => {
    const conditions = {
      Lists: !manageListing,
      Feeds: !manageFeeds,
      Users: !viewUsers?.value
    }
    return conditions[item] ? 'none' : 'block'
  }

  useEffect(() => {
    const isOrgActive = orgTabs?.includes(activetab)
    if (isOrgActive) {
      setSelectedTab(tabs[1].name)
    } else {
      setSelectedTab(tabs[0].name)
    }
  }, [activetab, tabs])

  if (error) {
    return (
      <Flex my={32} alignItems={'center'} justifyContent={'center'} gap={2}>
        <WarningTwoIcon color='blue.500' />
        <Text textAlign={'center'} fontSize={14}>
          {displayErrorMessage(error.networkError?.statusCode, error.message)}
        </Text>
      </Flex>
    )
  }

  if (!org || org === 'undefined') {
    return (
      <Flex direction='column' pr={2} pl={5} pt={{ base: '120px', md: '75px' }}>
        <OrgRegister />
      </Flex>
    )
  }

  return (
    <>
      {/*  HEADER */}
      <Header
        tabs={tabs}
        selectedTab={selectedTab}
        setSelectedTab={setSelectedTab}
      />

      {/*  ORGANIZATION */}
      {selectedTab === 'ORGANIZATION' && (
        <Card>
          <Tabs
            w={'100%'}
            index={orgIndex}
            variant='enclosed'
            onChange={onOrgTabChange}
          >
            <TabList>
              {orgTabs.map((item, index) => (
                <Tab
                  key={index}
                  display={getDisplay(item)}
                  textTransform={'capitalize'}
                  _focus={{ outline: 'none' }}
                >
                  {item}
                </Tab>
              ))}
            </TabList>
            <TabPanels>
              {/* GEENRAL */}
              <TabPanel>
                <GeneralFeed />
              </TabPanel>
              {/* TEAMS */}
              <TabPanel display={data ? 'block' : 'none'}>
                <TeamTable />
              </TabPanel>
              {/* ROLES */}
              <TabPanel>
                <RoleTable />
              </TabPanel>
              {/* FEEDS */}
              <TabPanel display={manageFeeds ? 'block' : 'none'}>
                <Feeds />
              </TabPanel>
              {/* RULES */}
              <TabPanel>
                <Checks />
              </TabPanel>
              {/* LISTS */}
              <TabPanel>
                <InternalComponents />
              </TabPanel>
              {/* LEGAL */}
              <TabPanel>
                <LegalTable />
              </TabPanel>
              <TabPanel>
                <Connections />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Card>
      )}

      {/* PERSONAL  */}
      {selectedTab === 'PERSONAL' && (
        <Card>
          <Tabs
            w={'100%'}
            index={psIndex}
            variant='enclosed'
            onChange={onPsTabChange}
          >
            <TabList>
              {psTabs.map((item, index) => (
                <Tab
                  key={index}
                  textTransform={'capitalize'}
                  _focus={{ outline: 'none' }}
                  isDisabled={
                    organization === null &&
                    (item === 'Personal Details' || item === 'Security Tokens')
                  }
                >
                  {item?.replace(/-/g, ' ')}
                </Tab>
              ))}
            </TabList>
            <TabPanels>
              {/* PERSONA DETAILS */}
              <TabPanel display={organization ? 'block' : 'none'}>
                <PersonalInfo />
              </TabPanel>
              {/* ORG DETAILS */}
              <TabPanel>
                <OrgTable
                  isAdmin={isAdmin}
                  activeOrg={id || null}
                  data={isAdmin ? allOrgList : myOrgList}
                  refetch={isAdmin ? allOrgRefetch : myOrgRefetch}
                />
              </TabPanel>
              {/* SECURITY TOKEN */}
              <TabPanel display={organization ? 'block' : 'none'}>
                <TokenInfo />
              </TabPanel>
              {/* Notification Preferences */}
              <TabPanel>
                <NotificationChannels />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Card>
      )}
    </>
  )
}

export default Profile
