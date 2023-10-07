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
import { GetOrg } from 'graphQL/Queries'
import { Link } from 'react-router-dom'

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
  const [tabIndex, setTabIndex] = useState(0)

  const { data } = useQuery(GetSettings)

  useEffect(() => {
    if (tab === 'person') {
      setSelectedTab('PERSONAL')
    }
  }, [tab])

  const { data: orgInfo, refetch } = useQuery(GetOrg)

  const handleTabClick = (value) => {
    window.history.pushState(null, null, `/vendor/profiles?tab=${value}`)
  }

  useEffect(() => {
    if (tab === 'general') {
      setTabIndex(0)
    } else if (tab === 'team') {
      setTabIndex(1)
    } else if (tab === 'feeds') {
      setTabIndex(2)
    } else if (tab === 'checks') {
      setTabIndex(3)
    } else if (tab === 'lists') {
      setTabIndex(4)
    } else if (tab === null) {
      window.history.pushState(null, null, `/vendor/profiles?tab=general`)
    }
  }, [tabIndex, tab])

  return (
    <Flex direction='column' px={4}>
      {/*  HEADER */}
      <Header
        // backgroundHeader={ProfileBgImage}
        backgroundProfile={bgProfile}
        name={username ? username : 'Surendra Pathak'}
        email={email ? email : 'sp@interlynk.io'}
        selectedTab={selectedTab}
        setSelectedTab={setSelectedTab}
        tabs={tabs}
      />

      {/*  ORGANIZATION */}
      {selectedTab === 'ORGANIZATION' && orgInfo && (
        <Card>
          <Tabs
            variant='enclosed'
            w={'100%'}
            bg={'white'}
            defaultIndex={tabIndex}
          >
            <TabList>
              <Tab
                _focus={{ outline: 'none' }}
                onClick={() => handleTabClick('general')}
              >
                General
              </Tab>
              <Tab
                _focus={{ outline: 'none' }}
                onClick={() => handleTabClick('team')}
              >
                Team
              </Tab>
              <Tab
                _focus={{ outline: 'none' }}
                onClick={() => handleTabClick('feeds')}
              >
                Feeds
              </Tab>
              <Tab
                _focus={{ outline: 'none' }}
                onClick={() => handleTabClick('checks')}
              >
                Checks
              </Tab>
              <Tab
                _focus={{ outline: 'none' }}
                onClick={() => handleTabClick('list')}
              >
                Lists
              </Tab>
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
                <TeamsLog data={orgInfo.organization.users} />
              </TabPanel>
              {/* FEEDS */}
              <TabPanel>
                <Grid
                  width={'100%'}
                  templateColumns={{ sm: '1fr', xl: 'repeat(3, 1fr)' }}
                  gap='22px'
                >
                  <AdvisoryFeeds orgInfo={orgInfo} />
                  <ExploitFeeds orgInfo={orgInfo} />
                </Grid>
              </TabPanel>
              {/* RULES */}
              <TabPanel>
                <ApiFeed data={orgInfo.organization.organizationRules} />
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
      {selectedTab === 'PERSONAL' && orgInfo && (
        <Grid
          width={'100%'}
          templateColumns={{ sm: '1fr', xl: 'repeat(2, 1fr)' }}
          gap='22px'
        >
          <PersonalInfo
            userName={orgInfo.organization.name}
            userEmail={orgInfo.organization.email}
            refetch={refetch}
          />
        </Grid>
      )}
    </Flex>
  )
}

export default Profile
