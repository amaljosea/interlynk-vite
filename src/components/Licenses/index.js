import { useQuery } from '@apollo/client'
import OrgRegister from 'views/Dashboard/Profile/components/OrgRegister'

import { Flex } from '@chakra-ui/react'

import Card from 'components/Card/Card'

import { GetLicensesTable } from 'graphQL/Queries'

import LicenseTable from './LicenseTable'

const Licenses = () => {
  const org = localStorage.getItem('organization')
  const { data, refetch } = useQuery(GetLicensesTable, {
    fetchPolicy: 'network-only',
    skip: !org || org === 'undefined' ? true : false,
    variables: {
      direction: 'ASC',
      first: 25
    }
  })

  const licenses = data?.organization?.licenses

  return (
    <Flex
      flexDirection='column'
      pt={{ base: '120px', md: '74px' }}
      pr={2}
      pl={5}
    >
      {!org || org === 'undefined' ? (
        <OrgRegister />
      ) : (
        <Card overflowX={{ sm: 'scroll', xl: 'hidden' }}>
          <LicenseTable data={licenses} refetch={refetch} />
        </Card>
      )}
    </Flex>
  )
}

export default Licenses
