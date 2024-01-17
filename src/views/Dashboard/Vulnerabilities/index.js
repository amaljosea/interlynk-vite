import { Flex } from '@chakra-ui/react'
import Card from 'components/Card/Card'
import GlobalVulnTable from 'components/Tables/GlobalVulnTable'
import VulnInfo from './vulnInfo'
import { useLocation } from 'react-router-dom'
import { useQuery } from '@apollo/client'
import { GetGlobalVulns } from 'graphQL/Queries'
import { useGlobalState } from 'hooks/useGlobalState'
import { GetGlobalVulnData } from 'graphQL/Queries'

const Vulnerabilities = () => {
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const vulnId = queryParams.get('id')

  const { totalRows } = useGlobalState()

  const { data, refetch } = useQuery(GetGlobalVulns, {
    variables: { first: totalRows }
  })

  const { data: vulnData, refetch: vulnRefetch } = useQuery(GetGlobalVulnData, {
    variables: { vulnId: vulnId }
  })

  if (vulnId && location.pathname === '/vendor/vulnerabilities') {
    return <VulnInfo data={vulnData?.vuln} refetch={vulnRefetch} />
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
