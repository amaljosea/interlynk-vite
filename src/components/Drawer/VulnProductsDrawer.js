import { gql } from '@apollo/client'
import { useMemo } from 'react'
import { getFullDate, timeSince } from 'utils'
import { getUniqueAffectedProducts } from 'utils/getUniqueAffectedProducts'

import { Flex, Tag, Text, Tooltip } from '@chakra-ui/react'

import LynkDrawer from 'components/LynkDrawer'
import LynkTable from 'components/LynkTable'
import Pagination from 'components/Pagination'

import { useGlobalState } from 'hooks/useGlobalState'
import { usePaginatedQuery } from 'hooks/usePaginatedQuery'
import { useThemeColor } from 'hooks/useThemeColors'

const GetCompVulnData = gql`
  query GetCompVulnData(
    $id: Uuid!
    $first: Int
    $last: Int
    $after: String
    $before: String
    $projectNames: [String!]
  ) {
    componentVulns(
      vulnId: $id
      after: $after
      first: $first
      before: $before
      last: $last
      projectNames: $projectNames
    ) {
      totalCount
      pageInfo {
        endCursor
        hasNextPage
        hasPreviousPage
        startCursor
      }
      nodes {
        id
        updatedAt
        component {
          sbom {
            project {
              projectGroup {
                id
                name
              }
            }
          }
        }
      }
    }
  }
`

const VulnProductsDrawer = ({ isOpen, onClose, data }) => {
  const { primaryTextColor } = useThemeColor(['primaryTextColor'])
  const { envName } = useGlobalState()
  const { nodes, paginationProps, loading } = usePaginatedQuery(
    GetCompVulnData,
    {
      skip: !data?.id,
      selector: 'componentVulns',
      variables: { id: data?.id, projectNames: [envName] }
    }
  )

  const statusResults = useMemo(() => getUniqueAffectedProducts(nodes), [nodes])

  const columns = [
    // PRODUCTS
    {
      id: 'PRODUCT_GROUP',
      name: 'PRODUCT',
      compact: true,
      selector: (row) => {
        const { component } = row
        return (
          <Flex flexDir={'row'} my={3} gap={2} alignItems={'center'}>
            <Text color={primaryTextColor}>
              {component?.sbom?.project?.projectGroup?.name || ''}
            </Text>
          </Flex>
        )
      },
      wrap: true
    },

    // UPDATED AT
    {
      id: 'VEX_UPDATED_AT',
      name: 'UPDATED',
      compact: true,
      selector: (row) => (
        <Tooltip label={getFullDate(row?.updatedAt)} placement={'top'}>
          <Text color={primaryTextColor}>{timeSince(row?.updatedAt)}</Text>
        </Tooltip>
      ),

      right: true,
      wrap: true
    }
  ]

  return (
    <LynkDrawer
      title={'Affected Products'}
      subtitle={data && <Tag colorScheme='blue'>{data.vulnId}</Tag>}
      isOpen={isOpen}
      onClose={onClose}
      noFooter
    >
      <LynkTable
        columns={columns}
        progressPending={loading}
        data={statusResults}
        className='data-table-container'
      />
      <Pagination {...paginationProps} totalCount={statusResults?.length} />
    </LynkDrawer>
  )
}

export default VulnProductsDrawer
