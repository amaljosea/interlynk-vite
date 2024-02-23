import { useQuery } from '@apollo/client'
import { WarningTwoIcon } from '@chakra-ui/icons'
import { Flex, Text } from '@chakra-ui/react'
import Card from 'components/Card/Card'
import ProductTable from 'components/Tables/ProductTable'
import { ShareLynkProjectGroups } from 'graphQL/Queries'
import { useGlobalState } from 'hooks/useGlobalState'
import { displayErrorMessage } from 'utils'

const ProductList = () => {
  const { prodState } = useGlobalState()
  const { field, direction } = prodState
  const { data, error, refetch } = useQuery(ShareLynkProjectGroups, {
    variables: { first: 25, field, direction }
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
      data={data?.shareLynkQuery?.projectGroups}
      refetch={refetch}
    />
  )
}

export default ProductList
