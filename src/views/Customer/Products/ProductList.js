import { displayErrorMessage } from 'utils/errorUtils'

import { Flex, Text } from '@chakra-ui/react'

import Card from 'components/Card/Card'
import ProductTable from 'components/Tables/ProductTable'

import { useGlobalState } from 'hooks/useGlobalState'
import { usePaginatedQuery } from 'hooks/usePaginatedQuery'
import { useThemeColor } from 'hooks/useThemeColors'

import { ShareLynkProjectGroups } from 'graphQL/Queries'

import { LuMessageCircleWarning } from 'react-icons/lu'

const ProductList = () => {
  const { prodState } = useGlobalState()
  const { primaryBlueText } = useThemeColor(['primaryBlueText'])
  const { field, direction, searchInput } = prodState

  const filters = { field, direction, search: searchInput || undefined }

  const { nodes, paginationProps, reset, loading, error } = usePaginatedQuery(
    ShareLynkProjectGroups,
    {
      selector: 'shareLynkQuery.projectGroups',
      variables: { ...filters }
    }
  )

  if (error) {
    return (
      <Card>
        <Flex alignItems={'center'} justifyContent={'center'}>
          <LuMessageCircleWarning size={18} color={primaryBlueText} />
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
      reset={reset}
      loading={loading}
      paginationProps={paginationProps}
    />
  )
}

export default ProductList
