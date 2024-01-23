import { useEffect } from 'react'
import { Flex } from '@chakra-ui/react'
import { useLocation } from 'react-router-dom'
import { useLazyQuery, useQuery } from '@apollo/client'
import { useGlobalState } from 'hooks/useGlobalState'
import GlobalVulnTable from 'components/Tables/GlobalVulnTable'
import { GetGlobalVulns, GetGlobalVulnData } from 'graphQL/Queries'
import OrgRegister from '../Profile/components/OrgRegister'
import Card from 'components/Card/Card'
import VulnInfo from './vulnInfo'

const Vulnerabilities = () => {
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const vulnId = queryParams.get('id')
  const org = localStorage.getItem('organization')

  const { totalRows, dispatch } = useGlobalState()
  const { globalVulnDispatch } = dispatch

  const { data, refetch } = useQuery(GetGlobalVulns, {
    variables: { first: totalRows },
    onCompleted: () => globalVulnDispatch({ type: 'FETCH_DATA_SUCCESS' })
  })

  const [getVulnData, { data: vulnData }] = useLazyQuery(GetGlobalVulnData)

  useEffect(() => {
    if (vulnId) {
      getVulnData({
        variables: { id: vulnId, first: totalRows }
      })
    } else {
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
        <VulnInfo data={vulnData?.vuln} refetch={getVulnData} />
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
