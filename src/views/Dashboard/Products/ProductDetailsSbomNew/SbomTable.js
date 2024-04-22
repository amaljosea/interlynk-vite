import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { getProductVersionDetailPageUrl } from 'utils/url'

import { Tab, TabList, TabPanel, TabPanels, Tabs } from '@chakra-ui/react'

import Card from 'components/Card/Card.js'

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

const SbomTable = () => {
  const params = useParams()
  const navigate = useNavigate()

  const onTabChange = (value) => {
    const link = getProductVersionDetailPageUrl({
      productgroupid: params.productgroupid,
      productid: params.productid,
      sbomid: params.sbomid,
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
              <General />
            </TabPanel>
            <TabPanel px={0}>
              <Parts />
            </TabPanel>
            <TabPanel px={0}>
              <Components />
            </TabPanel>
            <TabPanel px={0}>
              <Vulnerabilities />
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
