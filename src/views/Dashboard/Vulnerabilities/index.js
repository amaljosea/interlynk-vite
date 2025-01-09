import { useNavigate, useParams } from 'react-router-dom'
import { getFilterValue, parseEpssRange, setKEV } from 'utils'

import { Tab, TabList, TabPanel, TabPanels, Tabs } from '@chakra-ui/react'

import Card from 'components/Card/Card'
import CustomVulnTable from 'components/Tables/CustomVulnTable'
import GlobalVulnTable from 'components/Tables/GlobalVulnTable'

import { useGlobalState } from 'hooks/useGlobalState'
import { useHasPermission } from 'hooks/useHasPermission'
import { usePaginatedQuery } from 'hooks/usePaginatedQuery'
import useQueryParam from 'hooks/useQueryParam'

import { GetGlobalVulns } from 'graphQL/Queries'

import VulnInfo from './vulnInfo'

const tabs = ['productVulnerabilities', 'customVulnerabilities']

const Vulnerabilities = () => {
  const params = useParams()
  const navigate = useNavigate()
  const { globalVulnState } = useGlobalState()
  const vulnId = useQueryParam('vulnId') || params.vulnerabilityid

  const tab = useQueryParam('tab')
  const activeTabNumber = Math.max(tabs.indexOf(tab), 0)

  const onTabChange = (value) => {
    const link = `/vendor/vulnerabilities?tab=${tabs[value]}`
    navigate(link)
  }

  const vulnsPermissions = useHasPermission({ parentKey: 'view_feeds' })

  const epssRange = parseEpssRange(globalVulnState?.epss)

  const filters = {
    epss: epssRange,
    field: globalVulnState?.field,
    kev: setKEV(globalVulnState?.kev),
    direction: globalVulnState?.direction,
    search: globalVulnState?.search || undefined,
    severity: getFilterValue(globalVulnState?.severity),
    projectNames: getFilterValue(globalVulnState?.projectNames),
    projectGroupIds: getFilterValue(globalVulnState?.projectGroupIds)
  }

  const { nodes, paginationProps, reset, loading } = usePaginatedQuery(
    GetGlobalVulns,
    {
      skip: tab === 'productVulnerabilities' && vulnsPermissions ? false : true,
      selector: 'organization.vulns',
      variables: { ...filters }
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
              vulns={nodes}
              reset={reset}
              filters={filters}
              loading={loading}
              paginationProps={paginationProps}
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
