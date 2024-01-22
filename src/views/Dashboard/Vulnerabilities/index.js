import { Flex } from '@chakra-ui/react'
import Card from 'components/Card/Card'
import GlobalVulnTable from 'components/Tables/GlobalVulnTable'
import VulnInfo from './vulnInfo'
import { useLocation } from 'react-router-dom'
import { useLazyQuery, useQuery } from '@apollo/client'
import { GetGlobalVulns } from 'graphQL/Queries'
import { useGlobalState } from 'hooks/useGlobalState'
import { GetGlobalVulnData } from 'graphQL/Queries'
import { useEffect } from 'react'
import OrgRegister from '../Profile/components/OrgRegister'

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
    return <VulnInfo data={vulnData?.vuln} refetch={getVulnData} />
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
