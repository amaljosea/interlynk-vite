import { useLazyQuery, useMutation, useQuery } from '@apollo/client'
import { useCallback, useEffect, useMemo, useState } from 'react'
import DataTable from 'react-data-table-component'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import {
  customStyles,
  getFullDateAndTime,
  sortByUpdatedAt,
  timeSince
} from 'utils'
import { getProductVersionDetailPageUrl } from 'utils/url'
import SbomList from 'views/Dashboard/Products/components/SbomList'
import SearchFilter from 'views/Sbom/components/SearchFilter'

import { RepeatIcon } from '@chakra-ui/icons'
import {
  Button,
  Flex,
  IconButton,
  ListItem,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Portal,
  Spinner,
  Stack,
  Tag,
  TagLabel,
  Text,
  Tooltip,
  UnorderedList,
  useDisclosure
} from '@chakra-ui/react'

import CustomLoader from 'components/CustomLoader'
import ProductSbomDrawer from 'components/Drawer/ProductSbomDrawer'
import ToolsDrawer from 'components/Drawer/ToolsDrawer'
import VulnBadge from 'components/Misc/VulnBadge'

import { useGlobalState } from 'hooks/useGlobalState'

import { sbomDelete } from 'graphQL/Mutation'
import {
  GetSbomAlternatives,
  GetSbomDrift,
  GetSbomVersions,
  GetShareSbomAlternatives,
  GetShareSbomDrift,
  GetShareSbomVersions,
  GetVersionsTable,
  ShareVersionTable
} from 'graphQL/Queries'

import {
  FaCodeCompare,
  FaEllipsisVertical,
  FaScrewdriverWrench
} from 'react-icons/fa6'

import Pagination from '../Pagination'

