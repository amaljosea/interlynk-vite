// Chakra imports
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
import { FaUserCircle, FaBuilding } from 'react-icons/fa'
import Header from './components/Header'
import { useEffect, useState } from 'react'
import AdvisoryFeeds from './components/AdvisoryFeeds'
import ExploitFeeds from './components/ExploitFeeds'
import { useLazyQuery, useQuery } from '@apollo/client'
import ApiFeed from './components/ApiFeed'
import Card from 'components/Card/Card'
import ComponentFeed from './components/ComponentFeed'
import GeneralFeed from './components/GeneralFeed'
import PersonalInfo from './components/PersonalInfo'
import { useLocation, useNavigate } from 'react-router-dom'
import { GetOrg } from 'graphQL/Queries'
import TokenInfo from './components/TokenInfo'
import TeamTable from 'components/Tables/TeamTable'
import { MyOrganizations } from 'graphQL/Queries'
import OrgTable from 'components/Tables/OrgTable'
import { displayErrorMessage } from 'utils'
import { WarningTwoIcon } from '@chakra-ui/icons'
import { GetRoles } from 'graphQL/Queries'
import RoleTable from 'components/Tables/RoleTable'
import { AllOrganizations } from 'graphQL/Queries'
import CustomLoader from 'components/CustomLoader'
import { useGlobalState } from 'hooks/useGlobalState'

function Profile() {
  const location = useLocation()
  const navigate = useNavigate()
  const queryParams = new URLSearchParams(location.search)
  const activetab = queryParams.get('tab')
  const { totalRows } = useGlobalState()

  const tabs = [
    {
      name: 'PERSONAL',
      icon: FaUserCircle
    },
    {
      name: 'ORGANIZATION',
      icon: FaBuilding
    }
  ]

  const [tabIndex, setTabIndex] = useState(0)
  const [psIndex, setPsIndex] = useState(0)
  const [selectedTab, setSelectedTab] = useState(tabs[1].name)

  const isAdmin = orgInfo?.organization?.currentUser?.superAdmin

  const { data: orgInfo, refetch, error } = useQuery(GetOrg)

  const { data: orgs, refetch: myOrgRefetch } = useQuery(MyOrganizations, {
    variables: { invitationStatuses: ['ACCEPTED', 'INVITED'] }
  })
  const { data: allOrgs, refetch: allOrgRefetch } = useQuery(AllOrganizations, {
    skip: !isAdmin,
    variables: { first: totalRows, status: 'approved' }
  })

  const { data: roles, refetch: roleRefetch } = useQuery(GetRoles, {
    skip: tabIndex === 2 ? false : true
  })

  const onTabChange = (value) => {
    setTabIndex(value)
    if (value === 0) {
      navigate('/vendor/settings?tab=general')
    } else if (value === 1) {
      navigate('/vendor/settings?tab=team')
    } else if (value === 2) {
      navigate('/vendor/settings?tab=roles')
    } else if (value === 3) {
      navigate('/vendor/settings?tab=feeds')
    } else if (value === 4) {
      navigate('/vendor/settings?tab=checks')
    } else if (value === 5) {
      navigate('/vendor/settings?tab=lists')
    }
  }

  const handleChange = (value) => {
    setPsIndex(value)
    if (value === 0) {
      navigate('/vendor/settings?tab=person')
    } else if (value === 1) {
      navigate('/vendor/settings?tab=organization')
    } else if (value === 2) {
      navigate('/vendor/settings?tab=token')
    }
  }

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

  return (
    <>
      {orgInfo ? (
        <Flex
          direction='column'
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
                    'Lists'
                  ].map((item, index) => (
                    <Tab key={index} _focus={{ outline: 'none' }}>
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
                      data={roles?.organization?.organizationRoles}
                      refetch={roleRefetch}
                    />
                  </TabPanel>
                  {/* FEEDS */}
                  <TabPanel>
                    <Grid
                      width={'100%'}
                      templateColumns={{ sm: '1fr', xl: 'repeat(3, 1fr)' }}
                      gap='22px'
                    >
                      <AdvisoryFeeds />
                      <ExploitFeeds />
                    </Grid>
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
                  {['Personal Details', 'Organizations', 'Security Tokens'].map(
                    (item, index) => (
                      <Tab
                        key={index}
                        _focus={{ outline: 'none' }}
                        display={
                          !orgInfo?.organization && item !== 'Organizations'
                            ? 'none'
                            : 'block'
                        }
                      >
                        {item}
                      </Tab>
                    )
                  )}
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
                    {isAdmin ? (
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
                </TabPanels>
              </Tabs>
            </Card>
          )}
        </Flex>
      ) : (
        <Flex pr={2} pl={5} pt={{ base: '120px', md: '75px' }}>
          <Card>
            <CustomLoader />
          </Card>
        </Flex>
      )}
    </>
  )
}

export default Profile
