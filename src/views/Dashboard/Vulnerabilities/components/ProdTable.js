// Chakra imports
import {
  Flex,
  Text,
  Tag,
  TagLabel,
  Tooltip,
  Button,
  useDisclosure,
  Select,
  Stack,
  Box
} from '@chakra-ui/react'
import DataTable from 'react-data-table-component'
import { useEffect, useMemo, useState } from 'react'
import CustomLoader from 'components/CustomLoader'
import Filters from './Filters'
import { useGlobalState } from 'hooks/useGlobalState'
import VexModal from './VexModal'
import { useLocation, useParams } from 'react-router-dom'
import SearchFilter from 'views/Sbom/components/SearchFilter'

const customStyles = {
  headCells: {
    style: {
      fontWeight: 'bold',
      color: '#2D3748',
      fontSize: '12px',
      letterSpacing: '1px'
    }
  },
  subHeader: {
    style: {
      padding: 0,
      margin: 0
    }
  }
}

const statusColor = (status) => {
  if (status && status === 'Fixed') {
    return 'blue'
  } else if (status && status === 'Not Affected') {
    return 'green'
  } else if (status && status === 'Affected') {
    return 'red'
  } else if (status && status === 'False Positive') {
    return 'purple'
  } else if (status && status === 'In Triage') {
    return 'cyan'
  } else {
    return 'gray'
  }
}

