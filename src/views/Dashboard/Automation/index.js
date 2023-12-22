import {
  Flex,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Text
} from '@chakra-ui/react'
import Card from 'components/Card/Card'
import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Controls from './components/Controls'
import Settings from './components/Settings'
import { useQuery } from '@apollo/client'
import { GetProjectCheck } from 'graphQL/Queries'
import VulnsTable from 'components/Tables/VulnsTable'
import { vulnList } from 'variables/general'
import ChangeLog from '../Changelog'

const idRegex =
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/

const Automation = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const queryParams = new URLSearchParams(location.search)
  const productId = queryParams.get('id')

  const [activeTab, setActiveTab] = useState(0)

  const { data, error, refetch } = useQuery(GetProjectCheck, {
    variables: {
      id: productId,
      first: 25
    }
  })

  const handleTabChange = (value) => {
    setActiveTab(value)
  }

  useEffect(() => {
    if (!idRegex.test(productId)) {
      navigate(`/vendor/products`)
    }
  }, [productId])

  return (
    <Flex direction='column' pt={{ base: '120px', md: '74px' }} pr={2} pl={5}>
      <Card bg='white'>
        <Tabs
          variant='enclosed'
          w={'100%'}
          bg={'white'}
          index={activeTab}
          onChange={(value) => handleTabChange(value)}
        >
          <TabList>
            {['Vulnerabilities', 'Automation', 'Controls', 'Change Log'].map(
              (item, index) => (
                <Tab key={index} _focus={{ outline: 'none' }}>
                  {item}
                </Tab>
              )
            )}
          </TabList>
          <TabPanels>
            {/* VULNERABILITIES */}
            <TabPanel>
              <VulnsTable data={vulnList} />
            </TabPanel>
            {/* AUTOMATIONS */}
            <TabPanel>
              {error ? (
                <Text textAlign={'center'} my={6}>
                  {JSON.stringify(error)}
                </Text>
              ) : (
                <Settings data={data?.project.autoChecks} refetch={refetch} />
              )}
            </TabPanel>
            {/* CONTROLS */}
            <TabPanel>
              <Controls />
            </TabPanel>
            {/* CHANGE LOG */}
            <TabPanel>
              <ChangeLog />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Card>
    </Flex>
  )
}

export default Automation
