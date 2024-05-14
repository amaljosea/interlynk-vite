import { useState } from 'react'

import { Flex } from '@chakra-ui/react'

import Card from 'components/Card/Card'

import { usePaginatatedQuery } from 'hooks/usePaginatatedQuery'

import { GetLicensesTable } from 'graphQL/Queries'

import LicenseTable from './LicenseTable'

const Licenses = () => {
  const [filters, setFilters] = useState({})
  const { nodes, paginationProps, reset, loading } = usePaginatatedQuery(
    GetLicensesTable,
    {
      selector: 'organization.licenses',
      variables: {
        direction: 'ASC',
        ...filters
      }
    }
  )

  return (
    <Flex
      flexDirection='column'
      pt={{ base: '120px', md: '74px' }}
      pr={2}
      pl={5}
    >
      <Card overflowX={{ sm: 'scroll', xl: 'hidden' }}>
        <LicenseTable
          loading={loading}
          licenses={nodes}
          paginationProps={paginationProps}
          filters={filters}
          setFilters={(newFilters) => {
            setFilters(newFilters)
            reset()
          }}
        />
      </Card>
    </Flex>
  )
}

export default Licenses