const VulnProdTable = ({ data, refetch }) => {
  const params = useParams()
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const id = queryParams.get('id')
  const { totalRows, setTotalRows } = useGlobalState()

  const { isOpen, onOpen, onClose } = useDisclosure()
  const [selectedVulns, setSelectedVulns] = useState([])
  const [pageIndex, setPageIndex] = useState(1)
  const [searchInput, setSearchInput] = useState('')
  const [isPrevActive, setIsPrevActive] = useState(false)
  const [isNextActive, setIsNextActive] = useState(false)
  const [toggleClear, setToggleClear] = useState(false)

  // COLUMNS
  const columns = [
    // PRODUCTS
    {
      id: 'PRODUCT_GROUP',
      name: 'PRODUCT',
      selector: (row) => {
        const { component } = row
        return (
          <Text textTransform={'capitalize'}>
            {component?.sbom?.project?.projectGroup?.name || ''}
          </Text>
        )
      },
      wrap: true,
      width: '15%'
    },
    // ENV
    {
      id: 'ENVIRONMENT',
      name: 'ENVIRONMENT',
      selector: (row) => {
        const { component } = row
        return (
          <Text textTransform={'capitalize'}>
            {component?.sbom?.project?.name || ''}
          </Text>
        )
      },
      wrap: true,
      width: '12%'
    },
    // VERSION
    {
      id: 'PRODUCT_VERSIONN',
      name: 'VERSION',
      selector: (row) => (
        <Tooltip
          label={row?.component?.sbom?.primaryComponent?.version || ''}
          placement='top'
        >
          {row?.component?.sbom?.primaryComponent?.version || ''}
        </Tooltip>
      ),
      wrap: true,
      width: '10%'
    },
    // VULN COMPONENT
    {
      id: 'COMPONENTS_NAME',
      name: 'COMPONENT',
      selector: (row) => {
        const { component } = row
        return (
          <Tooltip label={component?.name} placement='top'>
            <Text textTransform={'capitalize'}>{component?.name || ''}</Text>
          </Tooltip>
        )
      },
      wrap: true,
      width: '25%'
    },
    // VULN VERSION
    {
      id: 'COMPONENTS_VERSION',
      name: 'VERSION',
      selector: (row) => (
        <Tooltip label={row?.component?.version} placement='top'>
          {row?.component?.version || ''}
        </Tooltip>
      ),
      wrap: true,
      width: '12%'
    },
    // STATUS
    {
      id: 'VEX_STATUSES_NAME',
      name: 'STATUS',
      selector: (row) => {
        const { vexStatus } = row
        return (
          <Tag
            size='md'
            variant='solid'
            width={'130px'}
            colorScheme={statusColor(vexStatus?.name || 'Unspecified')}
          >
            <TagLabel style={{ textTransform: 'capitalize' }} mx={'auto'}>
              {vexStatus?.name || 'Unspecified'}
            </TagLabel>
          </Tag>
        )
      },
      wrap: true,
      right: 'true'
    }
  ]

  // SEARCH COMPONENT
  const handleSearch = async (event) => {
    const { value } = event.target
  }

  // CLEAR SERACH
  const handleClear = async () => {
    setSearchInput('')
  }

  // ON SEARCH INPUT CHANGE
  const onSearchInputChange = (e) => {
    const { value } = e.target
    if (value === '') {
      handleClear()
    } else {
      setSearchInput(value)
    }
  }

  const subHeaderComponent = useMemo(() => {
    return (
      <Flex
        width={'100%'}
        alignItems={'center'}
        justifyContent={'space-between'}
      >
        {/* FILTER */}
        <Stack spacing={4} alignItems={'center'} direction={'row'}>
          <SearchFilter
            id='globalVulns'
            filterText={searchInput}
            onFilter={handleSearch}
            onClear={handleClear}
            onChange={onSearchInputChange}
          />

          <Filters />
        </Stack>

        {/* UPDATE STATUES */}
        {selectedVulns.length > 0 && (
          <Button
            variant='solid'
            colorScheme='blue'
            fontWeight='normal'
            fontSize={'sm'}
            onClick={onOpen}
          >
            Set Status
          </Button>
        )}
      </Flex>
    )
  }, [
    selectedVulns,
    searchInput,
    onSearchInputChange,
    handleClear,
    handleSearch
  ])

  const handleChange = (state) => {
    setSelectedVulns(state.selectedRows)
  }

  // ON PREV PAGE
  const handlePreviousPage = async () => {
    setIsPrevActive(false)
    await refetch({
      variables: {
        id,
        first: undefined,
        last: totalRows,
        after: undefined,
        before: data?.pageInfo?.startCursor
      }
    }).then((res) => {
      if (res.data) {
        const project = params?.name
          ? res?.data?.projectGroup?.componentVulns
          : res?.data?.vuln?.componentVulns
        setPageIndex((index) => index !== 0 && index - 1)
        setIsPrevActive(project?.pageInfo?.hasPreviousPage)
      }
    })
  }

  // ON NEXT PAGE
  const handleNextPage = async () => {
    setIsNextActive(false)
    await refetch({
      variables: {
        id,
        first: totalRows,
        last: undefined,
        after: data?.pageInfo?.endCursor,
        before: undefined
      }
    }).then((res) => {
      if (res.data) {
        const project = params?.name
          ? res?.data?.projectGroup?.componentVulns
          : res?.data?.vuln?.componentVulns
        setPageIndex(
          (index) => index < Math.ceil(project?.totalCount) && index + 1
        )
        setIsNextActive(project?.pageInfo?.hasNextPage)
      }
    })
  }

  // ON SET ROW
  const handleSetRow = async (e) => {
    const { value } = e.target
    setTotalRows(Number(value))
    await refetch({
      variables: {
        id,
        first: Number(value),
        last: undefined,
        after: undefined,
        before: undefined
      }
    }).then((res) => {
      if (res.data) {
        setPageIndex(1)
      }
    })
  }

  useEffect(() => {
    if (data) {
      setIsPrevActive(data?.pageInfo?.hasPreviousPage)
      setIsNextActive(data?.pageInfo?.hasNextPage)
    }
  }, [data])

  return (
    <>
      {/* TABLE */}
      <Flex flexDir={'column'} width={'100%'}>
        <DataTable
          columns={columns}
          data={data?.nodes || []}
          customStyles={customStyles}
          progressPending={data ? false : true}
          progressComponent={<CustomLoader />}
          subHeader
          subHeaderComponent={subHeaderComponent}
          responsive
          persistTableHead
          selectableRows
          clearSelectedRows={toggleClear}
          onSelectedRowsChange={handleChange}
        />

        {data && (
          <Flex
            width={'100%'}
            flexDir={'row'}
            gap={4}
            alignItems={'center'}
            mt={6}
            justifyContent={'space-between'}
            flexWrap={'wrap'}
          >
            <Stack alignItems={'center'} direction={'row'} spacing={4}>
              <Button
                colorScheme='blue'
                onClick={handlePreviousPage}
                isDisabled={!isPrevActive}
              >
                Prev
              </Button>
              <Button
                colorScheme='blue'
                onClick={handleNextPage}
                isDisabled={!isNextActive}
              >
                Next
              </Button>
              <Box>
                Page {pageIndex} of{' '}
                {data.totalCount === 0
                  ? 1
                  : Math.ceil(data.totalCount / totalRows)}
              </Box>
            </Stack>

            <Stack alignItems={'center'} direction={'row'} spacing={4}>
              <Text>Show</Text>
              <Select
                width={20}
                value={totalRows}
                onChange={handleSetRow}
                id='rowlimit'
                name='rowlimit'
              >
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </Select>
            </Stack>
          </Flex>
        )}
      </Flex>

      {isOpen && selectedVulns.length > 0 && (
        <VexModal
          isOpen={isOpen}
          onClose={onClose}
          refetch={refetch}
          selectedVulns={selectedVulns}
          setSelectedVulns={setSelectedVulns}
          setPageIndex={setPageIndex}
          setToggleClear={setToggleClear}
        />
      )}
    </>
  )
}

export default VulnProdTable
