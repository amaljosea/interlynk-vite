import { TabProvider } from 'context/TabContext'
import { useNavigate } from 'react-router-dom'

import { Tab, TabList, TabPanel, TabPanels, Tabs } from '@chakra-ui/react'

import Card from 'components/Card/Card.js'

import { useGlobalQueryContext } from 'hooks/useGlobalQueryContext'
import { useProductUrlContext } from 'hooks/useProductUrlContext'
import useQueryParam from 'hooks/useQueryParam'

import Changelog from './Changelog'
import Checks from './Checks'
import Compliance from './Compliance'
import Components from './Components'
import General from './General'
import Licenses from './Licenses'
import Parts from './Parts'
import Policies from './Policies'
import Support from './Support'
import Vulnerabilities from './Vulnerabilities'

const tabNames = {
  general: 'General',
  parts: 'Parts',
  components: 'Components',
  vulnerabilities: 'Vulnerabilities',
  licenses: 'Licenses',
  policies: 'Policies',
  support: 'Support Status',
  checks: 'Checks',
  compliance: 'Compliance',
  changelog: 'Change Log'
}

const SbomTable = ({ data, loading, error }) => {
  const { isFreeTier } = useGlobalQueryContext()

  const tabs = [
    'general',
    'parts',
    'components',
    'vulnerabilities',
    'licenses',
    'policies',
    'support',
    'checks',
    'compliance',
    'changelog'
  ]

  const excludedTabs = new Set(['parts', 'compliance', 'support'])

  const filterTabs = isFreeTier
    ? tabs?.filter((item) => !excludedTabs.has(item))
    : tabs

  const navigate = useNavigate()
  const { generateProductVersionDetailPageUrlFromCurrentUrl } =
    useProductUrlContext()

  const onTabChange = (value) => {
    const link = generateProductVersionDetailPageUrlFromCurrentUrl({
      paramsObj: {
        tab: filterTabs[value]
      }
    })

    navigate(link)
  }

  const tab = useQueryParam('tab')
  const activeTabNumber = Math.max(filterTabs.indexOf(tab), 0)

  return (
    <TabProvider>
      <Card>
        <Tabs
          isLazy
          variant='enclosed'
          index={activeTabNumber}
          onChange={onTabChange}
        >
          <TabList>
            {filterTabs?.map((item, index) => (
              <Tab
                key={index}
                textTransform={'capitalize'}
                _focus={{ outline: 'none' }}
                className={`${item}`}
              >
                {tabNames[item]}
              </Tab>
            ))}
          </TabList>
          <TabPanels>
            <TabPanel px={1}>
              <General data={data} error={error} loading={loading} />
            </TabPanel>
            {!isFreeTier && <TabPanel px={0}>{<Parts data={data} />}</TabPanel>}
            <TabPanel px={0}>
              <Components sbomData={data} />
            </TabPanel>
            <TabPanel px={0}>
              <Vulnerabilities sbomData={data} />
            </TabPanel>
            <TabPanel px={0}>
              <Licenses />
            </TabPanel>
            <TabPanel px={0}>
              <Policies sbomData={data} />
            </TabPanel>
            {!isFreeTier && (
              <TabPanel px={0}>
                <Support sbomData={data} />
              </TabPanel>
            )}
            <TabPanel px={0}>
              <Checks sbomData={data} />
            </TabPanel>
            {!isFreeTier && (
              <TabPanel px={0}>
                <Compliance sbomData={data} />
              </TabPanel>
            )}
            <TabPanel px={0}>
              <Changelog />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Card>
    </TabProvider>
  )
}

export default SbomTable
