import { useLazyQuery, useMutation, useQuery } from '@apollo/client'
import { RepeatIcon } from '@chakra-ui/icons'
import {
  Flex,
  IconButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Portal,
  Stack,
  Text,
  Tooltip,
  Tag,
  useDisclosure,
  UnorderedList,
  Button,
  ListItem,
  Spinner,
  TagLabel
} from '@chakra-ui/react'
import CustomLoader from 'components/CustomLoader'
import ProductSbomDrawer from 'components/Drawer/ProductSbomDrawer'
import VulnBadge from 'components/Misc/VulnBadge'
import { sbomDelete } from 'graphQL/Mutation'
import { useGlobalState } from 'hooks/useGlobalState'
import { useCallback, useEffect, useMemo, useState } from 'react'
import DataTable from 'react-data-table-component'
import {
  FaCodeCompare,
  FaScrewdriverWrench,
  FaEllipsisVertical
} from 'react-icons/fa6'
import { Link, useLocation, useParams } from 'react-router-dom'
import ToolsDrawer from 'components/Drawer/ToolsDrawer'
import SbomList from 'views/Dashboard/Products/components/SbomList'
import SearchFilter from 'views/Sbom/components/SearchFilter'
import Pagination from '../Pagination'
import {
  GetVersionsTable,
  ShareVersionTable,
  GetSbomAlternatives,
  GetSbomDrift,
  GetSbomVersions,
  GetShareSbomAlternatives,
  GetShareSbomVersions,
  GetShareSbomDrift
} from 'graphQL/Queries'
import {
  timeSince,
  getFullDateAndTime,
  customStyles,
  sortByUpdatedAt
} from 'utils'