const VersionsTable = ({ projectGroup }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const params = useParams()
  const productGroupId = params.productgroupid
  const productId = params.productid
  const path = location?.pathname?.startsWith('/vendor') ? 'vendor' : 'customer'
  const signedUrlParams = sessionStorage.getItem('signedUrlParams')
  const {
    userPermissions,
    activeProdTab,
    setActiveSbomTab,
    clearSelect,
    setClearSelect,
    selectedSbom,
    setSelectedSbom,
    versionState,
    dispatch
  } = useGlobalState()
  const { searchInput } = versionState
  const { prodVulnDispatch, prodCompDispatch, versionDispatch } = dispatch

  const paginationSizes = [25, 50, 100]
  const [totalRows, setTotalRows] = useState(paginationSizes[0])
  const [filterText, setFilterText] = useState(searchInput)
  const [isPrevActive, setIsPrevActive] = useState(false)
  const [isNextActive, setIsNextActive] = useState(false)
  const [loading, setLoading] = useState(false)
  const [drifts, setDrifts] = useState([])

  const versionData = useMemo(() => {
    return {
      id: productId,
      field: versionState?.field,
      direction: versionState?.direction
    }
  }, [productId, versionState?.direction, versionState?.field])

  const [getAlternatives, { data: sbomAlts }] = useLazyQuery(
    signedUrlParams ? GetShareSbomAlternatives : GetSbomAlternatives
  )

  const [getVersions, { data: allVersions }] = useLazyQuery(
    signedUrlParams ? GetShareSbomVersions : GetSbomVersions
  )

  const [getDrift, { data: driftData }] = useLazyQuery(
    signedUrlParams ? GetShareSbomDrift : GetSbomDrift
  )

  const { data, refetch, error } = useQuery(
    signedUrlParams ? ShareVersionTable : GetVersionsTable,
    {
      skip: activeProdTab === 0 && !isToolOpen ? false : true,
      variables: {
        ...versionData,
        first: totalRows,
        last: undefined,
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
      after: versions?.pageInfo?.endCursor,
      before: undefined
    }).then((res) => {
      if (res.data) {
        setPaginationControl(res.data)
      }
    })
  }, [currentPage, refetch, versionData, totalRows, versions])

  const handlePreviousPage = useCallback(async () => {
    disablePaginationControl()
    setCurrentPage(currentPage - 1)
    await refetch({
      ...versionData,
      first: undefined,
      last: totalRows,
      after: undefined,
      before: versions?.pageInfo?.startCursor
    }).then((res) => {
      if (res.data) {
        setPaginationControl(res.data)
      }
    })
  }, [currentPage, refetch, versionData, totalRows, versions])

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
    [refetch, versionData]
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
    prodVulnDispatch({ type: 'FILTER_SEVERITY', payload: value })
    prodVulnDispatch({ type: 'FILTER_INCLUDE', payload: ['parts'] })
  }

  const handleListSbom = (row) => {
    getAlternatives({
      variables: {
        projectId: signedUrlParams ? undefined : productId,
        sbomId: row?.id
      }
    })
    setActiveRow(row)
    onListOpen()
  }

  const onSelectLicenses = (row) => {
    const { id } = row
    setActiveSbomTab(4)
    navigate(
      getProductVersionDetailPageUrl({
        productgroupid: productGroupId,
        productid: productId,
        sbomid: id,
        paramsObj: {
          tab: 'licenses'
        }
      })
    )
  }

  // COLUMNS
  const columns = [
    // VERSION
    {
      id: 'SBOMS_PROJECT_VERSION',
      name: 'VERSION',
      selector: (row) => {
        const { id, projectVersion } = row
        const link = getProductVersionDetailPageUrl({
          productgroupid: productGroupId,
          productid: productId,
          sbomid: row.id,
          paramsObj: {
            tab: 'general'
          }
        })
        return (
          <Link
            to={link}
            onClick={() => {
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
        const { stats, id } = row
        return (
          <Link
            to={getProductVersionDetailPageUrl({
              productgroupid: productGroupId,
              productid: productId,
              sbomid: id,
              paramsObj: {
                tab: 'components'
              }
            })}
          >
            <Tag size='md' variant='subtle' width={16} colorScheme={'blue'}>
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
          <Tag
            size='md'
            variant='subtle'
            width={16}
            colorScheme={'blue'}
            cursor={'pointer'}
            onClick={() => onSelectLicenses(row)}
          >
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
        const link = getProductVersionDetailPageUrl({
          productgroupid: productGroupId,
          productid: productId,
          sbomid: id,
          paramsObj: {
            tab: 'vulnerabilities'
          }
        })
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
              onClick={() => onFilterSev(id, projectVersion, ['unknown'])}
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
            <Text textAlign={'right'}>{timeSince(creationAt)}</Text>
          </Tooltip>
        )
      },
      minWidth: '150px',
      right: 'true',
      sortable: true,
      sortFunction: (a, b) => {
        const dateA = new Date(a.creationAt)
        const dateB = new Date(b.creationAt)
        return dateA - dateB
      }
    },
    // UPDATED AT
    {
      id: 'SBOMS_UPDATED_AT',
      name: 'UPDATED',
      minWidth: '150px',
      selector: (row) => {
        const { updatedAt } = row
        return (
          <Tooltip label={getFullDateAndTime(updatedAt)} placement='top'>
            <Text textAlign={'right'}>{timeSince(updatedAt)}</Text>
          </Tooltip>
        )
      },
      sortable: true,
      sortFunction: (a, b) => {
        const dateA = new Date(a.updatedAt)
        const dateB = new Date(b.updatedAt)
        return dateA - dateB
      },
      right: 'true'
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

  const handleDelete = () => {
    setIsLoading(true)
    deleteSbom({
      variables: {
        id: activeRow.id
      }
    }).then((res) => {
      if (res.data.sbomDelete?.errors?.length === 0) {
        setTimeout(() => {
          setIsLoading(false)
          setClearSelect(true)
          setSelectedSbom([])
          refetch({ id: productId })
          onDeleteClose()
        }, 2000)
      }
    })
  }

  // REFRESH PRODUCTS
  const handleRefresh = useCallback(async () => {
    disablePaginationControl()
    setCurrentPage(1)
    await refetch({
      id: productId,
      first: totalRows,
      after: undefined,
      before: undefined,
      last: undefined
    }).then((res) => {
      if (res.data) {
        setPaginationControl(res.data)
      }
    })
  }, [productId, refetch, totalRows])

  const onBuildSbom = useCallback(() => {
    prodCompDispatch({ type: 'CLEAR_LICENSES' })
    onSbomOpen()
  }, [onSbomOpen, prodCompDispatch])

  const handleChange = (state) => {
    setSelectedSbom(state?.selectedRows)
  }

  const handleCompare = useCallback(() => {
    setLoading(true)
    if (selectedSbom?.length === 2) {
      getVersions({ variables: { id: productId } }).then(() => {
        const versions = sortByUpdatedAt(selectedSbom)
        getDrift({
          variables: {
            projectId: signedUrlParams ? undefined : productId,
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
  }, [
    productId,
    getDrift,
    getVersions,
    onToolOpen,
    selectedSbom,
    signedUrlParams
  ])

  // CLEAR SERACH
  const handleClear = useCallback(async () => {
    setFilterText('')
    await refetch({
      ...versionData,
      first: totalRows,
      search: undefined,
      last: undefined,
      after: undefined,
      before: undefined
    }).then(
      (res) => res?.data && versionDispatch({ type: 'CLEAR_SEARCH_INPUT' })
    )
  }, [refetch, totalRows, versionData, versionDispatch])

  // ON SEARCH INPUT CHANGE
  const onSearchInputChange = useCallback(
    (e) => {
      const { value } = e.target
      if (value === '') {
        handleClear()
      } else {
        setFilterText(value)
      }
    },
    [handleClear]
  )

  // SEARCH COMPONENT
  const handleSearch = useCallback(
    async (event) => {
      const { value } = event.target
      if (event.key === 'Enter' && filterText !== '') {
        refetch({
          ...versionData,
          search: value,
          first: totalRows,
          after: undefined,
          before: undefined
        }).then(
          (res) =>
            res?.data &&
            versionDispatch({ type: 'CHANGE_SEARCH_INPUT', payload: value })
        )
      }
    },
    [filterText, refetch, totalRows, versionData, versionDispatch]
  )

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
    onSearchInputChange,
    handleClear,
    handleSearch,
    selectedSbom?.length,
    handleCompare,
    loading,
    projectGroup?.enabled,
    createSbom,
    signedUrlParams,
    onBuildSbom,
    handleRefresh
  ])

  const handleSort = async (column, sortDirection) => {
    await refetch({
      id: productId,
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
          payload: {
            field: column.id,
            direction: sortDirection === 'asc' ? 'ASC' : 'DESC'
          }
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
    clearSelectedRows: clearSelect,
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
              <Tag colorScheme='blue' mb={3}>
                {activeRow?.projectVersion}
              </Tag>
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
          productId={productId}
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
