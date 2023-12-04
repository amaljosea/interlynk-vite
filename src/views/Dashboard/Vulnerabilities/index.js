import { Flex } from '@chakra-ui/react'
import Card from 'components/Card/Card'
import VulnsTable from 'components/Tables/VulnsTable'
import VulnInfo from './vulnInfo'
import { useLocation } from 'react-router-dom'
import { vulnList } from 'variables/general'

const Vulnerabilities = () => {
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const vulnId = queryParams.get('id')


  if (vulnId === null) {
    return (
      <Flex
        flexDirection='column'
        pt={{ base: '120px', md: '74px' }}
        pr={2}
        pl={5}
      >
        <Card overflowX={{ sm: 'scroll', xl: 'hidden' }}>
          <VulnsTable data={vulnList} />
        </Card>
      </Flex>
    )
  } else {
    return <VulnInfo data={vulnList} />
  }
}

export default Vulnerabilities
