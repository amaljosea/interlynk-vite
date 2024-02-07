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
import { normalizeSBOMVersion } from 'utils'
import { useLazyQuery } from '@apollo/client'
import { GetProjectGroup } from 'graphQL/Queries'

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

const VulnProdTable = ({ data, vuln, refetch }) => {
  const params = useParams()
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const id = queryParams.get('vulnId')

  const { totalRows, setTotalRows, compVulnState, dispatch } = useGlobalState()
  const { pageIndex, searchInput, envs, statuses, versions } = compVulnState
  const { compVulnDispatch } = dispatch

  const { isOpen, onOpen, onClose } = useDisclosure()

  const [selectedVulns, setSelectedVulns] = useState([])
  const [selectedGroup, setSelectedGroup] = useState('')
  const [filterInput, setFilterInput] = useState('')
  const [toggleClear, setToggleClear] = useState(false)
  const [isPrevActive, setIsPrevActive] = useState(false)
  const [isNextActive, setIsNextActive] = useState(false)

  const setPaginationControl = (data) => {
    setIsPrevActive(data?.pageInfo?.hasPreviousPage)
    setIsNextActive(data?.pageInfo?.hasNextPage)
  }

  const disablePaginationControl = () => {
    setIsPrevActive(false)
    setIsNextActive(false)
  }

  // COLUMNS
  const columns = [
    // PRODUCTS
    {
      id: 'PRODUCT_GROUP',
      name: 'PRODUCT',
      selector: (row) => {
        const { component } = row
        return <Text>{component?.sbom?.project?.projectGroup?.name || ''}</Text>
      },
      wrap: true,
      width: '15%',
      omit: params?.name ? true : false
    },
    // VERSION
    {
      id: 'PRODUCT_VERSIONN',
      name: 'VERSION',
      selector: (row) => (
        <Tooltip label={row?.component?.sbom?.projectVersion} placement='top'>
          <Text my={2} textAlign={'right'}>
            {row?.component?.sbom?.projectVersion}
          </Text>
        </Tooltip>
      ),
      wrap: true,
      right: 'true',
      width: '10%'
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
      right: 'true',
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
    if (event.key === 'Enter' && filterInput !== '') {
      refetch({
        id,
        first: totalRows,
        last: undefined,
        search: value,
        projectNames: envs?.length === 0 ? undefined : envs,
        versions: versions?.length === 0 ? undefined : versions,
        statuses: statuses?.length === 0 ? undefined : statuses
      }).then(
        (res) =>
          res.data &&
          compVulnDispatch({ type: 'CHANGE_SEARCH_INPUT', payload: value })
      )
    }
  }

  // CLEAR SERACH
  const handleClear = async () => {
    setFilterInput('')
    await refetch({
      id,
      first: totalRows,
      last: undefined,
      search: undefined,
      projectNames: envs?.length === 0 ? undefined : envs,
      versions: versions?.length === 0 ? undefined : versions,
      statuses: statuses?.length === 0 ? undefined : statuses
    }).then(
      (res) => res.data && compVulnDispatch({ type: 'CLEAR_SEARCH_INPUT' })
    )
  }

  // ON SEARCH INPUT CHANGE
  const onSearchInputChange = (e) => {
    const { value } = e.target
    if (value === '') {
      handleClear()
    } else {
      setFilterInput(value)
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
            filterText={filterInput}
            onFilter={handleSearch}
            onClear={handleClear}
            onChange={onSearchInputChange}
          />

          <Filters data={vuln} refetch={refetch} />
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
    filterInput,
    onSearchInputChange,
    handleClear,
    handleSearch
  ])

  const areArraysEqual = (arr1, arr2) => {
    // Check if the arrays have the same length
    if (arr1.length !== arr2.length) {
      return false
    }

    // Check if all elements in both arrays are equal
    return arr1.every((element, index) => element === arr2[index])
  }

  const [checkEquals, setCheckEquals] = useState(false)

  const handleChange = (state) => {
    setSelectedVulns(state?.selectedRows)
    const version =
      state?.selectedRows[0]?.component?.sbom?.primaryComponent?.version
    const versionData = state.selectedRows.map(
      (item) => item?.component?.sbom?.primaryComponent?.version
    )
    const sameData = versionData.filter((item) => item === version)
    const checkEquality = areArraysEqual(versionData, sameData)
    setCheckEquals(checkEquality)
    if (checkEquality) {
      setSelectedGroup(
        state?.selectedRows[0]?.component?.sbom?.project?.projectGroup?.id
      )
    } else {
      setSelectedGroup('')
    }
  }

  // ON PREV PAGE
  const handlePreviousPage = async () => {
    disablePaginationControl()
    await refetch({
      id,
      first: undefined,
      last: totalRows,
      after: undefined,
      before: data?.pageInfo?.startCursor,
      search: searchInput !== '' ? searchInput : undefined,
      projectNames: envs?.length === 0 ? undefined : envs,
      versions: versions?.length === 0 ? undefined : versions,
      statuses: statuses?.length === 0 ? undefined : statuses
    }).then((res) => {
      if (res.data) {
        const project = res?.data?.componentVulns
        setPaginationControl(project)
        compVulnDispatch({
          type: 'DECREMENT_PAGE',
          payload: project?.pageInfo.startCursor
        })
      }
    })
  }

  // ON NEXT PAGE
  const handleNextPage = async () => {
    disablePaginationControl()
    await refetch({
      id,
      first: totalRows,
      last: undefined,
      after: data?.pageInfo?.endCursor,
      before: undefined,
      search: searchInput !== '' ? searchInput : undefined,
      projectNames: envs?.length === 0 ? undefined : envs,
      versions: versions?.length === 0 ? undefined : versions,
      statuses: statuses?.length === 0 ? undefined : statuses
    }).then((res) => {
      if (res.data) {
        const project = res?.data?.componentVulns
        setPaginationControl(project)
        compVulnDispatch({
          type: 'INCREMENT_PAGE',
          payload: {
            total: project?.totalCount,
            after: project?.pageInfo.endCursor
          }
        })
      }
    })
  }

  // ON SET ROW
  const handleSetRow = async (e) => {
    const { value } = e.target
    setTotalRows(Number(value))
    await refetch({
      id,
      first: Number(value),
      last: undefined
    }).then((res) => {
      if (res.data) {
        compVulnDispatch({
          type: 'FETCH_DATA_SUCCESS'
        })
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
          checkEquals={checkEquals}
          selectedGroup={selectedGroup}
          selectedVulns={selectedVulns}
          setSelectedVulns={setSelectedVulns}
          setToggleClear={setToggleClear}
        />
      )}
    </>
  )
}

export default VulnProdTable
