import { useEffect } from 'react'
import { Flex } from '@chakra-ui/react'
import { useLocation } from 'react-router-dom'
import { useQuery } from '@apollo/client'
import { useGlobalState } from 'hooks/useGlobalState'
import GlobalVulnTable from 'components/Tables/GlobalVulnTable'
import { GetGlobalVulns, GetGlobalVulnData } from 'graphQL/Queries'
import OrgRegister from '../Profile/components/OrgRegister'
import Card from 'components/Card/Card'
import VulnInfo from './vulnInfo'

const Vulnerabilities = () => {
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const vulnId = queryParams.get('vulnId')
  const org = sessionStorage.getItem('organization')

  const { totalRows, globalVulnState, dispatch } = useGlobalState()
  const { searchInput, severities, products, statues, kev, epss } =
    globalVulnState
  const { globalVulnDispatch } = dispatch

  const epssRange = epss !== 'all' && epss !== '' && epss?.split('-')
  const range = {
    min: parseFloat(epssRange[0]) / 10000,
    max: parseFloat(epssRange[1]) / 10000
  }

  const { data, refetch } = useQuery(GetGlobalVulns, {
    variables: {
      first: totalRows,
      search: searchInput !== '' ? searchInput : undefined,
      projectactiveEnvs: products?.length === 0 ? undefined : products,
      severity: severities?.length === 0 ? undefined : severities,
      status: statues?.length === 0 ? undefined : statues,
      kev: kev === 'yes' ? true : kev === 'false' ? false : undefined,
      epss: epss === 'all' || epss === '' ? undefined : range
    },
    onCompleted: () => globalVulnDispatch({ type: 'FETCH_DATA_SUCCESS' })
  })

  const { data: vulnData, refetch: getVulnData } = useQuery(GetGlobalVulnData, {
    skip: vulnId ? false : true,
    fetchPolicy: 'network-only',
    variables: { id: vulnId, first: totalRows }
  })

  useEffect(() => {
    if (!vulnId) {
      globalVulnDispatch({ type: 'CLEAR_GLOBAL_VULN' })
    }
  }, [vulnId])

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
  } else {
    return (
      <Flex
        flexDirection='column'
        pt={{ base: '120px', md: '74px' }}
        pr={2}
        pl={5}
      >
        <Card>
          <GlobalVulnTable data={data?.organization?.vulns} refetch={refetch} />
        </Card>
      </Flex>
    )
  }
}

export default Vulnerabilities
