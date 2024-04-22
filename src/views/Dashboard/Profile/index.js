// Chakra imports
import { useQuery } from '@apollo/client'
import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { displayErrorMessage } from 'utils'
import OrgRegister from 'views/Dashboard/Profile/components/OrgRegister'

import { WarningTwoIcon } from '@chakra-ui/icons'
import {
  Flex,
  Grid,
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

import {
  AllOrganizations,
  GetOrg,
  GetOrgSettings,
  GetRoles,
  MyOrganizations
} from 'graphQL/Queries'
import { GetOrgManufacturers } from 'graphQL/Queries'

import { FaBuilding, FaUserCircle } from 'react-icons/fa'

import AdvisoryFeeds from './components/AdvisoryFeeds'
import ApiFeed from './components/ApiFeed'
import ComponentFeed from './components/ComponentFeed'
import ExploitFeeds from './components/ExploitFeeds'
import GeneralFeed from './components/GeneralFeed'
import Header from './components/Header'
import PersonalInfo from './components/PersonalInfo'
import TokenInfo from './components/TokenInfo'

function Profile() {
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const activetab = queryParams.get('tab')
  const org = localStorage.getItem('organization')
  const { totalRows, userPermissions } = useGlobalState()

  const tabs = [
    { name: 'PERSONAL', icon: FaUserCircle },
    { name: 'ORGANIZATION', icon: FaBuilding }
  ]
  const viewOrg = userPermissions?.find(
    (item) => item.key === 'view_organization'
  )
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

  const [tabIndex, setTabIndex] = useState(0)
  const [psIndex, setPsIndex] = useState(0)
  const [selectedTab, setSelectedTab] = useState(tabs[1].name)

  const {
    data: orgInfo,
    refetch,
    error
  } = useQuery(GetOrg, { skip: !org || org === 'undefined' ? true : false })

  const isAdmin = orgInfo && orgInfo?.organization?.currentUser?.superAdmin

  const { data: orgs, refetch: myOrgRefetch } = useQuery(MyOrganizations, {
    skip: org === 'undefined' ? true : isAdmin === true ? true : false,
    variables: { invitationStatuses: ['ACCEPTED', 'INVITED'] }
  })
  const { data: allOrgs, refetch: allOrgRefetch } = useQuery(AllOrganizations, {
    skip: org === 'undefined' ? true : isAdmin === true ? false : true,
    variables: { first: totalRows, status: 'approved' }
  })
  const { data: roles, refetch: roleRefetch } = useQuery(GetRoles, {
    skip: org === 'undefined' ? true : tabIndex === 2 ? false : true
  })
  const { data: mfc, refetch: mfcRefetch } = useQuery(GetOrgManufacturers, {
    skip: org === 'undefined' ? true : tabIndex === 6 ? false : true,
    fetchPolicy: 'network-only'
  })
  const { data: settingsData, refetch: settingsRefetch } = useQuery(
    GetOrgSettings,
    {
      skip: !org || org === 'undefined' ? true : false
    }
  )

  const onTabChange = (value) => setTabIndex(value)
  const handleChange = (value) => setPsIndex(value)

  useEffect(() => {
    if (activetab === 'person') {
      setSelectedTab('PERSONAL')
      setPsIndex(0)
    } else if (activetab === 'organization') {
      setSelectedTab('PERSONAL')
      setPsIndex(1)
    } else if (activetab === 'token') {
      setSelectedTab('PERSONAL')
      setPsIndex(2)
    } else if (activetab === 'general') {
      setSelectedTab('ORGANIZATION')
      setTabIndex(0)
    } else if (activetab === 'team') {
      setSelectedTab('ORGANIZATION')
      setTabIndex(1)
    } else if (activetab === 'roles') {
      setSelectedTab('ORGANIZATION')
      setTabIndex(2)
    } else if (activetab === 'feeds') {
      setSelectedTab('ORGANIZATION')
      setTabIndex(3)
    } else if (activetab === 'checks') {
      setSelectedTab('ORGANIZATION')
      setTabIndex(4)
    } else if (activetab === 'lists') {
      setSelectedTab('ORGANIZATION')
      setTabIndex(5)
    }
  }, [activetab, isAdmin])

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
    <Flex
      flexDirection={'column'}
      pr={2}
      pl={5}
      pt={{ base: '120px', md: '75px' }}
    >
      {/*  HEADER */}
      <Header
        org={orgInfo?.organization}
        user={orgInfo?.organization?.currentUser}
        selectedTab={selectedTab}
        refetch={refetch}
        setSelectedTab={setSelectedTab}
        setTabIndex={setTabIndex}
        setPsIndex={setPsIndex}
        tabs={tabs}
      />
      {/*  ORGANIZATION */}
      {selectedTab === 'ORGANIZATION' && (
        <Card>
          <Tabs
            variant='enclosed'
            w={'100%'}
            bg={'white'}
            defaultIndex={tabIndex}
            onChange={(e) => onTabChange(e)}
          >
            <TabList>
              {[
                'General',
                'Users',
                'Roles',
                'Feeds',
                'Checks',
                'Lists',
                'Legal'
              ].map((item, index) => (
                <Tab
                  key={index}
                  _focus={{ outline: 'none' }}
                  display={
                    (item === 'Lists' && !manageListing) ||
                    (item === 'Feeds' && !manageFeeds) ||
                    (item === 'Users' && !viewUsers?.value)
                      ? 'none'
                      : 'block'
                  }
                >
                  {item}
                </Tab>
              ))}
            </TabList>
            <TabPanels>
              {/* GEENRAL */}
              <TabPanel>
                <Grid
                  width={'100%'}
                  templateColumns={{ sm: '1fr', xl: 'repeat(2, 1fr)' }}
                  gap='22px'
                >
                  <GeneralFeed orgInfo={orgInfo} refetch={refetch} />
                </Grid>
              </TabPanel>
              {/* TEAMS */}
              <TabPanel>
                {orgInfo && (
                  <TeamTable
                    data={orgInfo?.organization || null}
                    refetch={refetch}
                  />
                )}
              </TabPanel>
              {/* ROLES */}
              <TabPanel>
                <RoleTable
                  tabIndex={tabIndex}
                  data={roles?.organization?.organizationRoles}
                  role={orgInfo?.organization?.currentUser?.role?.name}
                  refetch={roleRefetch}
                />
              </TabPanel>
              {/* FEEDS */}
              <TabPanel display={manageFeeds ? 'block' : 'none'}>
                {settingsData && (
                  <Grid
                    width={'100%'}
                    templateColumns={{ sm: '1fr', xl: 'repeat(3, 1fr)' }}
                    gap='22px'
                  >
                    <AdvisoryFeeds
                      data={settingsData}
                      refetch={settingsRefetch}
                    />
                    <ExploitFeeds
                      data={settingsData}
                      refetch={settingsRefetch}
                    />
                  </Grid>
                )}
              </TabPanel>
              {/* RULES */}
              <TabPanel>
                <ApiFeed />
              </TabPanel>
              {/* LISTS */}
              <TabPanel>
                <Grid
                  width={'100%'}
                  templateColumns={{ sm: '1fr', xl: 'repeat(3, 1fr)' }}
                  gap='22px'
                >
                  <ComponentFeed
                    data={orgInfo?.organization?.organizationComponents}
                    refetch={refetch}
                  />
                </Grid>
              </TabPanel>
              {/* LEGAL */}
              <TabPanel>
                <LegalTable
                  data={mfc?.organizationManufacturers}
                  refetch={mfcRefetch}
                />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Card>
      )}

      {/* PERSONAL  */}
      {selectedTab === 'PERSONAL' && (
        <Card>
          <Tabs
            variant='enclosed'
            w={'100%'}
            bg={'white'}
            index={psIndex}
            onChange={handleChange}
          >
            <TabList>
              {[
                'Personal Details',
                'Organizations',
                'Security Tokens',
                'Notifications'
              ].map((item, index) => (
                <Tab
                  key={index}
                  _focus={{ outline: 'none' }}
                  isDisabled={
                    orgInfo?.organization === null &&
                    (item === 'Personal Details' || item === 'Security Tokens')
                  }
                >
                  {item}
                </Tab>
              ))}
            </TabList>
            <TabPanels>
              {/* PERSONA DETAILS */}
              <TabPanel display={orgInfo?.organization ? 'block' : 'none'}>
                <PersonalInfo
                  user={orgInfo?.organization?.currentUser || null}
                  refetch={refetch}
                />
              </TabPanel>
              {/* ORG DETAILS */}
              <TabPanel>
                {isAdmin === true ? (
                  <OrgTable
                    data={allOrgs?.allOrganizations?.nodes || []}
                    refetch={allOrgRefetch}
                    isAdmin={isAdmin}
                    activeOrg={orgInfo?.organization?.id || null}
                  />
                ) : (
                  <OrgTable
                    data={orgs?.myOrganizations?.nodes || []}
                    refetch={myOrgRefetch}
                    isAdmin={isAdmin}
                    activeOrg={orgInfo?.organization?.id || null}
                  />
                )}
              </TabPanel>
              {/* SECURITY TOKEN */}
              <TabPanel display={orgInfo?.organization ? 'block' : 'none'}>
                <TokenInfo
                  data={orgInfo?.organization?.currentUser?.apiKeys || []}
                  refetch={refetch}
                />
              </TabPanel>

              {/* Notification Preferences */}
              <TabPanel>
                <NotificationChannels />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Card>
      )}
    </Flex>
  )
}

export default Profile
