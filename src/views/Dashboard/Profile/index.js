// Chakra imports
import { Flex, Grid, useColorModeValue } from '@chakra-ui/react'
import ProfileBgImage from 'assets/img/ProfileBackground.png'
import React from 'react'
import { FaSlackHash, FaUserCircle, FaBuilding } from 'react-icons/fa'
import Header from './components/Header'
import { useState } from 'react'
import AdvisoryFeeds from './components/AdvisoryFeeds'
import ExploitFeeds from './components/ExploitFeeds'
import { useQuery } from '@apollo/client'
import { GetSettings } from 'graphQL/Queries'
import { GetOrgInfo } from 'graphQL/Queries'
import { useEffect } from 'react'

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
        backgroundHeader={ProfileBgImage}
        backgroundProfile={bgProfile}
        name={username ? username : 'Surendra Pathak'}
        email={email ? email : 'surendra.pathak@interlynk.io'}
        selectedTab={selectedTab}
        setSelectedTab={setSelectedTab}
        tabs={tabs}
      />
      {data && (
        <Grid templateColumns={{ sm: '1fr', xl: 'repeat(3, 1fr)' }} gap='22px'>
          {selectedTab === 'ORGANIZATION' && orgInfo && (
            <>
              <AdvisoryFeeds data={data} orgInfo={orgInfo} />
              <ExploitFeeds data={data} orgInfo={orgInfo} />
            </>
          )}
        </Grid>
      )}
    </Flex>
  )
}

export default Profile
