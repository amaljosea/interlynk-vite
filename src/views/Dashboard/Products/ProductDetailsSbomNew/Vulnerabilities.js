import { gql, useMutation, useQuery } from '@apollo/client'
import { useCallback, useEffect, useMemo, useState } from 'react'
import DataTable from 'react-data-table-component'
import { useParams } from 'react-router-dom'
import { getSignedUrlParams, parseEpssRange, setKEV } from 'utils'
import { customStyles } from 'utils/styleUtils'
import VexModal from 'views/Dashboard/Vulnerabilities/components/VexModal'
import ImportWizard from 'views/Sbom/components/ImportWizard'

import { Flex, useDisclosure } from '@chakra-ui/react'

import JiraCreateIssueModal from 'components/Connections/JiraCreateIssueModal'
import CustomLoader from 'components/CustomLoader'
import VulnDrawer from 'components/Drawer/VulnDrawer'
import VulnLinkDrawer from 'components/Drawer/VulnLinkDrawer'
import LynkDrawer from 'components/LynkDrawer'
import CvssCard from 'components/Misc/CvssCard'
import CustomVuln from 'components/Modal/CustomVuln'
import Pagination from 'components/Pagination'

import useCustomToast from 'hooks/useCustomToast'
import { useGlobalState } from 'hooks/useGlobalState'
import { useHasPermission } from 'hooks/useHasPermission'
import { usePaginatedQuery } from 'hooks/usePaginatedQuery'
import useQueryParam from 'hooks/useQueryParam'
import { useThemeColor } from 'hooks/useThemeColors'

import { ManualVulnScan } from 'graphQL/Mutation'
import {
  FirstDegreePartVulns,
  GetOrgConnections,
  GetVulnData,
  GetVulnFilterData,
  ShareVulnFilters
} from 'graphQL/Queries'

import VulnerabilityColumns from './Components/tableColumns/VulnerabilityColumns'
import ExpandedComponent from './Components/tableExpanded/VulnerabilityExpanded'
import VulnerabilitySubHeader from './Components/tableSubHeaders/VulnerabilitySubHeader'

export const GetProjectSettings = gql`
  query GetProjectSettings($id: Uuid!) {
    project(id: $id) {
      projectSetting {
        vulnScanningEnabled
      }
    }
  }
`

