import { useState } from 'react'
import { displayErrorMessage } from 'utils'

import { WarningTwoIcon } from '@chakra-ui/icons'
import { Flex, Text } from '@chakra-ui/react'

import Card from 'components/Card/Card'
import ProductTable from 'components/Tables/ProductTable'

import { usePaginatatedQuery } from 'hooks/usePaginatatedQuery'

import { ShareLynkProjectGroups } from 'graphQL/Queries'

const ProductList = () => {
  const [filters, setFilters] = useState({
    field: 'PROJECT_GROUPS_UPDATED_AT',
    direction: 'DESC',
    enabled: true
  })

  const { nodes, paginationProps, reset, refetch, loading, error } =
    usePaginatatedQuery(ShareLynkProjectGroups, {
      selector: 'shareLynkQuery.projectGroups',
      variables: {
        ...filters
      }
    })

  if (error) {
    return (
      <Card>
        <Flex my={24} alignItems={'center'} justifyContent={'center'}>
          <WarningTwoIcon color='blue.500' />
          <Text textAlign={'center'} fontSize={14}>
            {displayErrorMessage(error.networkError?.statusCode, error.message)}
          </Text>
        </Flex>
      </Card>
    )
  }

  return (
    <ProductTable
      data={nodes}
      loading={loading}
      refetch={refetch}
      filters={filters}
      reset={() => reset()}
      paginationProps={paginationProps}
      setFilters={(newFilters) => {
        setFilters(newFilters)
        reset()
      }}
    />
  )
}

export default ProductList