const VersionsTable = ({ projectGroup, getVulnData }) => {
  const location = useLocation()
  const path = location?.pathname?.startsWith('/vendor') ? 'vendor' : 'customer'
  const signedUrlParams = sessionStorage.getItem('signedUrlParams')
  const activeProd = localStorage.getItem(
    signedUrlParams ? 'publicEnv' : 'activeEnv'
  )

  const {
    userPermissions,
    activeProdTab,
    setActiveSbomTab,
    prodVulnState,
    setClearSelect,
    clearSelect,
    selectedSbom,
    setSelectedSbom,
    versionState,
    dispatch
  } = useGlobalState()
  const { searchInput } = versionState
  const { field, direction } = prodVulnState
  const { prodVulnDispatch, prodCompDispatch, versionDispatch } = dispatch

  const paginationSizes = [25, 50, 100]
  const [totalRows, setTotalRows] = useState(paginationSizes[0])
  const [filterText, setFilterText] = useState(searchInput)
  const [isPrevActive, setIsPrevActive] = useState(false)
  const [isNextActive, setIsNextActive] = useState(false)
  const [loading, setLoading] = useState(false)
  const [drifts, setDrifts] = useState([])

  const versionData = {
    id: activeProd,
    field: versionState?.field,
    direction: versionState?.direction
  }

  const [getAlternatives, { data: sbomAlts }] = useLazyQuery(
    signedUrlParams ? GetShareSbomAlternatives : GetSbomAlternatives,
    { fetchPolicy: 'network-only' }
  )
  const [getVersions, { data: allVersions }] = useLazyQuery(
    signedUrlParams ? GetShareSbomVersions : GetSbomVersions,
    {
      fetchPolicy: 'network-only'
    }
  )
  const [getDrift, { data: driftData }] = useLazyQuery(
    signedUrlParams ? GetShareSbomDrift : GetSbomDrift,
    {
      fetchPolicy: 'network-only'
    }
  )

  const { data, refetch, error } = useQuery(
    signedUrlParams ? ShareVersionTable : GetVersionsTable,
    {
      skip: activeProdTab === 0 && !isToolOpen ? false : true,
      fetchPolicy: 'network-only',
      variables: {
        ...versionData,
        first: totalRows,
        search: searchInput !== '' ? searchInput : undefined
      },
      onCompleted: () => setClearSelect(false)
    }
  )

  const versions = signedUrlParams
    ? data?.shareLynkQuery?.project?.sbomVersions
    : data?.project?.sbomVersions

  //This part is needed for the pagination to work. (Modify with caution)

  useEffect(() => {
    if (versions) {
      setIsPrevActive(versions?.pageInfo?.hasPreviousPage)
      setIsNextActive(versions?.pageInfo?.hasNextPage)
    }
  }, [versions])

  const setPaginationControl = (data) => {
    setIsPrevActive(data.project?.sbomVersions?.pageInfo?.hasPreviousPage)
    setIsNextActive(data.project?.sbomVersions?.pageInfo?.hasNextPage)
  }

  const disablePaginationControl = () => {
    setIsPrevActive(false)
    setIsNextActive(false)
  }
  //end

  const handleNextPage = useCallback(async () => {
    disablePaginationControl()
    setCurrentPage(currentPage + 1)

    await refetch({
      ...versionData,
      first: totalRows,
      last: undefined,
      after: versions.pageInfo.endCursor,
      before: undefined
    }).then((res) => {
      if (res.data) {
        setPaginationControl(res.data)
      }
    })
  }, [refetch, totalRows, versions, currentPage])

  const handlePreviousPage = useCallback(async () => {
    disablePaginationControl()
    setCurrentPage(currentPage - 1)
    await refetch({
      ...versionData,
      first: undefined,
      last: totalRows,
      after: undefined,
      before: versions.pageInfo.startCursor
    }).then((res) => {
      if (res.data) {
        setPaginationControl(res.data)
      }
    })
  }, [refetch, totalRows, versions, currentPage])

  const handleSetRow = useCallback(
    async (e) => {
      const newTotalRows = Number(e.target.value)
      setCurrentPage(1)
      setTotalRows(newTotalRows)
      disablePaginationControl()
      await refetch({
        ...versionData,
        first: newTotalRows,
        last: undefined,
        after: undefined,
        before: undefined
      }).then((res) => {
        if (res.data) {
          setPaginationControl(res.data)
        }
      })
    },
    [refetch, setTotalRows]
  )

  const sbom = userPermissions?.find((item) => item.key === 'view_sbom')
  const createSbom = sbom?.supersededBy?.some(
    (permission) =>
      permission.key === 'create_sbom' && permission.value === true
  )
  const archiveSbom = sbom?.supersededBy?.some(
    (permission) =>
      permission.key === 'archive_sbom' && permission.value === true
  )

  const params = useParams()
  const [isLoading, setIsLoading] = useState(false)
  const [activeRow, setActiveRow] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)

  const [deleteSbom] = useMutation(sbomDelete)

  const {
    isOpen: isToolOpen,
    onOpen: onToolOpen,
    onClose: onToolClose
  } = useDisclosure()

  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose
  } = useDisclosure()

  const {
    isOpen: isListOpen,
    onOpen: onListOpen,
    onClose: onListClose
  } = useDisclosure()

  const {
    isOpen: isSbomOpen,
    onOpen: onSbomOpen,
    onClose: onSbomClose
  } = useDisclosure()

  const onFilterSev = async (id, version, value) => {
    await getVulnData({
      projectId: signedUrlParams ? undefined : activeProd,
      sbomId: id,
      severity: value,
      first: totalRows,
      last: undefined,
      after: undefined,
      before: undefined,
      field: signedUrlParams ? undefined : field,
      direction: signedUrlParams ? undefined : direction
    }).then((res) => {
      if (res.data) {
        localStorage.setItem(
          'currentSBOM',
          JSON.stringify({ version: version, id: id })
        )
        if (signedUrlParams) {
          localStorage.setItem('activeCsSbomTab', 2)
        } else {
          localStorage.setItem('activeSbomTab', 3)
        }
        prodVulnDispatch({ type: 'FILTER_SEVERITY', payload: value })
      }
    })
  }

  const handleListSbom = (row) => {
    getAlternatives({
      variables: {
        projectId: signedUrlParams ? undefined : activeProd,
        sbomId: row?.id
      }
    })
    setActiveRow(row)
    onListOpen()
  }

  // COLUMNS
  const columns = [
    // VERSION
    {
      id: 'SBOMS_PROJECT_VERSION',
      name: 'VERSION',
      selector: (row) => {
        const { id, projectVersion } = row
        return (
          <Link
            to={`/${path}/products/${projectGroup?.name}?id=${activeProd}&sbom=${id}`}
            onClick={() => {
              localStorage.setItem(
                'currentSBOM',
                JSON.stringify({
                  version: projectVersion,
                  id: id
                })
              )
              localStorage.setItem('activeSbomTab', 0)
              prodCompDispatch({ type: 'CLEAR_PROD_COMP' })
              setActiveSbomTab(0)
            }}
          >
            <Text color={'blue.500'} minWidth='100%' my={3} fontSize={14}>
              {projectVersion}
            </Text>
          </Link>
        )
      },
      wrap: true,
      width: '250px',
      sortable: true
    },
    // COMPONENTS
    {
      id: 'COMPONENTS',
      name: 'COMPONENTS',
      selector: (row) => {
        const { stats, id, projectVersion } = row
        return (
          <Link
            to={`/${path}/products/${params.name}?id=${activeProd}&sbom=${id}`}
          >
            <Tag
              size='md'
              variant='subtle'
              width={16}
              colorScheme={'blue'}
              onClick={() => {
                localStorage.setItem(
                  'currentSBOM',
                  JSON.stringify({ version: projectVersion, id: id })
                )
                if (signedUrlParams) {
                  localStorage.setItem('activeCsSbomTab', 1)
                } else {
                  localStorage.setItem('activeSbomTab', 2)
                }
              }}
            >
              <TagLabel mx={'auto'}>{stats?.compCount}</TagLabel>
            </Tag>
          </Link>
        )
      },
      width: '150px'
    },
    // LICENSES
    {
      id: 'LICENSES',
      name: 'LICENSES',
      selector: (row) => {
        const { stats } = row
        return (
          <Tag size='md' variant='subtle' width={16} colorScheme={'blue'}>
            <TagLabel mx={'auto'}>{stats?.compLicenseCount}</TagLabel>
          </Tag>
        )
      },
      width: '150px'
    },
    // VULNERABILITIES
    {
      id: 'VULNERABILITIES',
      name: 'VULNERABILITIES',
      selector: (row) => {
        const { stats, id, projectVersion } = row
        const link = `/${path}/products/${params.name}?id=${activeProd}&sbom=${id}`
        return (
          <Stack fontWeight={'medium'} direction={'row'}>
            <Link
              to={link}
              onClick={() => onFilterSev(id, projectVersion, ['critical'])}
            >
              <VulnBadge color='red' label='Critical'>
                {stats?.vulnStats?.critical || 0}
              </VulnBadge>
            </Link>
            <Link
              to={link}
              onClick={() => onFilterSev(id, projectVersion, ['high'])}
            >
              <VulnBadge color='orange' label='High'>
                {stats?.vulnStats?.high || 0}
              </VulnBadge>
            </Link>
            <Link
              to={link}
              onClick={() => onFilterSev(id, projectVersion, ['medium'])}
            >
              <VulnBadge color='yellow' label='Medium'>
                {stats?.vulnStats?.medium || 0}
              </VulnBadge>
            </Link>
            <Link
              to={link}
              onClick={() => onFilterSev(id, projectVersion, ['low'])}
            >
              <VulnBadge color='green' label='Low'>
                {stats?.vulnStats?.low || 0}
              </VulnBadge>
            </Link>
            <Link
              to={link}
              onClick={() => onFilterSev(id, version, ['unknown'])}
            >
              <VulnBadge color='gray' label='Unknown'>
                {stats?.vulnStats?.unknown || 0}
              </VulnBadge>
            </Link>
          </Stack>
        )
      },
      width: '360px'
    },
    // STATUS
    {
      id: 'STATUS',
      name: 'STATUS',
      selector: (row) => {
        const { lifecycle } = row

        return (
          <Tag width={24} colorScheme='cyan' textTransform={'capitalize'}>
            <TagLabel mx={'auto'}>{lifecycle}</TagLabel>
          </Tag>
        )
      }
    },
    // CREATED AT
    {
      id: 'SBOMS_CREATED_AT',
      name: 'CREATED',
      selector: (row) => {
        const { creationAt } = row

        return (
          <Tooltip label={getFullDateAndTime(creationAt)} placement='top'>
            <Text>{timeSince(creationAt)}</Text>
          </Tooltip>
        )
      },
      right: 'false',
      sortable: true
    },
    // UPDATED AT
    {
      id: 'SBOMS_UPDATED_AT',
      name: 'UPDATED',
      width: '200px',
      selector: (row) => {
        const { updatedAt } = row

        return (
          <Tooltip label={getFullDateAndTime(updatedAt)} placement='top'>
            <Text>{timeSince(updatedAt)}</Text>
          </Tooltip>
        )
      },
      sortable: true,
      sortFunction: (a, b) => {
        const dateA = new Date(a.updatedAt)
        const dateB = new Date(b.updatedAt)
        return dateA - dateB
      },
      right: 'false'
    },
    // ACTIONS
    {
      id: 'ACTION',
      name: 'ACTION',
      selector: (row) => {
        return (
          <Menu>
            <MenuButton
              as={IconButton}
              icon={<FaEllipsisVertical />}
              variant='none'
              color='gray.400'
            />
            <Portal>
              <MenuList fontSize={16}>
                <MenuItem onClick={() => handleListSbom(row)}>
                  List SBOM
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    setActiveRow(row)
                    onDeleteOpen()
                  }}
                  isDisabled={!archiveSbom || signedUrlParams}
                >
                  Delete
                </MenuItem>
              </MenuList>
            </Portal>
          </Menu>
        )
      },
      right: 'true'
    }
  ]

  const handleDelete = async () => {
    setIsLoading(true)
    await deleteSbom({
      variables: {
        id: activeRow.id
      }
    }).then((res) => {
      if (res.data.sbomDelete?.errors?.length === 0) {
        setTimeout(() => {
          setIsLoading(false)
          refetch({ id: activeProd })
          onDeleteClose()
        }, 4000)
      }
    })
  }

  // REFRESH PRODUCTS
  const handleRefresh = async () => {
    disablePaginationControl()
    setCurrentPage(1)
    await refetch({
      id: activeProd,
      first: totalRows,
      after: undefined,
      before: undefined,
      last: undefined
    }).then((res) => {
      if (res.data) {
        setPaginationControl(res.data)
      }
    })
  }

  const onBuildSbom = () => {
    prodCompDispatch({ type: 'CLEAR_LICENSES' })
    onSbomOpen()
  }

  const handleChange = (state) => {
    setClearSelect(false)
    setSelectedSbom(state?.selectedRows)
  }

  const handleCompare = () => {
    setLoading(true)
    if (selectedSbom?.length === 2) {
      getVersions({ variables: { id: activeProd } }).then(() => {
        const versions = sortByUpdatedAt(selectedSbom)
        getDrift({
          variables: {
            projectId: signedUrlParams ? undefined : activeProd,
            subjectSbomId: versions[0]?.id,
            targetSbomId: versions[1]?.id
          }
        }).then((res) => {
          if (res?.data) {
            setDrifts(
              signedUrlParams
                ? res?.data?.shareLynkQuery?.sbom?.sbomDrift
                : res?.data?.sbom?.sbomDrift
            )
            setLoading(false)
            onToolOpen()
          }
        })
      })
    }
  }

  // CLEAR SERACH
  const handleClear = async () => {
    setFilterText('')
    await refetch({
      ...versionData,
      first: totalRows,
      search: undefined,
      last: undefined,
      after: undefined,
      before: undefined
    }).then((res) => res?.data && versionDispatch({ type: 'CLEAR_SEARCH_INPUT' })
    )
  }

  // ON SEARCH INPUT CHANGE
  const onSearchInputChange = (e) => {
    const { value } = e.target
    if (value === '') {
      handleClear()
    } else {
      setFilterText(value)
    }
  }

  // SEARCH COMPONENT
  const handleSearch = async (event) => {
    const { value } = event.target
    if (event.key === 'Enter' && filterText !== '') {
      refetch({
        ...versionData,
        search: value,
        first: totalRows,
        after: undefined,
        before: undefined
      }).then((res) => res?.data && versionDispatch({ type: 'CHANGE_SEARCH_INPUT', payload: value }))
    }
  }

  const subHeaderComponent = useMemo(() => {
    return (
      <Flex
        width={'100%'}
        alignItems={'center'}
        justifyContent={'space-between'}
      >
        <Stack direction={'row'} alignItems={'center'} spacing={3}>
          <SearchFilter
            id='versions'
            filterText={filterText}
            onChange={onSearchInputChange}
            onClear={handleClear}
            onFilter={handleSearch}
          />
          {selectedSbom?.length === 1 && (
            <Text color={'red.500'}>
              ** Select one more version to enable comparison
            </Text>
          )}
          {selectedSbom?.length > 2 && (
            <Text color={'red.500'}>
              ** Comparison is permitted with only two versions
            </Text>
          )}
        </Stack>
        <Stack direction={'row'} spacing={2} alignItems={'center'}>
          {/* COMPARE VERSION */}
          {selectedSbom?.length === 2 && (
            <Tooltip label='Compare Version'>
              <IconButton
                onClick={handleCompare}
                colorScheme='blue'
                icon={<FaCodeCompare />}
                isLoading={loading}
              ></IconButton>
            </Tooltip>
          )}
          {/* BUILD SBOM */}
          <Tooltip label='Build Version'>
            <IconButton
              isDisabled={!projectGroup?.enabled || !createSbom}
              hidden={signedUrlParams}
              colorScheme='blue'
              onClick={onBuildSbom}
              icon={<FaScrewdriverWrench />}
            />
          </Tooltip>
          {/* REFETCH VERSION */}
          <Tooltip label='Refresh'>
            <IconButton
              onClick={handleRefresh}
              colorScheme='blue'
              icon={<RepeatIcon />}
            ></IconButton>
          </Tooltip>
        </Stack>
      </Flex>
    )
  }, [
    filterText,
    handleRefresh,
    handleCompare,
    onSearchInputChange,
    handleClear,
    handleSearch
  ])

  const handleSort = async (column, sortDirection) => {
    await refetch({
      id: activeProd,
      first: undefined,
      last: totalRows,
      after: undefined,
      before: undefined,
      field: column.id,
      direction: sortDirection === 'asc' ? 'ASC' : 'DESC'
    }).then((res) => {
      if (res.data) {
        versionDispatch({
          type: 'SET_SORT_ORDER',
          payload: { field: column.id, direction: sortDirection === 'asc' ? 'ASC' : 'DESC' }
        })
      }
    })
  }

  const dataTableProps = {
    columns: columns,
    data: versions?.nodes || [],
    customStyles: customStyles,
    onSort: handleSort,
    defaultSortFieldId: versionState?.field,
    defaultSortAsc: false,
    subHeader: true,
    subHeaderComponent: subHeaderComponent,
    progressPending: !versions,
    progressComponent: <CustomLoader />,
    responsive: true,
    persistTableHead: true,
    selectableRows: true,
    clearSelectedRows: clearSelect === true,
    onSelectedRowsChange: handleChange
  }

  if (error)
    return (
      <Text textAlign={'center'} my={2}>
        Something went wrong
      </Text>
    )

  return (
    <>
      <Flex flexDir={'column'} width={'100%'} className='version_table'>
        <DataTable {...dataTableProps} />
        {versions?.pageInfo && (
          <Pagination
            paginationSizes={paginationSizes}
            pageIndex={currentPage}
            totalRows={totalRows}
            totalCount={versions.totalCount}
            onPreviousPage={handlePreviousPage}
            onNextPage={handleNextPage}
            onSetRow={handleSetRow}
            hasNextPage={isNextActive}
            hasPreviousPage={isPrevActive}
          />
        )}
      </Flex>

      {/* DELETE VERSION */}
      {isDeleteOpen && (
        <Modal isOpen={isDeleteOpen} onClose={onDeleteClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Delete Version</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Text>Deleting this version will: </Text>
              <UnorderedList>
                <Flex flexDir={'column'} gap={1} mt={4}>
                  {[
                    'remove this versions and its SBOM',
                    'remove access to this version for all users'
                  ].map((item, index) => (
                    <ListItem key={index}>{item}</ListItem>
                  ))}
                </Flex>
              </UnorderedList>
              <br />
              <Text mt={10}>Are you sure you wish to continue?</Text>
            </ModalBody>
            <ModalFooter>
              <Flex
                width={'100%'}
                alignItems={'center'}
                justifyContent={'space-between'}
                gap={4}
              >
                <Stack>{isLoading && <Spinner color='red.500' />}</Stack>
                <Stack direction='row' alignItems='center' gap={1}>
                  <Button onClick={onDeleteClose}>No</Button>
                  <Button
                    colorScheme='red'
                    onClick={handleDelete}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Deleting...' : 'Yes'}
                  </Button>
                </Stack>
              </Flex>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}

      {/* SBOM LIST */}
      {isListOpen && versions && (
        <SbomList
          data={
            signedUrlParams ? sbomAlts?.shareLynkQuery?.sbom : sbomAlts?.sbom
          }
          sboms={versions}
          isOpen={isListOpen}
          onClose={onListClose}
        />
      )}

      {/* BUILD SBOM */}
      {isSbomOpen && projectGroup && (
        <ProductSbomDrawer
          isOpen={isSbomOpen}
          onClose={onSbomClose}
          data={projectGroup}
          refetch={refetch}
          productId={activeProd}
        />
      )}

      {isToolOpen && allVersions && (
        <ToolsDrawer
          versionList={
            signedUrlParams
              ? allVersions?.shareLynkQuery?.project?.sbomVersions
              : allVersions?.project?.sbomVersions
          }
          diffs={
            signedUrlParams ? driftData?.shareLynkQuery?.sbom : driftData?.sbom
          }
          data={drifts}
          isOpen={isToolOpen}
          onClose={onToolClose}
          setData={setDrifts}
          selectedSbom={selectedSbom}
        />
      )}
    </>
  )
}

export default VersionsTable
