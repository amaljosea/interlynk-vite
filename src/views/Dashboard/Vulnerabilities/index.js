import { Flex } from '@chakra-ui/react'
import Card from 'components/Card/Card'
import VulnsTable from 'components/Tables/VulnsTable'
import VulnInfo from './vulnInfo'
import { useLocation } from 'react-router-dom'
import { useQuery } from '@apollo/client'
import { GetGlobalVulns } from 'graphQL/Queries'
import { useGlobalState } from 'hooks/useGlobalState'

const Vulnerabilities = () => {
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const vulnId = queryParams.get('id')

  const { totalRows } = useGlobalState()

  const { data, refetch } = useQuery(GetGlobalVulns, {
    variables: { first: totalRows }
  })

  if (vulnId && location.pathname === '/vendor/vulnerabilities') {
    return <VulnInfo data={data?.organization?.vulns} />
  } else {
    return (
      <Flex
        flexDirection='column'
        pt={{ base: '120px', md: '74px' }}
        pr={2}
        pl={5}
      >
        <Card>
          <VulnsTable data={data?.organization?.vulns} refetch={refetch} />
        </Card>
      </Flex>
    )
  }
}

export default Vulnerabilities
