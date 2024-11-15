import { gql, useQuery } from '@apollo/client'
import { useTour } from '@reactour/tour'
import { addDays, differenceInDays, parseISO } from 'date-fns'
import { useCallback, useMemo, useState } from 'react'
import DataTable from 'react-data-table-component'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { customStyles, getFormat, getFullDateAndTime } from 'utils'
import { getLink, getType, timeSince } from 'utils'
import { getSignedUrlParams } from 'utils'
import { ProductDetailsTabs } from 'utils/TabsObjects'
import SbomList from 'views/Dashboard/Products/components/SbomList'
import SearchFilter from 'views/Sbom/components/SearchFilter'

import { Flex, useDisclosure } from '@chakra-ui/react'
import { Link as Olink, Portal, SimpleGrid, Stack } from '@chakra-ui/react'
import { Divider, Grid, GridItem, Icon, IconButton } from '@chakra-ui/react'
import { Box, Tag, TagLabel, Text, Tooltip } from '@chakra-ui/react'
import { Menu, MenuItem, MenuList } from '@chakra-ui/react'

import CustomLoader from 'components/CustomLoader'
import ArchivedVersions from 'components/Drawer/ArchivedVersions'
import ProductSbomDrawer from 'components/Drawer/ProductSbomDrawer'
import ToolsDrawer from 'components/Drawer/ToolsDrawer'
import RefreshBtn from 'components/Icons/RefreshBtn'
import LynkAction from 'components/Misc/LynkAction'
import VulnBadge from 'components/Misc/VulnBadge'
import ArchiveSbom from 'components/Modal/ArchiveSbom'
import DeleteSbom from 'components/Modal/DeleteSbom'
import ReprocessSbom from 'components/Modal/ReprocessSbom'
import Pagination from 'components/Pagination'

import { useGlobalState } from 'hooks/useGlobalState'
import { useGradualPolling } from 'hooks/useGradualPolling'
import { useHasPermission } from 'hooks/useHasPermission'
import { usePaginatedQuery } from 'hooks/usePaginatedQuery'
import { useProductUrlContext } from 'hooks/useProductUrlContext'
import useQueryParam from 'hooks/useQueryParam'
import { useShouldShowDemoFeatures } from 'hooks/useShouldShowDemoFeatures'
import { useThemeColor } from 'hooks/useThemeColors'

import { GetVersionsTable, ShareVersionTable } from 'graphQL/Queries'

import { FaBoxArchive, FaCodeCompare } from 'react-icons/fa6'
import { FaScrewdriverWrench } from 'react-icons/fa6'
import { HiOutlineDuplicate } from 'react-icons/hi'
import { IoMdWarning } from 'react-icons/io'

// GET ACTIVCE PROJECT GROUP FOR PUBLIC VIEW
export const GetShareProjectGroup = gql`
  query GetShareProjectGroup($id: Uuid!) {
    shareLynkQuery {
      projectGroup(id: $id) {
        description
        enabled
        name
      }
    }
  }
`

const GetProjectGroup = gql`
  query GetProjectGroup($id: Uuid!) {
    projectGroup(id: $id) {
      description
      enabled
      name
    }
  }
`