const Vulnerabilities = ({ sbomData }) => {
  const params = useParams()
  const productId = params.productid
  const { headingTextColor } = useThemeColor(['headingTextColor'])

  const isArchived = sbomData?.lifecycle === 'archived'

  const { data: configs } = useQuery(GetOrgConnections, {
    fetchPolicy: 'network-only'
  })

  const { data: projectSettings, loading: projectSettingsLoad } = useQuery(
    GetProjectSettings,
    {
      variables: { id: productId }
    }
  )

  const isVulnScanEnabled =
    projectSettings?.project?.projectSetting?.vulnScanningEnabled

  const jiraConnection = configs?.organization?.connections?.nodes?.find(
    (item) => item?.connection?.__typename === 'JiraConnection'
  )

  const { showToast } = useCustomToast()
  const sbomId = params.sbomid
  const activeTab = useQueryParam('tab')

  const { prodVulnState, dispatch } = useGlobalState()
  const {
    field,
    searchInput,
    severities,
    components,
    statues,
    include,
    kev,
    epss,
    direct,
    vexComplete
  } = prodVulnState
  const { prodVulnDispatch } = dispatch

  const setOrder = useMemo(
    () => (value) => {
      if (value === '') {
        return {
          field: prodVulnState?.field,
          direction: prodVulnState?.direction
        }
      } else {
        return undefined
      }
    },
    [prodVulnState?.direction, prodVulnState?.field]
  )

  /*   getEpssRangeArray */
  const epssRange = parseEpssRange(epss)

  const { nodes, paginationProps, loading, reset } = usePaginatedQuery(
    GetVulnData,
    {
      skip: sbomId && activeTab === 'vulnerabilities' ? false : true,
      selector: 'sbom.vulns',
      variables: {
        sbomId: sbomId,
        epss: epssRange,
        kev: setKEV(kev),
        projectId: productId,
        orderBy: setOrder(searchInput),
        direct: direct ? true : undefined,
        search: searchInput !== '' ? searchInput.trim() : undefined,
        severity: severities.length > 0 ? severities : undefined,
        source: include.includes('parts') ? undefined : 'COMPONENT',
        componentName: components.length > 0 ? components : undefined,
        status: statues.length > 0 ? statues : undefined,
        includeRetracted: include.includes('retracted') ? true : false,
        vexComplete: vexComplete === 'all' ? undefined : false
      }
    }
  )

  const signedUrlParams = getSignedUrlParams()
  const firstDegreePart = nodes?.filter(
    (item) => item.isFirstDegreePart === true
  )
  const componentVulnIds = firstDegreePart?.map((item) => item?.id)
  const sbomIds = firstDegreePart?.map((item) => item?.component?.sbom?.id)

  useQuery(FirstDegreePartVulns, {
    skip:
      firstDegreePart?.length > 0 &&
      !signedUrlParams &&
      activeTab === 'vulnerabilities'
        ? false
        : true,
    variables: { sbomIds, componentVulnIds }
  })

  const [activeRow, setActiveRow] = useState(null)
  const [vulnSearch, setVulnSearch] = useState('')
  const [toggleClear, setToggleClear] = useState(false)
  const [selectedVulns, setSelectedVulns] = useState([])
  const [selectedGroup, setSelectedGroup] = useState('')

  const VEX = useDisclosure()
  const LINK = useDisclosure()
  const JIRA = useDisclosure()
  const CVSS = useDisclosure()
  const VULN = useDisclosure()
  const IMPORT = useDisclosure()
  const CUSTOM_VULNS = useDisclosure()
  const DELETE = useDisclosure()

  const onVexOpen = () => VEX.onOpen()

  // GET VULN FILTER HEADS
  useQuery(signedUrlParams ? ShareVulnFilters : GetVulnFilterData, {
    variables: {
      projectId: signedUrlParams ? undefined : productId,
      sbomId: sbomId
    },
    onCompleted: (data) => {
      prodVulnDispatch({
        type: 'ADD_FILTER_HEADS',
        payload: signedUrlParams
          ? data?.shareLynkQuery?.sbom?.filters
          : data?.sbom?.filters
      })
    }
  })

  const [onVulnScan] = useMutation(ManualVulnScan)

  const editVulns = useHasPermission({
    parentKey: 'view_sbom',
    childKey: 'edit_vulnerabilities'
  })

  const handleChange = (state) => {
    setSelectedVulns(state?.selectedRows)
    setSelectedGroup(
      state?.selectedRows[0]?.component?.sbom?.project?.projectGroup?.id
    )
  }

  // CLEAR SERACH
  const handleClear = useCallback(async () => {
    setVulnSearch('')
    prodVulnDispatch({ type: 'CLEAR_SEARCH_INPUT' })
    reset()
  }, [prodVulnDispatch, reset])

  // ON SEARCH INPUT CHANGE
  const onSearchInputChange = useCallback(
    (e) => {
      const { value } = e.target
      if (value === '') {
        handleClear()
      } else {
        setVulnSearch(value)
      }
    },
    [handleClear]
  )

  // SEARCH COMPONENT
  const handleSearch = useCallback(
    async (event) => {
      const { value } = event.target
      if (event.key === 'Enter' && value !== '') {
        prodVulnDispatch({ type: 'CHANGE_SEARCH_INPUT', payload: value })
        reset()
      }
    },
    [prodVulnDispatch, reset]
  )

  // SCAN VULN
  const handleScan = useCallback(async () => {
    if (!isVulnScanEnabled) {
      showToast({
        description: 'Vulnerability scan is disabled in product settings',
        status: 'warning'
      })
      return
    }
    await onVulnScan({
      variables: { id: sbomId }
    }).then((res) => {
      if (sbomData?.vulnRunStatus === 'IN_PROGRESS') {
        showToast({
          description: 'A scan is in-progress',
          status: 'info'
        })
      } else {
        if (res.data) {
          showToast({
            description: 'Vulnerability re-scan started',
            status: 'success'
          })
          prodVulnDispatch({ type: 'FETCH_DATA_SUCCESS' })
          reset()
        }
      }
    })
  }, [
    onVulnScan,
    prodVulnDispatch,
    reset,
    sbomData?.vulnRunStatus,
    sbomId,
    showToast,
    isVulnScanEnabled
  ])

  const handleWarning = (row) => {
    setActiveRow(row)
    DELETE.onOpen()
  }

  const onCreateCustomVuln = () => CUSTOM_VULNS.onOpen()

  const subHeader = VulnerabilitySubHeader({
    editVulns,
    handleClear,
    handleScan,
    handleSearch,
    onVexOpen,
    isArchived,
    onSearchInputChange,
    IMPORT,
    prodVulnDispatch,
    reset,
    selectedVulns,
    signedUrlParams,
    vulnSearch,
    onCreateCustomVuln,
    projectSettingsLoad
  })

  const handleSort = (column, sortDirection) => {
    prodVulnDispatch({
      type: 'SET_SORT_ORDER',
      payload: {
        field: column.id,
        direction: sortDirection === 'asc' ? 'ASC' : 'DESC'
      }
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const onCvssOpen = () => CVSS.onOpen()

  // COLUMNS
  const columns = VulnerabilityColumns(
    editVulns,
    isArchived,
    setActiveRow,
    jiraConnection,
    LINK,
    JIRA,
    VULN,
    handleWarning
  )

  useEffect(() => {
    if (searchInput !== '') {
      setVulnSearch(searchInput)
    } else {
      setVulnSearch('')
    }
  }, [searchInput])

  return (
    <>
      <Flex flexDir={'column'} width={'100%'}>
        {/* TABLE */}
        <DataTable
          className='data-table-container'
          columns={columns}
          data={nodes}
          customStyles={customStyles(headingTextColor)}
          onSort={handleSort}
          defaultSortAsc={false}
          defaultSortFieldId={field}
          progressPending={loading}
          progressComponent={<CustomLoader />}
          subHeader
          subHeaderComponent={subHeader}
          responsive={true}
          expandableRows
          expandOnRowClicked
          persistTableHead
          expandableRowsComponent={ExpandedComponent}
          expandableRowsComponentProps={{
            setActiveRow,
            onCvssOpen
          }}
          selectableRows={!signedUrlParams}
          clearSelectedRows={toggleClear}
          onSelectedRowsChange={handleChange}
        />
      </Flex>

      {/* PAGINATION */}
      <Pagination {...paginationProps} />

      {LINK.isOpen && (
        <VulnLinkDrawer
          data={activeRow}
          isOpen={LINK.isOpen}
          onClose={LINK.onClose}
          sbomId={sbomId}
        />
      )}

      {VULN.isOpen && (
        <VulnDrawer
          data={activeRow}
          isOpen={VULN.isOpen}
          onClose={VULN.onClose}
        />
      )}

      {JIRA.isOpen && (
        <JiraCreateIssueModal
          isOpen={JIRA.isOpen}
          onClose={JIRA.onClose}
          row={activeRow}
        />
      )}
      {/* COPY DATA TABLE */}
      {IMPORT.isOpen && nodes && (
        <LynkDrawer
          title={'Import Vulnerability Status'}
          size='full'
          placement='bottom'
          isOpen={IMPORT.isOpen}
          onClose={() => {
            prodVulnDispatch({ type: 'RESET_IMPORT_SBOMS' })
            IMPORT.onClose()
          }}
          noFooter
        >
          <ImportWizard
            currentSbomId={sbomId}
            currentProductId={productId}
            onClose={IMPORT.onClose}
          />
        </LynkDrawer>
      )}

      {VEX.isOpen && selectedVulns.length > 0 && (
        <VexModal
          isOpen={VEX.isOpen}
          onClose={VEX.onClose}
          checkEquals={true}
          selectedGroup={selectedGroup}
          selectedVulns={selectedVulns}
          setSelectedVulns={setSelectedVulns}
          setToggleClear={setToggleClear}
          vulnId={selectedVulns[0]?.vuln?.vulnId || ''}
        />
      )}

      {/* CVSS CARD */}
      {CVSS.isOpen && (
        <CvssCard
          isOpen={CVSS.isOpen}
          onClose={CVSS.onClose}
          value={activeRow?.vuln?.cvssVector}
        />
      )}

      {/* CUSTOM VULNS */}
      {CUSTOM_VULNS.isOpen && (
        <CustomVuln
          isOpen={CUSTOM_VULNS.isOpen}
          onClose={CUSTOM_VULNS.onClose}
        />
      )}
    </>
  )
}

export default Vulnerabilities
