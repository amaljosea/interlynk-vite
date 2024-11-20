import { TabProvider } from 'context/TabContext'
import { useNavigate } from 'react-router-dom'

import { Tab, TabList, TabPanel, TabPanels, Tabs } from '@chakra-ui/react'

import Card from 'components/Card/Card.js'

import { useGlobalQueryContext } from 'hooks/useGlobalQueryContext'
import { useProductUrlContext } from 'hooks/useProductUrlContext'
import useQueryParam from 'hooks/useQueryParam'
import { useThemeColor } from 'hooks/useThemeColors'

import { FaLock } from 'react-icons/fa6'

import Components from './Components'
import General from './General'
import Licenses from './Licenses'
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

const SbomTable = ({ data, loading, error }) => {
  const { isFreeTier } = useGlobalQueryContext()
  const { generateProductVersionDetailPageUrlFromCurrentUrl } =
    useProductUrlContext()
  const navigate = useNavigate()

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
    return conditions[item] ? 'none' : 'flex'
  }

  const { secondaryTextInverse } = useThemeColor(['secondaryTextInverse'])

  const tab = useQueryParam('tab')
  const activeTabNumber = Math.max(tabs.indexOf(tab), 0)

  return (
    <TabProvider>
      <Card>
        <Tabs
          isLazy
          w={'100%'}
          variant='enclosed'
          index={activeTabNumber}
          onChange={onTabChange}
        >
          <TabList mt='20px'>
            {tabs.map((item, index) => (
              <Tab
                key={index}
                className={item}
                display={getDisplay(item)}
                textTransform={'capitalize'}
                _focus={{ outline: 'none' }}
                isDisabled={
                  item === 'general' ||
                  item === 'components' ||
                  item === 'vulnerabilities' ||
                  item === 'licenses'
                    ? false
                    : true
                }
              >
                {(item === 'parts' ||
                  item === 'checks' ||
                  item === 'changelog' ||
                  item === 'support' ||
                  item === 'policies') && (
                  <FaLock
                    color={secondaryTextInverse}
                    style={{ marginRight: '6px' }}
                  />
                )}
                {item}
              </Tab>
            ))}
          </TabList>
          <TabPanels>
            <TabPanel px={1}>
              <General data={data} error={error} loading={loading} />
            </TabPanel>
            <TabPanel px={0}></TabPanel>
            <TabPanel px={0}>
              <Components sbomData={data} />
            </TabPanel>
            <TabPanel px={0}>
              <Vulnerabilities sbomData={data} />
            </TabPanel>
            <TabPanel px={0}>
              <Licenses />
            </TabPanel>
            <TabPanel px={0}></TabPanel>
            <TabPanel px={0}></TabPanel>
            <TabPanel px={0}></TabPanel>
            <TabPanel px={0}></TabPanel>
          </TabPanels>
        </Tabs>
      </Card>
    </TabProvider>
  )
}

export default SbomTable
