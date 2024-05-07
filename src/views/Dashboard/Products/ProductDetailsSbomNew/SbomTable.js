import { useLocation, useNavigate } from 'react-router-dom'

import { Tab, TabList, TabPanel, TabPanels, Tabs } from '@chakra-ui/react'

import Card from 'components/Card/Card.js'

import { useProductUrlContext } from 'hooks/useProductUrlContext'

import Changelog from './Changelog'
import Checks from './Checks'
import Components from './Components'
import General from './General'
import Licenses from './Licenses'
import Parts from './Parts'
import Policies from './Policies'
import Support from './Support'
import Vulnerabilities from './Vulnerabilities'

const tabs = [
  'general',
  'parts',
  'components',
  'vulnerabilities',
  'licenses',
  'policies',
  'support',
  'checks',
  'changelog'
]

const SbomTable = ({ data, refetch, loading, error }) => {
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

  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const tab = queryParams.get('tab')
  const activeTabNumber = Math.max(tabs.indexOf(tab), 0)

  return (
    <>
      <Card>
        <Tabs
          isLazy
          variant='enclosed'
          index={activeTabNumber}
          onChange={onTabChange}
        >
          <TabList mt='20px'>
            {tabs.map((item, index) => (
              <Tab
                key={index}
                textTransform={'capitalize'}
                _focus={{ outline: 'none' }}
              >
                {item}
              </Tab>
            ))}
          </TabList>
          <TabPanels>
            <TabPanel px={1}>
              <General
                data={data}
                error={error}
                loading={loading}
                refetch={refetch}
              />
            </TabPanel>
            <TabPanel px={0}>
              <Parts sbomRefetch={refetch} />
            </TabPanel>
            <TabPanel px={0}>
              <Components sbomData={data} sbomRefetch={refetch} />
            </TabPanel>
            <TabPanel px={0}>
              <Vulnerabilities sbomData={data} sbomRefetch={refetch} />
            </TabPanel>
            <TabPanel px={0}>
              <Licenses />
            </TabPanel>
            <TabPanel px={0}>
              <Policies />
            </TabPanel>
            <TabPanel px={0}>
              <Support />
            </TabPanel>
            <TabPanel px={0}>
              <Checks />
            </TabPanel>
            <TabPanel px={0}>
              <Changelog />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Card>
    </>
  )
}

export default SbomTable