const VersionsTable = (props) => {
  const { handleSort, retentionTime, filters, setFilters } = props

  const navigate = useNavigate()
  const params = useParams()
  const productId = params.productid
  const signedUrlParams = getSignedUrlParams()
  const { clearSelect, setClearSelect, selectedSbom } = useGlobalState()
  const { setSelectedSbom, versionState, dispatch } = useGlobalState()
  const { searchInput } = versionState
  const { prodVulnDispatch, prodCompDispatch } = dispatch
  const { generateProductVersionDetailPageUrlFromCurrentUrl } =
    useProductUrlContext()
  const { shouldShowDemoFeatures } = useShouldShowDemoFeatures()
  const [filterText, setFilterText] = useState(searchInput)
  const [activeRow, setActiveRow] = useState(null)

  const currentDate = new Date()

  const {
    headingTextColor,
    primaryTextColor,
    primaryErrorColor,
    primaryBlueText
  } = useThemeColor([
    'headingTextColor',
    'primaryTextColor',
    'primaryErrorColor',
    'primaryBlueText'
  ])

  const LIST = useDisclosure()
  const TOOL = useDisclosure()
  const SBOM = useDisclosure()
  const REPROCESS = useDisclosure()
  const ARC_VERSIONS = useDisclosure()
  const DELETE_SBOM = useDisclosure()
  const ARCHIVE_SBOM = useDisclosure()

  const tab = useQueryParam('tab')

  const { setIsOpen } = useTour()

  const { VERSIONS } = ProductDetailsTabs

  // GET PROJECT DATA
  const { data } = useQuery(
    signedUrlParams ? GetShareProjectGroup : GetProjectGroup,
    {
      variables: { id: params?.productgroupid }
    }
  )

  const result = signedUrlParams
    ? data?.shareLynkQuery?.projectGroup
    : data?.projectGroup
  const { name, enabled } = result || ''

  const { nodes, paginationProps, loading, startPolling, stopPolling } =
    usePaginatedQuery(signedUrlParams ? ShareVersionTable : GetVersionsTable, {
      skip: (tab === VERSIONS || tab === null) && !TOOL.isOpen ? false : true,
      selector: signedUrlParams
        ? 'shareLynkQuery.project.sbomVersions'
        : 'project.sbomVersions',
      variables: {
        id: productId,
        ...filters
      },
      onCompleted: () => {
        setClearSelect(false)
      }
    })

  const shouldPoll = nodes?.some((item) => item?.vulnRunStatus !== 'FINISHED')

  useGradualPolling({ shouldPoll, startPolling, stopPolling })

  const createSbom = useHasPermission({
    parentKey: 'view_sbom',
    childKey: 'update_sbom'
  })
  const archiveSbom = useHasPermission({
    parentKey: 'view_sbom',
    childKey: 'archive_sbom'
  })

  const onFilterSev = async (value, id) => {
    const selectedSBOM = nodes?.find((item) => item?.id === id)
    prodVulnDispatch({ type: 'FILTER_SEVERITY', payload: value })
    if (selectedSBOM?.sbomParts?.length > 0) {
      prodVulnDispatch({ type: 'FILTER_INCLUDE', payload: ['parts'] })
    }
  }

  const handleListSbom = (row) => {
    setActiveRow(row)
    LIST.onOpen()
  }

  const handleRepSbom = (row) => {
    setActiveRow(row)
    REPROCESS.onOpen()
  }

  const onSelectLicenses = (row) => {
    const { id } = row
    navigate(
      generateProductVersionDetailPageUrlFromCurrentUrl({
        sbomid: id,
        paramsObj: {
          tab: 'licenses'
        }
      })
    )
  }

  const onStartTour = () => {
    setIsOpen(false)
    prodCompDispatch({ type: 'CLEAR_PROD_COMP' })
  }

  const retention = retentionTime && Math.floor(retentionTime)

  const ignoreMsg = `An SBOM with the same version was recently imported. However, the system found no difference between the two versions, so the newer import has been ignored. On the right, you can still see its record under Action ... > List SBOM`

  // COLUMNS
  const columns = [
    // VERSION
    {
      id: 'SBOMS_PROJECT_VERSION',
      name: 'VERSION',
      selector: (row, index) => {
        const { projectVersion, createdAt, alternatives, isReprocess } = row
        const createdTime = new Date(createdAt)
        const currentTime = new Date()
        const timeDifference = currentTime - createdTime
        const timeDifferenceInSeconds = timeDifference / 1000
        const parsedCreatedDate = parseISO(createdAt)
        const endDate = addDays(parsedCreatedDate, retention)
        const diff = differenceInDays(endDate, currentDate)
        const daysUntilDeletion = diff <= 7 && diff >= 0 && retention !== 0
        // const exceedingItems = endDate > currentDate
        const link = generateProductVersionDetailPageUrlFromCurrentUrl({
          sbomid: row.id,
          paramsObj: {
            tab: 'general'
          }
        })
        const showIcon =
          alternatives?.length > 0 && timeDifferenceInSeconds <= 60

        return (
          <Grid
            justifyContent={'center'}
            templateColumns='repeat(7, 1fr)'
            className={index === 0 ? 'versions' : ''}
            sx={{ my: 3, gap: 2, alignItems: 'center' }}
          >
            <GridItem
              colSpan={1}
              width={'20px'}
              hidden={!shouldShowDemoFeatures}
            >
              <Tooltip label={getFormat(projectVersion)} placement='top'>
                <Olink
                  href={getLink(projectVersion)}
                  isExternal={getLink(projectVersion) === '#' ? false : true}
                >
                  <IconButton
                    size='xs'
                    isRound={true}
                    color={primaryTextColor}
                    icon={getType(projectVersion)}
                    background='transparent'
                  />
                </Olink>
              </Tooltip>
            </GridItem>
            <GridItem
              colSpan={6}
              display={'flex'}
              sx={{ gap: 2, flexDirection: 'row', alignItems: 'center' }}
            >
              <Link to={link} onClick={onStartTour} data-testid={`version`}>
                <Text color={primaryBlueText} minWidth='100%' fontSize={14}>
                  {projectVersion}
                </Text>
              </Link>
              {!isReprocess && showIcon && (
                <Tooltip label={ignoreMsg}>
                  <Box>
                    <Icon
                      as={HiOutlineDuplicate}
                      sx={{ mt: 1, fontSize: 18, color: primaryTextColor }}
                    />
                  </Box>
                </Tooltip>
              )}
              {daysUntilDeletion && !signedUrlParams && (
                <Tooltip
                  label={`Marked for deletion on ${endDate ? new Date(endDate).toLocaleDateString() : ''}`}
                >
                  <IconButton
                    size='xs'
                    icon={<IoMdWarning size={16} />}
                    sx={{ color: primaryErrorColor, bg: 'transparent' }}
                  />
                </Tooltip>
              )}
            </GridItem>
          </Grid>
        )
      },
      width: '15%',
      wrap: true,
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
            to={generateProductVersionDetailPageUrlFromCurrentUrl({
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
      width: '10.3%'
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
            colorScheme={'blue'}
            sx={{ w: 16, cursor: 'pointer' }}
            onClick={() => onSelectLicenses(row)}
          >
            <TagLabel mx={'auto'}>{stats?.compLicenseCount}</TagLabel>
          </Tag>
        )
      },
      width: '7.7%'
    },
    // VULNERABILITIES
    {
      id: 'VULNERABILITIES',
      name: 'VULNERABILITIES',
      selector: (row) => {
        const { stats, id, vulnRunStatus } = row
        const link = generateProductVersionDetailPageUrlFromCurrentUrl({
          sbomid: id,
          paramsObj: {
            tab: 'vulnerabilities'
          }
        })
        return (
          <SimpleGrid gap={1} width={'100%'} columns={5}>
            <Link to={link} onClick={() => onFilterSev(['critical'], id)}>
              <VulnBadge color='red' label='Critical' status={vulnRunStatus}>
                {stats?.vulnStats?.critical || 0}
              </VulnBadge>
            </Link>
            <Link to={link} onClick={() => onFilterSev(['high'], id)}>
              <VulnBadge color='orange' label='High' status={vulnRunStatus}>
                {stats?.vulnStats?.high || 0}
              </VulnBadge>
            </Link>
            <Link to={link} onClick={() => onFilterSev(['medium'], id)}>
              <VulnBadge color='yellow' label='Medium' status={vulnRunStatus}>
                {stats?.vulnStats?.medium || 0}
              </VulnBadge>
            </Link>
            <Link to={link} onClick={() => onFilterSev(['low'], id)}>
              <VulnBadge color='green' label='Low' status={vulnRunStatus}>
                {stats?.vulnStats?.low || 0}
              </VulnBadge>
            </Link>
            <Link to={link} onClick={() => onFilterSev(['unknown'], id)}>
              <VulnBadge color='gray' label='Unknown' status={vulnRunStatus}>
                {stats?.vulnStats?.unknown || 0}
              </VulnBadge>
            </Link>
          </SimpleGrid>
        )
      },
      width: '26.8%'
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
      },
      width: '9%'
    },
    // CREATED AT
    {
      id: 'SBOMS_CREATED_AT',
      name: 'IMPORTED',
      selector: (row) => {
        const { createdAt } = row
        return (
          <Tooltip label={getFullDateAndTime(createdAt)} placement='top'>
            <Text color={primaryTextColor} textAlign={'right'}>
              {timeSince(createdAt)}
            </Text>
          </Tooltip>
        )
      },
      width: '10%',
      right: 'true',
      sortable: true
    },
    // UPDATED AT
    {
      id: 'SBOMS_UPDATED_AT',
      name: 'UPDATED',
      selector: (row) => {
        const { updatedAt } = row
        return (
          <Tooltip label={getFullDateAndTime(updatedAt)} placement='top'>
            <Text color={primaryTextColor} textAlign={'right'}>
              {timeSince(updatedAt)}
            </Text>
          </Tooltip>
        )
      },
      sortable: true,
      width: '10%',
      right: 'true'
    },
    // ACTIONS
    {
      id: 'ACTION',
      name: 'ACTION',
      selector: (row) => {
        return (
          <Menu>
            <LynkAction aria-label={`sbom-${row?.projectVersion}-actions`} />
            <Portal>
              <MenuList fontSize={'sm'}>
                <MenuItem
                  hidden={signedUrlParams}
                  onClick={() => handleListSbom(row)}
                  aria-label={`sbom-${row?.projectVersion}-list`}
                >
                  List SBOM
                </MenuItem>
                <MenuItem
                  aria-label={`sbom-${row?.projectVersion}-reprocess`}
                  onClick={() => handleRepSbom(row)}
                  hidden={signedUrlParams}
                >
                  Reprocess
                </MenuItem>
                <Divider />
                <MenuItem
                  aria-label={`sbom-${row?.projectVersion}-archive`}
                  isDisabled={!archiveSbom || signedUrlParams}
                  onClick={() => {
                    setActiveRow(row)
                    ARCHIVE_SBOM.onOpen()
                  }}
                >
                  Archive
                </MenuItem>
                <MenuItem
                  data-testid='sbom-delete-button'
                  aria-label={`sbom-${row?.projectVersion}-delete`}
                  color={primaryErrorColor}
                  onClick={() => {
                    setActiveRow(row)
                    DELETE_SBOM.onOpen()
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

  const onBuildSbom = useCallback(() => {
    prodCompDispatch({ type: 'CLEAR_LICENSES' })
    SBOM.onOpen()
  }, [SBOM, prodCompDispatch])

  const handleChange = (state) => {
    setSelectedSbom(state?.selectedRows)
  }

  const setSearchFilter = useCallback(
    (value) => {
      setFilters((oldFilter) => ({
        ...oldFilter,
        search: value
      }))
    },
    [setFilters]
  )

  // CLEAR SERACH
  const handleClear = useCallback(async () => {
    setFilterText('')
    setFilters((oldFilter) => ({
      ...oldFilter,
      search: undefined
    }))
  }, [setFilters])

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
    (event) => {
      const {
        key,
        target: { value }
      } = event
      if (key === 'Enter' && value !== '') {
        setSearchFilter(value)
      }
    },
    [setSearchFilter]
  )

  const subHeaderComponent = useMemo(() => {
    return (
      <Flex
        sx={{ w: '100%', alignItems: 'center' }}
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
            <Text color={primaryErrorColor}>
              ** Select one more version to enable comparison
            </Text>
          )}
          {selectedSbom?.length > 2 && (
            <Text color={primaryErrorColor}>
              ** Comparison is permitted with only two versions
            </Text>
          )}
        </Stack>
        <Stack direction={'row'} spacing={2} alignItems={'center'}>
          {/* COMPARE VERSION */}
          {selectedSbom?.length === 2 && (
            <Tooltip label='Compare Version'>
              <IconButton
                onClick={TOOL.onOpen}
                colorScheme='blue'
                icon={<FaCodeCompare />}
              />
            </Tooltip>
          )}
          {/* SHOW ARCHIVED VERSION */}
          <Tooltip label='Show Archived Versions'>
            <IconButton
              isDisabled={!enabled}
              hidden={signedUrlParams}
              colorScheme='blue'
              aria-label='show_archive_sboms'
              onClick={ARC_VERSIONS.onOpen}
              icon={<FaBoxArchive />}
            />
          </Tooltip>
          {/* BUILD SBOM */}
          <Tooltip label='Build Version'>
            <IconButton
              isDisabled={!enabled || !createSbom}
              hidden={signedUrlParams}
              colorScheme='blue'
              onClick={onBuildSbom}
              aria-label='build_sbom'
              icon={<FaScrewdriverWrench />}
            />
          </Tooltip>
          <RefreshBtn />
        </Stack>
      </Flex>
    )
  }, [
    filterText,
    onSearchInputChange,
    handleClear,
    handleSearch,
    selectedSbom?.length,
    primaryErrorColor,
    TOOL.onOpen,
    enabled,
    signedUrlParams,
    ARC_VERSIONS.onOpen,
    createSbom,
    onBuildSbom
  ])

  const disableRowCheckBox = (row) => {
    if (selectedSbom.length >= 2) {
      return !selectedSbom.some((selectedRow) => selectedRow.id === row.id)
    }
    return false
  }

  const dataTableProps = {
    columns: columns,
    data: nodes || [],
    customStyles: customStyles(headingTextColor),
    onSort: handleSort,
    defaultSortFieldId: filters?.field,
    defaultSortAsc: false,
    subHeader: true,
    subHeaderComponent: subHeaderComponent,
    progressPending: loading,
    progressComponent: <CustomLoader />,
    responsive: true,
    persistTableHead: true,
    selectableRows: true,
    clearSelectedRows: clearSelect,
    onSelectedRowsChange: handleChange,
    selectableRowDisabled: disableRowCheckBox
  }

  return (
    <>
      <Flex flexDir={'column'} width={'100%'}>
        <DataTable {...dataTableProps} />
        <Pagination {...paginationProps} />
      </Flex>
      {/* DELETE VERSION */}
      {DELETE_SBOM.isOpen && (
        <DeleteSbom
          data={activeRow}
          projectGroup={{ name }}
          isOpen={DELETE_SBOM.isOpen}
          onClose={DELETE_SBOM.onClose}
        />
      )}
      {/* ARCHIVE VERSION */}
      {ARCHIVE_SBOM.isOpen && (
        <ArchiveSbom
          data={activeRow}
          projectGroup={{ name }}
          isOpen={ARCHIVE_SBOM.isOpen}
          onClose={ARCHIVE_SBOM.onClose}
        />
      )}
      {/* REPROCESS VERSION */}
      {REPROCESS.isOpen && (
        <ReprocessSbom
          data={activeRow}
          isOpen={REPROCESS.isOpen}
          onClose={REPROCESS.onClose}
          projectGroup={{ name }}
        />
      )}
      {/* ARCHIVE VERSION LIST */}
      {ARC_VERSIONS.isOpen && (
        <ArchivedVersions
          isOpen={ARC_VERSIONS.isOpen}
          onClose={ARC_VERSIONS.onClose}
          projectGroup={{ name }}
        />
      )}

      {/* SBOM LIST */}
      {LIST.isOpen && (
        <SbomList
          isOpen={LIST.isOpen}
          onClose={LIST.onClose}
          sbomId={activeRow?.id}
        />
      )}
      {/* BUILD SBOM */}
      {SBOM.isOpen && (
        <ProductSbomDrawer isOpen={SBOM.isOpen} onClose={SBOM.onClose} />
      )}
      {TOOL.isOpen && (
        <ToolsDrawer
          sbomIdOne={selectedSbom[0]?.id}
          sbomIdTwo={selectedSbom[1]?.id}
          onClose={TOOL.onClose}
        />
      )}
    </>
  )
}

export default VersionsTable
