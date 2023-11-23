import {
  Flex,
  Box,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel
} from '@chakra-ui/react'
import Card from 'components/Card/Card'
import { useEffect, useState } from 'react'
import { useLocation, useHistory } from 'react-router-dom'
import Controls from './components/Controls'
import Settings from './components/Settings'
import { useLazyQuery } from '@apollo/client'
import { GetProjectCheck } from 'graphQL/Queries'

const idRegex =
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/

const Automation = () => {
  const location = useLocation()
  const history = useHistory()
  const queryParams = new URLSearchParams(location.search)
  const productId = queryParams.get('id')

  const [activeTab, setActiveTab] = useState(0)

  const [getAutomations, { data }] = useLazyQuery(GetProjectCheck)

  const handleTabChange = (value) => {
    setActiveTab(value)
    if (value === 1) {
      getAutomations({
        variables: {
          id: productId,
          first: 25
        }
      })
    }
  }

  useEffect(() => {
    if (data) {
      console.log(data)
    }
  }, [data])

  useEffect(() => {
    if (!idRegex.test(productId)) {
      history.push(`/vendor/products`)
    }
  }, [productId])

  return (
    <Flex direction='column' pt={{ base: '120px', md: '74px' }} px={4}>
      <Card bg='white'>
        <Tabs
          variant='enclosed'
          w={'100%'}
          bg={'white'}
          index={activeTab}
          onChange={(value) => handleTabChange(value)}
        >
          <TabList>
            <Tab _focus={{ outline: 'none' }}>Controls</Tab>
            <Tab _focus={{ outline: 'none' }}>Automation</Tab>
          </TabList>
          <TabPanels>
            {/* CONTROLS */}
            <TabPanel>
              <Controls />
            </TabPanel>
            {/* AUTOMATIONS */}
            <TabPanel>
              <Settings
                data={data?.project.autoChecks}
                getData={getAutomations}
              />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Card>
    </Flex>
  )
}

export default Automation
