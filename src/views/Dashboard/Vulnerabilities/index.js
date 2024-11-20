import { useState } from 'react'
import { useParams } from 'react-router-dom'

import Card from 'components/Card/Card'
import GlobalVulnTable from 'components/Tables/GlobalVulnTable'

import { useHasPermission } from 'hooks/useHasPermission'
import { usePaginatedQuery } from 'hooks/usePaginatedQuery'
import useQueryParam from 'hooks/useQueryParam'

import { GetGlobalVulns } from 'graphQL/Queries'

import VulnInfo from './vulnInfo'

const Vulnerabilities = () => {
  const params = useParams()
  const vulnId = useQueryParam('vulnId') || params.vulnerabilityid

  const [filters, setFilters] = useState({
    field: 'VULNS_VULN_ID',
    direction: 'DESC'
  })

  const vulnsPermissions = useHasPermission({ parentKey: 'view_feeds' })

  const { nodes, paginationProps, reset, loading } = usePaginatedQuery(
    GetGlobalVulns,
    {
      skip: !vulnsPermissions,
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
    </Card>
  )
}

export default Vulnerabilities
