import { useCallback, useMemo, useState } from 'react'
import DataTable from 'react-data-table-component'
import { useParams } from 'react-router-dom'
import { getFullDate, timeSince } from 'utils'
import { customStyles } from 'utils/styleUtils'
import Filters from 'views/Dashboard/Policies/components/Filters'
import ExpandedComponent from 'views/Dashboard/Products/ProductDetailsSbomNew/Components/tableExpanded/PolicyExpanded'

import {
  Flex,
  Tag,
  TagLabel,
  Text,
  Tooltip,
  useDisclosure
} from '@chakra-ui/react'

import CustomLoader from 'components/CustomLoader'
import ViolationDrawer from 'components/Drawer/ViolationDrawer'
import RefreshBtn from 'components/Icons/RefreshBtn'
import Pagination from 'components/Pagination'

import { usePaginatedQuery } from 'hooks/usePaginatedQuery'
import { useThemeColor } from 'hooks/useThemeColors'

import { GetPolicyResults } from 'graphQL/Queries'

const PolicyResultsTable = () => {
  const params = useParams()
  const policyId = params.policyid

  const { headingTextColor, primaryTextColor } = useThemeColor([
    'headingTextColor',
    'primaryTextColor'
  ])

  const [filters, setFilters] = useState({
    result: [],
    projectGroupIds: [],
    projectName: [],
    projectVersion: []
  })
  const [activeRule, setActiveRule] = useState(null)
  const [activePolicy, setActivePolicy] = useState(null)

  const { isOpen, onOpen, onClose } = useDisclosure()

  const { nodes, paginationProps, reset, loading } = usePaginatedQuery(
    GetPolicyResults,
    {
      skip: policyId ? false : true,
      selector: 'policyResults',
      variables: { policyId: [policyId], ...filters }
    }
  )

  const onCheckViolations = useCallback(
    (data, rule) => {
      setActivePolicy(data)
      setActiveRule(rule)
      onOpen()
    },
    [onOpen]
  )

  // SUB HEADER
  const subHeader = useMemo(() => {
    const onFilter = (newFilters) => {
      setFilters(newFilters)
      reset()
    }

    return (
      <Flex w={'100%'} alignItems={'center'} justifyContent={'space-between'}>
        <Filters filters={filters} setFilters={onFilter} />
        <RefreshBtn />
      </Flex>
    )
  }, [filters, reset])

  const columns = [
    // PRODUCTS
    {
      id: 'PRODUCT_GROUP',
      name: 'PRODUCT',
      selector: (row) => {
        return (
          <Text color={primaryTextColor}>
            {row?.sbom?.project?.projectGroup?.name || ''}
          </Text>
        )
      },
      wrap: true,
      width: '15%'
    },
    // VERSION
    {
      id: 'PRODUCT_VERSIONN',
      name: 'VERSION',
      selector: (row) => (
        <Text color={primaryTextColor} my={2} textAlign={'right'}>
          {row?.sbom?.projectVersion}
        </Text>
      ),
      wrap: true,
      right: 'true'
    },
    // ENV
    {
      id: 'ENVIRONMENT',
      name: 'ENVIRONMENT',
      selector: (row) => {
        return (
          <Text color={primaryTextColor} textTransform={'capitalize'}>
            {row?.sbom?.project?.name || ''}
          </Text>
        )
      },
      wrap: true
    },
    // RESULT
    {
      id: 'RESULT',
      name: 'RESULT',
      selector: (row) => {
        return <Text color={primaryTextColor}>{row?.resultWording}</Text>
      },
      wrap: true
    },
    // VIOLATION
    {
      id: 'VIOLATION',
      name: 'VIOLATION',
      selector: (row) => {
        const { violationsCount } = row
        return (
          <Tag
            size='md'
            width={'100px'}
            colorScheme={violationsCount === 0 ? 'blue' : 'red'}
          >
            <TagLabel mx={'auto'} as={Flex} gap={2} alignItems='center'>
              {violationsCount}
            </TagLabel>
          </Tag>
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
      right: 'true',
      wrap: true
    }
  ]

  return (
    <>
      {/* TABLE */}
      <Flex flexDir={'column'} width={'100%'}>
        <DataTable
          subHeader
          responsive
          expandableRows
          persistTableHead
          columns={columns}
          data={nodes || []}
          expandOnRowClicked
          progressPending={loading}
          subHeaderComponent={subHeader}
          progressComponent={<CustomLoader />}
          customStyles={customStyles(headingTextColor)}
          expandableRowsComponent={ExpandedComponent}
          expandableRowsComponentProps={{
            onCheckViolations
          }}
        />
        <Pagination {...paginationProps} />
      </Flex>

      {isOpen && (
        <ViolationDrawer
          isOpen={isOpen}
          onClose={onClose}
          activeRow={activeRule}
          sbomId={activePolicy?.sbom?.id || ''}
          policy={activePolicy?.policy?.name || ''}
        />
      )}
    </>
  )
}

export default PolicyResultsTable
