import { gql } from '@apollo/client'
import { useMemo } from 'react'
import { getFullDate, timeSince } from 'utils'

import { Flex, Tag, Text, Tooltip } from '@chakra-ui/react'

import LynkDrawer from 'components/LynkDrawer'
import LynkTable from 'components/LynkTable'
import Pagination from 'components/Pagination'

import { useGlobalState } from 'hooks/useGlobalState'
import { usePaginatedQuery } from 'hooks/usePaginatedQuery'
import { useThemeColor } from 'hooks/useThemeColors'

const GetProjectGroupsWithVulnerability = gql`
  query ProjectGroupsWithVulnerability(
    $vulnId: String!
    $environment: EnvironmentEnum
    $first: Int
    $after: String
    $last: Int
    $before: String
  ) {
    organization {
      projectGroups(
        after: $after
        before: $before
        first: $first
        last: $last
      ) {
        totalCount
        pageInfo {
          hasNextPage
          endCursor
          hasPreviousPage
          startCursor
        }
        nodes {
          id
          name
          updatedAt
          projects(vulnerabilityId: $vulnId, environment: $environment) {
            id
            name
            description
            enabled
            updatedAt
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
    GetProjectGroupsWithVulnerability,
    {
      variables: {
        vulnId: data?.vulnId || '',
        environment: envName
      },
      skip: !data?.vulnId || !envName,
      selector: 'organization.projectGroups'
    }
  )

  const filteredNodes = useMemo(() => {
    return nodes?.filter((group) => group?.projects?.length > 0)
  }, [nodes])

  const columns = [
    // PRODUCTS
    {
      id: 'PRODUCT_GROUP',
      name: 'PRODUCT',
      compact: true,
      selector: (row) => {
        const { name } = row
        return (
          <Flex flexDir={'row'} my={3} gap={2} alignItems={'center'}>
            <Text color={primaryTextColor}>{name || ''}</Text>
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
        data={filteredNodes}
        className='data-table-container'
      />
      <Pagination
        {...paginationProps}
        totalCount={filteredNodes?.length || 0}
      />
    </LynkDrawer>
  )
}

export default VulnProductsDrawer
