import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { Divider, Stack } from '@chakra-ui/react'
import { Tab, TabList, TabPanel, TabPanels, Tabs } from '@chakra-ui/react'

import Card from 'components/Card/Card'
import SSOConnection from 'components/Connections/SSOConnection'
import LegalTable from 'components/Tables/LegalTable'
import OrganizationTable from 'components/Tables/OrganizationTable'
import PlanTable from 'components/Tables/PlanTable'
import RoleTable from 'components/Tables/RoleTable'
import TeamTable from 'components/Tables/TeamTable'

import { useGlobalState } from 'hooks/useGlobalState'
import { useHasPermission } from 'hooks/useHasPermission'
import useQueryParam from 'hooks/useQueryParam'
import { useShouldShowDemoFeatures } from 'hooks/useShouldShowDemoFeatures'

import { LuBuilding, LuCircleUser } from 'react-icons/lu'

import Connections from '../../../components/Connections/Connections'
import Checks from './components/Checks'
import Compliance from './components/Compliance'
import CustomFields from './components/CustomFields'
import Feeds from './components/Feeds'
import Header from './components/Header'
import { InternalComponents } from './components/InternalComponents'
import RiskFields from './components/RiskFields'
import TokenInfo from './components/TokenInfo'
import WeightControl from './components/WeightControl'

function Profile() {
  const { organization } = useGlobalState()
  const isSuperAdmin = organization?.currentUser?.superAdmin
  const isFreeTier = organization?.tier === 'free'

  const { shouldShowDemoFeatures } = useShouldShowDemoFeatures()

  const orgTabs = [
    'users',
    'roles',
    'feeds',
    'compliance',
    'lists',
    'legal',
    'integrations-org',
    'SSO',
    'plan',
    'health',
    'custom-fields',
    'risks'
  ]

  const psTabs = ['organizations', 'security tokens', 'integrations']

  const navigate = useNavigate()
  const activeTab = useQueryParam('tab')
  const [orgIndex, setOrgIndex] = useState(0)
  const [psIndex, setPsIndex] = useState(0)

  useEffect(() => {
    if (activeTab) {
      if (orgTabs?.includes(activeTab)) {
        setOrgIndex(Math.max(orgTabs.indexOf(activeTab), 0))
      } else {
        setPsIndex(Math.max(psTabs.indexOf(activeTab), 0))
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab])

  const tabs = useMemo(() => {
    return [
      { name: 'PERSONAL', icon: LuCircleUser },
      { name: 'ORGANIZATION', icon: LuBuilding }
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
    childKey: 'manage_lists'
  })

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
      health: isFreeTier,
      'custom-fields': isFreeTier,
      'security tokens': isFreeTier,
      risks: !shouldShowDemoFeatures
    }
    return conditions[item] ? 'none' : 'block'
  }

  useEffect(() => {
    const isOrgActive = orgTabs?.includes(activeTab)
    if (isOrgActive) {
      setSelectedTab(tabs[1].name)
    } else {
      setSelectedTab(tabs[0].name)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, tabs])

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
        <Card display={organization ? 'flex' : 'none'}>
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
                  hidden={!isSuperAdmin && item === 'SSO'}
                >
                  {item === 'integrations-org'
                    ? 'Integrations'
                    : item.replace(/-/g, ' ')}
                </Tab>
              ))}
            </TabList>
            <TabPanels>
              {/* TEAMS */}
              <TabPanel display={organization ? 'block' : 'none'} px={0}>
                <TeamTable />
              </TabPanel>
              {/* ROLES */}
              <TabPanel px={0}>
                <RoleTable />
              </TabPanel>
              {/* FEEDS */}
              <TabPanel px={0}>
                <Feeds />
              </TabPanel>
              {/* RULES */}
              <TabPanel px={0}>
                <Stack spacing={5}>
                  {!isFreeTier && <Compliance />}
                  <Divider hidden={isFreeTier} />
                  <Checks />
                </Stack>
              </TabPanel>
              {/* LISTS */}
              <TabPanel px={0}>
                <InternalComponents />
              </TabPanel>
              {/* LEGAL */}
              <TabPanel px={0}>
                <LegalTable />
              </TabPanel>
              <TabPanel px={0}>
                <Connections org={true} />
              </TabPanel>
              {isSuperAdmin && (
                <TabPanel px={0}>
                  <SSOConnection />
                </TabPanel>
              )}
              <TabPanel px={0}>
                <PlanTable />
              </TabPanel>
              <TabPanel px={0}>
                <WeightControl />
              </TabPanel>
              <TabPanel px={0}>
                <CustomFields />
              </TabPanel>
              {shouldShowDemoFeatures && (
                <TabPanel px={0}>
                  <RiskFields />
                </TabPanel>
              )}
            </TabPanels>
          </Tabs>
        </Card>
      )}

      {/* PERSONAL  */}
      {selectedTab === 'PERSONAL' && (
        <Card display={organization ? 'flex' : 'none'}>
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
              <TabPanel px={0}>
                <OrganizationTable />
              </TabPanel>
              <TabPanel px={0}>
                <TokenInfo />
              </TabPanel>
              <TabPanel px={0}>
                <Connections org={false} />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Card>
      )}
    </>
  )
}

export default Profile
