// Chakra imports
import {
  Flex,
  Grid,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  useColorModeValue
} from '@chakra-ui/react'
import { FaSlackHash, FaUserCircle, FaBuilding } from 'react-icons/fa'
import Header from './components/Header'
import { useEffect, useState } from 'react'
import AdvisoryFeeds from './components/AdvisoryFeeds'
import ExploitFeeds from './components/ExploitFeeds'
import { useQuery } from '@apollo/client'
import ApiFeed from './components/ApiFeed'
import Card from 'components/Card/Card'
import ComponentFeed from './components/ComponentFeed'
import GeneralFeed from './components/GeneralFeed'
import TeamsLog from './components/TeamsLog'
import PersonalInfo from './components/PersonalInfo'
import { useLocation } from 'react-router-dom'
import { GetOrg } from 'graphQL/Queries'
import TokenInfo from './components/TokenInfo'

function Profile() {
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const activetab = queryParams.get('tab')

  const bgProfile = useColorModeValue(
    'hsla(0,0%,100%,.8)',
    'linear-gradient(112.83deg, rgba(255, 255, 255, 0.21) 0%, rgba(255, 255, 255, 0) 110.84%)'
  )

  const tabs = [
    {
      name: 'PERSONAL',
      icon: FaUserCircle
    },
    {
      name: 'ORGANIZATION',
      icon: FaBuilding
    }
    // {
    //   name: 'NOTIFICATIONS',
    //   icon: FaSlackHash
    // }
  ]

  const tab = window.localStorage.getItem('activeSetTab')

  const [tabIndex, setTabIndex] = useState(Number(tab))
  const [selectedTab, setSelectedTab] = useState(tabs[1].name)

  const onTabChange = (value) => {
    setTabIndex(value)
    window.localStorage.setItem('activeSetTab', value)
  }

  useEffect(() => {
    if (activetab === 'person') {
      setSelectedTab('PERSONAL')
    }
  }, [activetab])

  const { data: orgInfo, refetch, error } = useQuery(GetOrg)

  return (
    <>
      {orgInfo && (
        <Flex direction='column' px={4}>
          {/*  HEADER */}
          <Header
            // backgroundHeader={ProfileBgImage}
            backgroundProfile={bgProfile}
            user={orgInfo.organization.currentUser}
            selectedTab={selectedTab}
            setSelectedTab={setSelectedTab}
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
                  <Tab _focus={{ outline: 'none' }}>General</Tab>
                  <Tab _focus={{ outline: 'none' }}>Team</Tab>
                  <Tab _focus={{ outline: 'none' }}>Feeds</Tab>
                  <Tab _focus={{ outline: 'none' }}>Checks</Tab>
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
                    <TeamsLog
                      data={orgInfo.organization}
                      refetch={refetch}
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
                      <ComponentFeed />
                    </Grid>
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </Card>
          )}

          {/* PERSONAL  */}
          {selectedTab === 'PERSONAL' && (
            <Card>
              <Tabs variant='enclosed' w={'100%'} bg={'white'}>
                <TabList>
                  <Tab _focus={{ outline: 'none' }}>Personal Details</Tab>
                  <Tab _focus={{ outline: 'none' }}>Security Tokens</Tab>
                </TabList>
                <TabPanels>
                  {/* PERSONA DETAILS */}
                  <TabPanel>
                    <PersonalInfo
                      user={orgInfo.organization.currentUser}
                      refetch={refetch}
                    />
                  </TabPanel>
                  {/* SECURITY TOKEN */}
                  <TabPanel>
                    <TokenInfo
                      data={orgInfo.organization.currentUser.apiKeys}
                      refetch={refetch}
                    />
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </Card>
          )}
        </Flex>
      )}
    </>
  )
}

export default Profile
