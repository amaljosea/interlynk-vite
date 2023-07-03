// Chakra imports
import { Flex, Grid, useColorModeValue } from '@chakra-ui/react'
import avatar4 from 'assets/img/avatars/avatar4.png'
import ProfileBgImage from 'assets/img/ProfileBackground.png'
import React, { useContext } from 'react'
import { FaSlackHash, FaUserCircle, FaBuilding } from 'react-icons/fa'
import { IoDocumentsSharp } from 'react-icons/io5'
import Conversations from './components/Conversations'
import Header from './components/Header'
import SBOMMonitorDefaults from './components/SBOMMonitorDefaults'
import SBOMLinkDefaults from './components/SBOMLinkDefaults'
import Connections from './components/Connections'
import Projects from './components/Projects'
import GlobalContext from 'context/GlobalContext'

function Profile() {
  const { authUser } = useContext(GlobalContext)
  // Chakra color mode
  const textColor = useColorModeValue('gray.700', 'white')
  const bgProfile = useColorModeValue(
    'hsla(0,0%,100%,.8)',
    'linear-gradient(112.83deg, rgba(255, 255, 255, 0.21) 0%, rgba(255, 255, 255, 0) 110.84%)'
  )

  return (
    <Flex direction='column'>
      <Header
        backgroundHeader={ProfileBgImage}
        backgroundProfile={bgProfile}
        name={authUser ? `${authUser.name}` : 'Surendra Pathak'}
        email={authUser ? `${authUser.email}` : 'surendra.pathak@interlynk.io'}
        tabs={[
          {
            name: 'PERSONAL',
            icon: <FaUserCircle color='blue' w='100%' h='100%' />
          },
          {
            name: 'ORGANIZATION',
            icon: <FaBuilding color='blue' w='100%' h='100%' />
          },
          {
            name: 'NOTIFICATIONS',
            icon: <FaSlackHash color='blue' w='100%' h='100%' />
          }
        ]}
      />
      <Grid templateColumns={{ sm: '1fr', xl: 'repeat(3, 1fr)' }} gap='22px'>
        <Connections />
        <SBOMLinkDefaults />
        <SBOMMonitorDefaults
          title={'SBOM Monitor Defaults'}
          subtitle1={'COMPLIANCE'}
          subtitle2={'SECURITY'}
        />
      </Grid>
    </Flex>
  )
}

export default Profile
