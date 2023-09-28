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
import { useState } from 'react'
import AdvisoryFeeds from './components/AdvisoryFeeds'
import ExploitFeeds from './components/ExploitFeeds'
import { useQuery } from '@apollo/client'
import { GetSettings } from 'graphQL/Queries'
import { GetOrgInfo } from 'graphQL/Queries'
import GeneralFeed from './components/GeneralFeed'
import ApiFeed from './components/ApiFeed'

function Profile() {
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
    },
    {
      name: 'NOTIFICATIONS',
      icon: FaSlackHash
    }
  ]

  const [selectedTab, setSelectedTab] = useState(tabs[1].name)

  const { data } = useQuery(GetSettings)

  // useEffect(() => {
  //   if (data) {
  //     console.log(`allSetting`, data)
  //   }
  // }, [data])

  const { data: orgInfo } = useQuery(GetOrgInfo)

  // useEffect(() => {
  //   if (orgInfo) {
  //     console.log(`orgInfo`, orgInfo)
  //   }
  // }, [orgInfo])

  return (
    <Flex direction='column'>
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
            <Tabs variant='enclosed' w={'100%'} bg={'white'}>
              <TabList>
                <Tab _focus={{ outline: 'none' }}>Feeds</Tab>
                <Tab _focus={{ outline: 'none' }}>Rules</Tab>
                <Tab _focus={{ outline: 'none' }}>Lists</Tab>
              </TabList>
              <TabPanels>
                <TabPanel px={0}>
                  <Grid
                    width={'100%'}
                    templateColumns={{ sm: '1fr', xl: 'repeat(3, 1fr)' }}
                    gap='22px'
                  >
                    <AdvisoryFeeds data={data} orgInfo={orgInfo} />
                    <ExploitFeeds data={data} orgInfo={orgInfo} />
                  </Grid>
                </TabPanel>
                <TabPanel px={0}>
                  <ApiFeed />
                </TabPanel>
                <TabPanel px={0}>
                  <Grid
                    width={'100%'}
                    templateColumns={{ sm: '1fr', xl: 'repeat(3, 1fr)' }}
                    gap='22px'
                  >
                    <GeneralFeed />
                  </Grid>
                </TabPanel>
              </TabPanels>
            </Tabs>
          )}
        </>
      )}
    </Flex>
  )
}

export default Profile
