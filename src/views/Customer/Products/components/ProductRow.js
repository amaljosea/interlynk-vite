import { Td, Text, Tr, Switch, Skeleton } from '@chakra-ui/react'
import { Link } from 'react-router-dom'
import { timeSince } from 'utils'

function ProductRow(props) {
  const { id, sbomId, name, description, updatedAt, isLoading } = props

  const uniqVersions = []

  sbomId &&
    sbomId.map((project) => {
      project.components.nodes.map((sbom) => {
        if (sbom.primary === true) {
          uniqVersions.push({
            version: sbom.version,
            id: project.id,
            updatedAt: project.updatedAt
          })
        }
      })
    })

  const removeDuplicatesAndLatest = (arr) => {
    const uniqueVersions = {}

    for (const item of arr) {
      if (
        !uniqueVersions[item.version] ||
        item.updatedAt > uniqueVersions[item.version].updatedAt
      ) {
        uniqueVersions[item.version] = item
      }
    }

    return Object.values(uniqueVersions)
  }

  const filteredData =
    uniqVersions.length > 0 ? removeDuplicatesAndLatest(uniqVersions) : []

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
              to={`/customer/products?p=${id}&sbom=${
                filteredData.length > 0 ? filteredData[0].id : sbomId[0].id
              }`}
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
            <Text>{filteredData?.length}</Text>
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
