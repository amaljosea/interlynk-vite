import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { Tab, TabList, TabPanel, TabPanels, Tabs } from '@chakra-ui/react'

import Card from 'components/Card/Card'
import CustomVulnTable from 'components/Tables/CustomVulnTable'
import GlobalVulnTable from 'components/Tables/GlobalVulnTable'

import { useHasPermission } from 'hooks/useHasPermission'
import { usePaginatedQuery } from 'hooks/usePaginatedQuery'
import useQueryParam from 'hooks/useQueryParam'

import { GetGlobalVulns } from 'graphQL/Queries'

import VulnInfo from './vulnInfo'

const tabs = ['productVulnerabilities', 'customVulnerabilities']

const Vulnerabilities = () => {
  const params = useParams()
  const navigate = useNavigate()
  const vulnId = useQueryParam('vulnId') || params.vulnerabilityid

  const tab = useQueryParam('tab')
  const activeTabNumber = Math.max(tabs.indexOf(tab), 0)

  const onTabChange = (value) => {
    const link = `/vendor/vulnerabilities?tab=${tabs[value]}`
    navigate(link)
  }

  const [filters, setFilters] = useState({
    field: 'VULNS_PUBLISHED_AT',
    direction: 'DESC'
  })

  const vulnsPermissions = useHasPermission({ parentKey: 'view_feeds' })

  const { nodes, paginationProps, reset, loading } = usePaginatedQuery(
    GetGlobalVulns,
    {
      skip: tab === 'productVulnerabilities' && vulnsPermissions ? false : true,
      selector: 'organization.vulns',
      variables: {
        ...filters
      }
    }
  )

  if (vulnId && location.pathname === '/vendor/vulnerabilities') {
    return <VulnInfo vulnId={vulnId} />
  }

  return (
    <Card>
      <Tabs
        w={'100%'}
        variant='enclosed'
        index={activeTabNumber}
        onChange={onTabChange}
      >
        <TabList>
          {tabs.map((item, index) => (
            <Tab key={index} className={item} _focus={{ outline: 'none' }}>
              {item?.startsWith('product')
                ? 'Product Vulnerabilities'
                : 'Custom Vulnerabilities'}
            </Tab>
          ))}
        </TabList>

        <TabPanels>
          <TabPanel>
            <GlobalVulnTable
              loading={loading}
              vulns={nodes}
              paginationProps={paginationProps}
              filters={filters}
              setFilters={(newFilters) => {
                setFilters(newFilters)
                reset()
              }}
            />
          </TabPanel>
          <TabPanel>
            <CustomVulnTable />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Card>
  )
}

export default Vulnerabilities
