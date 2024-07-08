import { useMemo, useState } from 'react'
import { useLocation, useParams } from 'react-router-dom'

import { Text } from '@chakra-ui/react'

import Card from 'components/Card/Card'
import ViewAlert from 'components/Misc/ViewAlert'
import GlobalVulnTable from 'components/Tables/GlobalVulnTable'

import { useGlobalQueryContext } from 'hooks/useGlobalQueryContext'
import { useGlobalState } from 'hooks/useGlobalState'
import { useHasPermission } from 'hooks/useHasPermission'
import { usePaginatatedQuery } from 'hooks/usePaginatatedQuery'

import { GetGlobalVulns } from 'graphQL/Queries'

import OrgRegister from '../Profile/components/OrgRegister'
import VulnInfo from './vulnInfo'

const Vulnerabilities = () => {
  const location = useLocation()
  const params = useParams()
  const queryParams = new URLSearchParams(location.search)
  const vulnId = queryParams.get('vulnId') || params.vulnerabilityid
  const org = localStorage.getItem('organization')

  const { userPermissions } = useGlobalState()
  const { orgView, orgLoading } = useGlobalQueryContext()

  const [filters, setFilters] = useState({
    field: 'VULNS_VULN_ID',
    direction: 'DESC'
  })

  const productPermissions = useHasPermission({
    parentKey: 'view_product_group'
  })
  const vulnsPermissions = useHasPermission({ parentKey: 'view_feeds' })

  const { nodes, paginationProps, reset, loading } = usePaginatatedQuery(
    GetGlobalVulns,
    {
      skip:
        !orgView ||
        (productPermissions === false && vulnsPermissions === false),
      selector: 'organization.vulns',
      variables: {
        ...filters
      }
    }
  )

  if (!org || org === 'undefined') return <OrgRegister />

  if (vulnId && location.pathname === '/vendor/vulnerabilities') {
    return <VulnInfo vulnId={vulnId} />
  }

  if (productPermissions === false || !orgView) {
    return <ViewAlert loading={orgLoading} category='vulnerability page' />
  }

  return (
    <Card>
      {vulnsPermissions === false ? (
        <Text>You are not allowed to access this data</Text>
      ) : (
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
      )}
    </Card>
  )
}

export default Vulnerabilities
