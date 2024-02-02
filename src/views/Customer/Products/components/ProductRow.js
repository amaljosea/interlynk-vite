import { Td, Text, Tr, Switch, Skeleton } from '@chakra-ui/react'
import GlobalContext from 'context/GlobalContext'
import { useContext } from 'react'
import { Link } from 'react-router-dom'
import { timeSince, normalizeSBOMVersion } from 'utils'

function ProductRow(props) {
  const { id, sbomId, name, description, updatedAt, isLoading } = props
  const { setSignedActiveTab } = useContext(GlobalContext)

  const uniqVersions = []

  sbomId &&
    sbomId.map((project) => {
      if (project.primaryComponent) {
        uniqVersions.push({
          version: normalizeSBOMVersion(project),
          id: project.id,
          updatedAt: project.updatedAt
        })
      }
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

  filteredData?.sort((a, b) => {
    const dateA = new Date(a.updatedAt)
    const dateB = new Date(b.updatedAt)

    // Compare the dates
    return dateB - dateA
  })

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
                window.sessionStorage.setItem('product', name)
                setSignedActiveTab(0)
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
