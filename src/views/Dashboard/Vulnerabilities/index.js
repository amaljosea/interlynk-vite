import { useMemo, useState } from 'react'
import { useLocation, useParams } from 'react-router-dom'

import { Text } from '@chakra-ui/react'

import Card from 'components/Card/Card'
import ViewAlert from 'components/Misc/ViewAlert'
import GlobalVulnTable from 'components/Tables/GlobalVulnTable'

import { useGlobalQueryContext } from 'hooks/useGlobalQueryContext'
import { useGlobalState } from 'hooks/useGlobalState'
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

  const productPermissions = useMemo(
    () => userPermissions?.find((item) => item.key === 'view_product_group'),
    [userPermissions]
  )
  const vulnsPermissions = useMemo(
    () => userPermissions?.find((item) => item.key === 'view_feeds'),
    [userPermissions]
  )

  const { nodes, paginationProps, reset, loading } = usePaginatatedQuery(
    GetGlobalVulns,
    {
      skip:
        !orgView ||
        (productPermissions?.value === false &&
          vulnsPermissions?.value === false),
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

  if (productPermissions?.value === false || !orgView) {
    return <ViewAlert loading={orgLoading} category='vulnerability page' />
  }

  return (
    <Card>
      {vulnsPermissions?.value === false ? (
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
