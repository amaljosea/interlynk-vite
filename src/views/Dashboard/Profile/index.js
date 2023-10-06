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
import { GetSettings } from 'graphQL/Queries'
import { GetOrgInfo } from 'graphQL/Queries'
import ApiFeed from './components/ApiFeed'
import Card from 'components/Card/Card'
import ComponentFeed from './components/ComponentFeed'
import GeneralFeed from './components/GeneralFeed'
import TeamsLog from './components/TeamsLog'
import PersonalInfo from './components/PersonalInfo'
import { useLocation } from 'react-router-dom'

function Profile() {
  const location = useLocation()

  const queryParams = new URLSearchParams(location.search)

  const tab = queryParams.get('tab')

  const username = localStorage.getItem(`username`)
  const email = localStorage.getItem(`email`)

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

  const [selectedTab, setSelectedTab] = useState(tabs[1].name)

  const { data } = useQuery(GetSettings)

  useEffect(() => {
    if (tab === 'person') {
      setSelectedTab('PERSONAL')
    }
  }, [data])

  const { data: orgInfo } = useQuery(GetOrgInfo)

  return (
    <Flex direction='column' px={4}>
      <Header
        // backgroundHeader={ProfileBgImage}
        backgroundProfile={bgProfile}
        name={username ? username : 'Surendra Pathak'}
        email={email ? email : 'sp@interlynk.io'}
        selectedTab={selectedTab}
        setSelectedTab={setSelectedTab}
        tabs={tabs}
      />
      {data && (
        <>
          {selectedTab === 'ORGANIZATION' && orgInfo && (
            <Card>
              <Tabs variant='enclosed' w={'100%'} bg={'white'}>
                <TabList>
                  <Tab _focus={{ outline: 'none' }}>General</Tab>
                  <Tab _focus={{ outline: 'none' }}>Team</Tab>
                  <Tab _focus={{ outline: 'none' }}>Feeds</Tab>
                  <Tab _focus={{ outline: 'none' }}>Checks</Tab>
                  <Tab _focus={{ outline: 'none' }}>Lists</Tab>
                </TabList>
                <TabPanels>
                  {/* GEENRAL */}
                  <TabPanel>
                    <Grid
                      width={'100%'}
                      templateColumns={{ sm: '1fr', xl: 'repeat(2, 1fr)' }}
                      gap='22px'
                    >
                      <GeneralFeed orgInfo={orgInfo} />
                    </Grid>
                  </TabPanel>
                  {/* TEAMS */}
                  <TabPanel>
                    <TeamsLog />
                  </TabPanel>
                  {/* FEEDS */}
                  <TabPanel>
                    <Grid
                      width={'100%'}
                      templateColumns={{ sm: '1fr', xl: 'repeat(3, 1fr)' }}
                      gap='22px'
                    >
                      <AdvisoryFeeds data={data} orgInfo={orgInfo} />
                      <ExploitFeeds data={data} orgInfo={orgInfo} />
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

          {selectedTab === 'PERSONAL' && orgInfo && (
            <Grid
              width={'100%'}
              templateColumns={{ sm: '1fr', xl: 'repeat(2, 1fr)' }}
              gap='22px'
            >
              <PersonalInfo userName={username} userEmail={email} />
            </Grid>
          )}
        </>
      )}
    </Flex>
  )
}

export default Profile
