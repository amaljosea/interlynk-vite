import { useQuery } from '@apollo/client'
import { useMemo, useState } from 'react'
import { useLocation, useParams } from 'react-router-dom'

import { Flex, Text } from '@chakra-ui/react'

import Card from 'components/Card/Card'
import GlobalVulnTable from 'components/Tables/GlobalVulnTable'

import { useGlobalState } from 'hooks/useGlobalState'
import { usePaginatatedQuery } from 'hooks/usePaginatatedQuery'

import { GetGlobalVulnData, GetGlobalVulns } from 'graphQL/Queries'

import OrgRegister from '../Profile/components/OrgRegister'
import VulnInfo from './vulnInfo'

const Vulnerabilities = () => {
  const location = useLocation()
  const params = useParams()
  const queryParams = new URLSearchParams(location.search)
  const vulnId = queryParams.get('vulnId') || params.vulnerabilityid
  const org = localStorage.getItem('organization')

  const { totalRows, compVulnState, userPermissions } = useGlobalState()
  const { vexComplete } = compVulnState

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
        productPermissions?.value === true && vulnsPermissions?.value === true
          ? false
          : true,
      selector: 'organization.vulns',
      variables: {
        ...filters
      }
    }
  )

  const { data: vulnData, refetch: getVulnData } = useQuery(GetGlobalVulnData, {
    skip: vulnId ? false : true,
    variables: {
      id: vulnId,
      componentVulnId: vulnId,
      first: totalRows,
      vexComplete
    }
  })

  if (!org || org === 'undefined') {
    return (
      <Flex
        flexDirection='column'
        pt={{ base: '120px', md: '74px' }}
        pr={2}
        pl={5}
      >
        <OrgRegister />
      </Flex>
    )
  }

  if (vulnId && location.pathname === '/vendor/vulnerabilities') {
    return (
      <Flex direction='column' pt={{ base: '120px', md: '74px' }} pr={2} pl={5}>
        <VulnInfo
          data={vulnData?.vuln}
          componentVulns={vulnData?.componentVulns}
          refetch={getVulnData}
        />
      </Flex>
    )
  }

  if (productPermissions?.value === false)
    return (
      <Text textAlign={'center'} mt={32}>
        There are no records to display
      </Text>
    )

  return (
    <Flex
      flexDirection='column'
      pt={{ base: '120px', md: '74px' }}
      pr={2}
      pl={5}
    >
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
    </Flex>
  )
}

export default Vulnerabilities
