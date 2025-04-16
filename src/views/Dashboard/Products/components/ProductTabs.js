import { useQuery } from '@apollo/client'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { getFilterValue, parseEpssRange, setKEV } from 'utils'
import { ProductDetailsTabs } from 'utils/TabsObjects'
import Automation from 'views/Dashboard/Automation'
import Settings from 'views/Dashboard/ProductSettings'

import { Tab, TabList, TabPanel, TabPanels, Tabs } from '@chakra-ui/react'

import ChangelogTable from 'components/Tables/ChangelogTable'
import GlobalVulnTable from 'components/Tables/GlobalVulnTable'
import VersionsTable from 'components/Tables/VersionsTable'

import { useGlobalQueryContext } from 'hooks/useGlobalQueryContext'
import { useGlobalState } from 'hooks/useGlobalState'
import { usePaginatedQuery } from 'hooks/usePaginatedQuery'
import { useProductUrlContext } from 'hooks/useProductUrlContext'

import { GetGlobalVulns, GetOrgMfc } from 'graphQL/Queries'
import PolicyTable from 'components/Tables/PolicyTable'

const tabs = [
  'versions',
  'vulnerabilities',
  'automation rules',
  'settings',
  'policies',
  'change log'
]

const ProductTabs = (props) => {
  const params = useParams()
  const navigate = useNavigate()
  const queryParams = useSearchParams()
  const { globalVulnState, dispatch } = useGlobalState()
  const { isFreeTier } = useGlobalQueryContext()
  const { generateProductDetailPageUrlFromCurrentUrl } = useProductUrlContext()

  const { globalVulnDispatch } = dispatch

  const tab = queryParams[0].get('tab')
  const activeTabNumber = Math.max(tabs.indexOf(tab), 0)

  const { data, settings } = props

  const { enabled, projects } = data || ''

  const { VULNERABILITIES, SETTINGS } = ProductDetailsTabs

  const getDisplay = (item) => {
    const conditions = {
      'automation rules': isFreeTier
    }
    return conditions[item] ? 'none' : 'block'
  }

  const onTabChange = (value) => {
    if (value === 1) {
      globalVulnDispatch({ type: 'CLEAR_GLOBAL_VULN' })
    }
    const link = generateProductDetailPageUrlFromCurrentUrl({
      paramsObj: {
        tab: tabs[value]
      }
    })
    navigate(link)
  }

  const epssRange = parseEpssRange(globalVulnState?.epss)

  const vulnFilters = {
    epss: epssRange,
    field: globalVulnState?.field,
    projectIds: [params?.productid],
    kev: setKEV(globalVulnState?.kev),
    direction: globalVulnState?.direction,
    projectGroupIds: [params?.productgroupid],
    search: globalVulnState?.search || undefined,
    severity: getFilterValue(globalVulnState?.severity)
  }

  // GET PRODUCT VULN DATA
  const {
    nodes,
    reset,
    paginationProps,
    loading: globalVulnloading
  } = usePaginatedQuery(GetGlobalVulns, {
    skip: tab === VULNERABILITIES ? false : true,
    selector: 'organization.vulns',
    variables: { ...vulnFilters }
  })

  // GET MANUFACTURER DATA
  const { data: mfc } = useQuery(GetOrgMfc, {
    skip: tab === SETTINGS ? false : true
  })

  return (
    <Tabs
      w={'100%'}
      variant='enclosed'
      index={activeTabNumber}
      onChange={onTabChange}
    >
      <TabList>
        {tabs.map((item, index) => (
          <Tab
            key={index}
            display={getDisplay(item)}
            _focus={{ outline: 'none' }}
            textTransform={'capitalize'}
            className={
              item === 'automation rules'
                ? 'automation-rules'
                : item === 'versions'
                  ? ''
                  : item
            }
          >
            {item}
          </Tab>
        ))}
      </TabList>
      <TabPanels>
        {/* VERSIONS */}
        <TabPanel px={0}>
          <VersionsTable retentionTime={settings?.dataRetentionDays} />
        </TabPanel>
        {/* VULNERABILITIES */}
        <TabPanel px={0}>
          <GlobalVulnTable
            vulns={nodes}
            reset={reset}
            filters={vulnFilters}
            loading={globalVulnloading}
            paginationProps={paginationProps}
          />
        </TabPanel>
        {/* AUTOMATIONS */}
        <TabPanel px={0}>
          <Automation projects={projects} />
        </TabPanel>
        {/* SETTINGS */}
        <TabPanel px={0}>
          <Settings
            data={settings}
            enabled={enabled}
            mfc={mfc?.organizationManufacturers}
          />
        </TabPanel>
        {/* POLICIES */}
        <TabPanel px={0}>
          <PolicyTable />
        </TabPanel>
        {/* CHANGE LOG */}
        <TabPanel px={0}>
          <ChangelogTable activeEnv={params?.productid} />
        </TabPanel>
      </TabPanels>
    </Tabs>
  )
}

export default ProductTabs
