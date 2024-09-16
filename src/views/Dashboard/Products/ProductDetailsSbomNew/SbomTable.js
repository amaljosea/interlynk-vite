import { TabProvider } from 'context/TabContext'
import { useLocation, useNavigate } from 'react-router-dom'

import { Tab, TabList, TabPanel, TabPanels, Tabs } from '@chakra-ui/react'

import Card from 'components/Card/Card.js'

import { useGlobalQueryContext } from 'hooks/useGlobalQueryContext'
import { useProductUrlContext } from 'hooks/useProductUrlContext'

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

const SbomTable = ({ data, loading, error }) => {
  const { isFreeTier, orgQueryLoading } = useGlobalQueryContext()

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

  const filterTabs = isFreeTier
    ? tabs?.filter((item) => item !== 'compliance')
    : tabs

  const navigate = useNavigate()
  const { generateProductVersionDetailPageUrlFromCurrentUrl } =
    useProductUrlContext()

  const onTabChange = (value) => {
    const link = generateProductVersionDetailPageUrlFromCurrentUrl({
      paramsObj: {
        tab: tabs[value]
      }
    })

    navigate(link)
  }

  const getDisplay = (item) => {
    const conditions = {
      parts: isFreeTier,
      support: isFreeTier
    }
    return conditions[item] ? 'none' : 'block'
  }

  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const tab = queryParams.get('tab')
  const activeTabNumber = Math.max(tabs.indexOf(tab), 0)

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
                display={getDisplay(item)}
                textTransform={'capitalize'}
                _focus={{ outline: 'none' }}
                className={`${item}`}
              >
                {item === 'changelog' ? 'change log' : item}
              </Tab>
            ))}
          </TabList>
          <TabPanels>
            <TabPanel px={1}>
              <General
                data={data}
                error={error}
                loading={loading || orgQueryLoading}
              />
            </TabPanel>
            <TabPanel px={0}>{<Parts data={data} />}</TabPanel>
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
            <TabPanel px={0}>{<Support sbomData={data} />}</TabPanel>
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
