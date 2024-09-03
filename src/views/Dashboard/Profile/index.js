import { gql, useQuery } from '@apollo/client'
import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { displayErrorMessage } from 'utils'

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
import LegalTable from 'components/Tables/LegalTable'
import PlanTable from 'components/Tables/PlanTable'
import RoleTable from 'components/Tables/RoleTable'
import TeamTable from 'components/Tables/TeamTable'

import { useGlobalQueryContext } from 'hooks/useGlobalQueryContext'
import { useHasPermission } from 'hooks/useHasPermission'

import { FaBuilding, FaUserCircle } from 'react-icons/fa'

import Connections from '../../../components/Connections/Connections'
import Checks from './components/Checks'
import Feeds from './components/Feeds'
import Header from './components/Header'
import { InternalComponents } from './components/InternalComponents'
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

function Profile() {
  const { orgView, isFreeTier } = useGlobalQueryContext()

  const orgTabs = [
    'users',
    'roles',
    'feeds',
    'checks',
    'lists',
    'legal',
    'integrations-org',
    'plan'
  ]

  const psTabs = ['security tokens', 'integrations']

  const navigate = useNavigate()
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const activetab = queryParams.get('tab')

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activetab])

  const tabs = useMemo(() => {
    return [
      { name: 'PERSONAL', icon: FaUserCircle },
      { name: 'ORGANIZATION', icon: FaBuilding }
    ]
  }, [])

  const [selectedTab, setSelectedTab] = useState('')

  const viewUsers = useHasPermission({ parentKey: 'view_users' })

  const manageFeeds = useHasPermission({
    parentKey: 'view_feeds',
    childKey: 'manage_feeds'
  })

  const manageListing = useHasPermission({
    parentKey: 'view_feeds',
    childKey: 'manage_listing'
  })

  const { data, error } = useQuery(GetOrganization, {
    skip: !orgView
  })

  const { organization } = data || ''

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
      Users: !viewUsers,
      roles: isFreeTier,
      'security tokens': isFreeTier
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activetab, tabs])

  if (error) {
    return (
      <Flex alignItems={'center'} justifyContent={'center'} gap={2}>
        <WarningTwoIcon color='blue.500' />
        <Text textAlign={'center'} fontSize={14}>
          {displayErrorMessage(error.networkError?.statusCode, error.message)}
        </Text>
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
        <Card display={orgView ? 'flex' : 'none'}>
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
                  {item.replace(/-org/g, '')}
                </Tab>
              ))}
            </TabList>
            <TabPanels>
              {/* GEENRAL */}
              {/*  <TabPanel>
                <GeneralFeed />
              </TabPanel> */}
              {/* TEAMS */}
              <TabPanel display={data ? 'block' : 'none'}>
                <TeamTable />
              </TabPanel>
              {/* ROLES */}
              <TabPanel>
                <RoleTable />
              </TabPanel>
              {/* FEEDS */}
              <TabPanel>
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
                <Connections org={true} />
              </TabPanel>
              <TabPanel>
                <PlanTable />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Card>
      )}

      {/* PERSONAL  */}
      {selectedTab === 'PERSONAL' && (
        <Card display={orgView ? 'flex' : 'none'}>
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
                  display={getDisplay(item)}
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
              <TabPanel>{<TokenInfo />}</TabPanel>
              <TabPanel>
                <Connections />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Card>
      )}
    </>
  )
}

export default Profile
