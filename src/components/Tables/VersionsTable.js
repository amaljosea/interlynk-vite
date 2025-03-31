import { gql, useQuery } from '@apollo/client'
import { useTour } from '@reactour/tour'
import { useCallback, useMemo, useState } from 'react'
import DataTable from 'react-data-table-component'
import { useNavigate, useParams } from 'react-router-dom'
import { getSignedUrlParams } from 'utils'
import { ProductDetailsTabs } from 'utils/TabsObjects'
import { customStyles } from 'utils/styleUtils'
import SbomList from 'views/Dashboard/Products/components/SbomList'
import SearchFilter from 'views/Sbom/components/SearchFilter'

import {
  Flex,
  IconButton,
  Stack,
  Text,
  Tooltip,
  useDisclosure
} from '@chakra-ui/react'

import CustomLoader from 'components/CustomLoader'
import ArchivedVersions from 'components/Drawer/ArchivedVersions'
import ProductSbomDrawer from 'components/Drawer/ProductSbomDrawer'
import ToolsDrawer from 'components/Drawer/ToolsDrawer'
import RefreshBtn from 'components/Icons/RefreshBtn'
import ArchiveSbom from 'components/Modal/ArchiveSbom'
import AutomationWarning from 'components/Modal/AutomationWarning'
import DeleteSbom from 'components/Modal/DeleteSbom'
import ReprocessSbom from 'components/Modal/ReprocessSbom'
import SbomTransfer from 'components/Modal/SbomTransfer'
import SupportAnalysis from 'components/Modal/SupportAnalysis'
import Pagination from 'components/Pagination'
import VersionColumns from 'components/columns/VersionColumns'

import { useGlobalState } from 'hooks/useGlobalState'
import { useGradualPolling } from 'hooks/useGradualPolling'
import { useHasPermission } from 'hooks/useHasPermission'
import { usePaginatedQuery } from 'hooks/usePaginatedQuery'
import { useProductUrlContext } from 'hooks/useProductUrlContext'
import useQueryParam from 'hooks/useQueryParam'
import { useThemeColor } from 'hooks/useThemeColors'

import { GetVersionsTable, ShareVersionTable } from 'graphQL/Queries'

