import { useQuery } from '@apollo/client'
import { useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ProductDetailsTabs } from 'utils/TabsObjects'
import Automation from 'views/Dashboard/Automation'
import Settings from 'views/Dashboard/ProductSettings'

import { Tab, TabList, TabPanel, TabPanels, Tabs, Tag } from '@chakra-ui/react'

import ChangelogTable from 'components/Tables/ChangelogTable'
import GlobalVulnTable from 'components/Tables/GlobalVulnTable'
import PolicyTable from 'components/Tables/PolicyTable'
import VersionsTable from 'components/Tables/VersionsTable'

import { useGlobalQueryContext } from 'hooks/useGlobalQueryContext'
import { usePaginatedQuery } from 'hooks/usePaginatedQuery'
import { useProductUrlContext } from 'hooks/useProductUrlContext'

import { GetGlobalVulns, GetOrgMfc, GetProjectPolicies } from 'graphQL/Queries'

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
  const { isFreeTier } = useGlobalQueryContext()
  const { generateProductDetailPageUrlFromCurrentUrl } = useProductUrlContext()

  const tab = queryParams[0].get('tab')
  const activeTabNumber = Math.max(tabs.indexOf(tab), 0)

  const {
    data,
    settings,
    settingsLoading,
    filters,
    setFilters,
    handleSort,
    activeEnv
  } = props

  const { enabled, projects } = data || ''

  const { VULNERABILITIES, POLICIES, SETTINGS } = ProductDetailsTabs
  const [vulnFilters, setVulnFilters] = useState({
    field: 'VULNS_VULN_ID',
    direction: 'DESC'
  })

  const getDisplay = (item) => {
    const conditions = {
      'automation rules': isFreeTier
    }
    return conditions[item] ? 'none' : 'block'
  }

  const onTabChange = (value) => {
    const link = generateProductDetailPageUrlFromCurrentUrl({
      paramsObj: {
        tab: tabs[value]
      }
    })
    navigate(link)
  }

  // GET PRODUCT VULN DATA
  const {
    nodes,
    paginationProps,
    reset,
    loading: globalVulnloading
  } = usePaginatedQuery(GetGlobalVulns, {
    skip: tab === VULNERABILITIES ? false : true,
    selector: 'organization.vulns',
    variables: {
      projectGroupIds: [params?.productgroupid],
      projectIds: [params?.productid],
      ...vulnFilters
    }
  })

  // GET POLICY DATA
  const {
    nodes: policyData,
    paginationProps: policyPaginationProps,
    loading: policyloading
  } = usePaginatedQuery(GetProjectPolicies, {
    skip: tab === POLICIES ? false : true,
    selector: 'projectPolicies',
    variables: {
      projectId: activeEnv
    }
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
          <VersionsTable
            handleSort={handleSort}
            filters={filters}
            setFilters={setFilters}
            retentionTime={settings?.dataRetentionDays}
          />
        </TabPanel>
        {/* VULNERABILITIES */}
        <TabPanel px={0}>
          {!settingsLoading && (
            <Tag
              size='sm'
              mb={4}
              colorScheme='orange'
              hidden={settings?.vulnScanningEnabled}
            >
              Automatic vulnerabilty scan is disabled under Product Settings
            </Tag>
          )}
          <GlobalVulnTable
            loading={globalVulnloading}
            vulns={nodes}
            paginationProps={paginationProps}
            filters={vulnFilters}
            setFilters={(newFilters) => {
              setVulnFilters(newFilters)
              reset()
            }}
          />
        </TabPanel>
        {/* AUTOMATIONS */}
        <TabPanel px={0}>
          <Tag
            size='sm'
            colorScheme='orange'
            hidden={settings?.automatedFixesEnabled}
            mb={4}
          >
            Automation is disabled under Product Settings
          </Tag>
          {<Automation projects={projects} />}
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
          <PolicyTable
            data={policyData}
            loading={policyloading}
            paginationProps={policyPaginationProps}
          />
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
