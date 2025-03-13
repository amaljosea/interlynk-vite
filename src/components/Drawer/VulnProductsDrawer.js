import { gql } from '@apollo/client'
import { useMemo } from 'react'
import DataTable from 'react-data-table-component'
import { getFullDate, timeSince } from 'utils'
import { customStyles } from 'utils/styleUtils'

import { Flex, Tag, Text, Tooltip } from '@chakra-ui/react'

import CustomLoader from 'components/CustomLoader'
import LynkDrawer from 'components/LynkDrawer'
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
  const { headingTextColor, primaryTextColor } = useThemeColor([
    'headingTextColor',
    'primaryTextColor'
  ])
  const { envName } = useGlobalState()
  const { nodes, paginationProps, loading } = usePaginatedQuery(
    GetCompVulnData,
    {
      skip: !data?.id,
      selector: 'componentVulns',
      variables: { id: data?.id, projectNames: [envName] }
    }
  )

  const statusResults = useMemo(() => {
    if (!nodes) return []

    // Create a Map to store unique projectGroup names since components and versions are not listed
    const uniqueNodes = new Map()

    nodes.forEach((node) => {
      const projectGroupName =
        node?.component?.sbom?.project?.projectGroup?.name
      if (projectGroupName && !uniqueNodes.has(projectGroupName)) {
        uniqueNodes.set(projectGroupName, node)
      }
    })

    return [...uniqueNodes.values()].sort(
      (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
    )
  }, [nodes])

  const columns = [
    // PRODUCTS
    {
      id: 'PRODUCT_GROUP',
      name: 'PRODUCT',
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
      <DataTable
        responsive
        persistTableHead
        columns={columns}
        progressPending={loading}
        data={statusResults}
        progressComponent={<CustomLoader />}
        className='data-table-container'
        customStyles={customStyles(headingTextColor)}
      />
      <Pagination {...paginationProps} />
    </LynkDrawer>
  )
}

export default VulnProductsDrawer
