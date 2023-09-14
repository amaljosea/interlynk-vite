import { Td, Text, Tr, Switch, Skeleton } from '@chakra-ui/react'
import { Link } from 'react-router-dom'
import { timeSince } from 'utils'

function ProductRow(props) {
  const { id, sbomId, name, active, description, updatedAt, isLoading } = props

  return (
    <>
      <Tr>
        <Td pl={0}>
          {isLoading ? (
            <Skeleton height='20px' my={2} />
          ) : (
            <Switch size='md' defaultChecked />
          )}
        </Td>
        <Td pl={0}>
          {isLoading ? (
            <Skeleton height='20px' />
          ) : sbomId.length > 0 ? (
            <Link
              to={`/customer/products?p=${id}&sbom=${sbomId[0].id}`}
              onClick={() => {
                window.localStorage.setItem('product', name)
              }}
            >
              <Text color={'blue.500'} minWidth='100%'>
                {name}
              </Text>
            </Link>
          ) : (
            <Text
              color={'blue.500'}
              minWidth='100%'
              onClick={() => window.location.reload()}
              cursor={'pointer'}
            >
              {name}
            </Text>
          )}
        </Td>
        <Td pl={0}>
          {isLoading ? (
            <Skeleton height='20px' />
          ) : (
            <Text>{sbomId.length}</Text>
          )}
        </Td>
        <Td pl={0}>{isLoading ? <Skeleton height='20px' /> : description}</Td>
        <Td pl={0}>
          {isLoading ? <Skeleton height='20px' /> : timeSince(updatedAt)}
        </Td>
      </Tr>
    </>
  )
}

export default ProductRow
