import { useState } from 'react'
import OrgRegister from 'views/Dashboard/Profile/components/OrgRegister'

import { Flex } from '@chakra-ui/react'

import Card from 'components/Card/Card'
import SupportTable from 'components/Tables/SupportTable'

import { usePaginatatedQuery } from 'hooks/usePaginatatedQuery'

import { GetSupportTab } from 'graphQL/Queries'

const Support = () => {
  const org = localStorage.getItem('organization')

  const [filters, setFilters] = useState({
    field: 'COMPONENT_SUPPORT_OVERRIDES_UPDATED_AT',
    direction: 'DESC'
  })

  const { nodes, paginationProps, reset, loading, refetch } =
    usePaginatatedQuery(GetSupportTab, {
      skip: org !== 'undefined' ? false : true,
      selector: 'supports',
      variables: {
        ...filters
      }
    })

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
        <Card>
          <SupportTable
            loading={loading}
            data={nodes}
            refetch={refetch}
            paginationProps={paginationProps}
            filters={filters}
            setFilters={(newFilters) => {
              setFilters(newFilters)
              reset()
            }}
          />
        </Card>
      )}
    </Flex>
  )
}

export default Support