import { FaPlus } from 'react-icons/fa6'
import { LuArchive, LuGitCompare } from 'react-icons/lu'

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
  const {
    clearSelect,
    setClearSelect,
    versionState,
    dispatch,
    selectedSbom,
    setSelectedSbom
  } = useGlobalState()
  const { searchInput } = versionState
  const { prodVulnDispatch, prodCompDispatch } = dispatch
  const { generateProductVersionDetailPageUrlFromCurrentUrl } =
    useProductUrlContext()
  const [filterText, setFilterText] = useState(searchInput)
  const [activeRow, setActiveRow] = useState(null)

  const {
    headingTextColor,

    primaryBlueText
  } = useThemeColor(['headingTextColor', 'primaryBlueText'])

  const LIST = useDisclosure()
  const TOOL = useDisclosure()
  const SBOM = useDisclosure()
  const TRANSFER = useDisclosure()
  const REPROCESS = useDisclosure()
  const ARC_VERSIONS = useDisclosure()
  const DELETE_SBOM = useDisclosure()
  const ARCHIVE_SBOM = useDisclosure()
  const AUTOMATION = useDisclosure()
  const SUPPORT = useDisclosure()

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
      onCompleted: () => setClearSelect(!clearSelect)
    })

  const shouldPoll = nodes?.some((item) => item?.vulnRunStatus !== 'FINISHED')

  useGradualPolling({ shouldPoll, startPolling, stopPolling })

  const updateSbom = useHasPermission({
    parentKey: 'view_sbom',
    childKey: 'update_sbom'
  })

  const onFilterSev = async (value, id, link) => {
    const selectedSBOM = nodes?.find((item) => item?.id === id)
    prodVulnDispatch({ type: 'FILTER_SEVERITY', payload: value })
    if (selectedSBOM?.sbomParts?.length > 0) {
      prodVulnDispatch({ type: 'FILTER_INCLUDE', payload: ['parts'] })
    }
    navigate(link)
  }

  const action = (type, data) => {
    setActiveRow(data)
    switch (type) {
      case 'archive_sbom':
        return ARCHIVE_SBOM.onOpen()
      case 'delete_sbom':
        return DELETE_SBOM.onOpen()
      case 'view_alternates':
        return LIST.onOpen()
      case 'switch_environment':
        return TRANSFER.onOpen()
      case 'rerun_import':
        return REPROCESS.onOpen()
      case 'rerun_automation':
        return AUTOMATION.onOpen()
      case 'rerun_support_analysis':
        return SUPPORT.onOpen()
      default:
        break
    }
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

  const onClear = useCallback(() => {
    setSelectedSbom([])
    setClearSelect(!clearSelect)
  }, [clearSelect, setClearSelect, setSelectedSbom])

  // COLUMNS
  const columns = VersionColumns({
    action,
    retentionTime,
    onFilterSev,
    onClear,
    onSelectLicenses,
    onStartTour
  })

  const onBuildSbom = useCallback(() => {
    onClear()
    prodCompDispatch({ type: 'CLEAR_LICENSES' })
    SBOM.onOpen()
  }, [SBOM, onClear, prodCompDispatch])

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
            <Text color={primaryBlueText}>
              ** Select one more version to enable comparison
            </Text>
          )}
          {selectedSbom?.length > 2 && (
            <Text color={primaryBlueText}>
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
                icon={<LuGitCompare size={20} />}
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
              icon={<LuArchive size={20} />}
            />
          </Tooltip>
          {/* BUILD SBOM */}
          <Tooltip label='Build Version'>
            <IconButton
              isDisabled={!enabled || !updateSbom}
              hidden={signedUrlParams}
              colorScheme='blue'
              onClick={onBuildSbom}
              aria-label='build_sbom'
              icon={<FaPlus />}
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
    primaryBlueText,
    TOOL.onOpen,
    enabled,
    signedUrlParams,
    ARC_VERSIONS.onOpen,
    updateSbom,
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
    defaultSortAsc: filters?.direction === 'ASC' ? true : false,
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

  const existingSbom = nodes?.length > 0 ? nodes[0] : null

  return (
    <>
      <Flex flexDir={'column'} width={'100%'}>
        <DataTable {...dataTableProps} className='data-table-container' />
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
          projectGroup={{ name }}
        />
      )}
      {/* BUILD SBOM */}
      {SBOM.isOpen && (
        <ProductSbomDrawer
          sbom={existingSbom}
          isOpen={SBOM.isOpen}
          onClose={SBOM.onClose}
        />
      )}
      {TOOL.isOpen && (
        <ToolsDrawer
          sbomIdOne={selectedSbom[0]?.id}
          sbomIdTwo={selectedSbom[1]?.id}
          onClose={TOOL.onClose}
        />
      )}
      {/* SBOM TRANSFER */}
      {TRANSFER.isOpen && (
        <SbomTransfer
          sbom={activeRow}
          productGroup={{ name }}
          isOpen={TRANSFER.isOpen}
          onClose={TRANSFER.onClose}
        />
      )}
      {/* AUTOMATION RUN WARNING */}
      {AUTOMATION.isOpen && (
        <AutomationWarning
          sbom={activeRow}
          productGroup={{ name }}
          isOpen={AUTOMATION.isOpen}
          onClose={AUTOMATION.onClose}
        />
      )}
      {/* SUPPORT ANALYSIS RUN WARNING */}
      {SUPPORT.isOpen && (
        <SupportAnalysis
          sbom={activeRow}
          productGroup={{ name }}
          isOpen={SUPPORT.isOpen}
          onClose={SUPPORT.onClose}
        />
      )}
    </>
  )
}

export default VersionsTable
