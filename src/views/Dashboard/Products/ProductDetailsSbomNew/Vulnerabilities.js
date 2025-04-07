import { gql, useMutation, useQuery } from '@apollo/client'
import { useCallback, useEffect, useMemo, useState } from 'react'
import DataTable from 'react-data-table-component'
import { useParams } from 'react-router-dom'
import {
  getSignedUrlParams,
  isSbomArchived,
  parseEpssRange,
  setKEV
} from 'utils'
import { customStyles } from 'utils/styleUtils'
import VexModal from 'views/Dashboard/Vulnerabilities/components/VexModal'
import ImportWizard from 'views/Sbom/components/ImportWizard'

import { Flex, useDisclosure } from '@chakra-ui/react'

import JiraCreateIssueModal from 'components/Connections/JiraCreateIssueModal'
import CustomLoader from 'components/CustomLoader'
import VulnAdvisoriesDrawer from 'components/Drawer/VulnAdvisoriesDrawer'
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
import { CustomVulnUpdate } from 'graphQL/Mutation'
import {
  FirstDegreePartVulns,
  GetVulnData,
  GetVulnFilterData,
  ShareVulnFilters
} from 'graphQL/Queries'
import { verfifyCustomVuln } from 'graphQL/Queries'

import ConfirmationModal from '../components/ConfirmationModal'
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

  const isArchived = isSbomArchived(sbomData)

  const editVulns = useHasPermission({
    parentKey: 'view_sbom',
    childKey: 'edit_vulnerabilities'
  })

  const { data: projectSettings, loading: projectSettingsLoad } = useQuery(
    GetProjectSettings,
    {
      variables: { id: productId }
    }
  )

  const isVulnScanEnabled =
    projectSettings?.project?.projectSetting?.vulnScanningEnabled

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
  const ADVISORIES = useDisclosure()

  const action = (type, data) => {
    setActiveRow(data)
    switch (type) {
      case 'vuln_status':
        return VEX.onOpen()
      case 'vuln_links':
        return LINK.onOpen()
      case 'create_jira_ticket':
        return JIRA.onOpen()
      case 'view_cvss':
        return CVSS.onOpen()
      case 'vuln_import':
        return IMPORT.onOpen()
      case 'edit_vuln':
        return VULN.onOpen()
      case 'custom_vuln':
        return CUSTOM_VULNS.onOpen()
      case 'remove_vuln':
        return DELETE.onOpen()
      case 'view_advisories':
        return ADVISORIES.onOpen()
      default:
        return VEX.onOpen()
    }
  }

  const [updateVuln, { loading: deleteLoading }] = useMutation(CustomVulnUpdate)
  const { data: vulnData } = useQuery(verfifyCustomVuln, {
    skip: DELETE.isOpen ? false : true,
    variables: { vulnIdentifier: activeRow?.vuln?.vulnId }
  })

  const { customVuln } = vulnData || {}
  const { customVulnSboms } = customVuln || ''

  const handleRemove = () => {
    const attribute = customVulnSboms?.map((item) => ({
      id: item?.id,
      sbomId: item?.sbomId,
      componentId: item?.componentId || undefined,
      _destroy: true
    }))
    updateVuln({
      variables: {
        id: customVuln?.id,
        customVulnSbomsAttributes: attribute
      }
    }).then((res) => {
      if (res?.data?.customVulnUpdate?.errors?.length > 0) {
        showToast({
          description: res?.data?.customVulnUpdate?.errors[0],
          status: 'error'
        })
      } else {
        showToast({
          description: 'Vulnerability removed successfully',
          status: 'success'
        })
        DELETE.onClose()
      }
    })
  }

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

  const subHeader = VulnerabilitySubHeader({
    handleClear,
    handleScan,
    handleSearch,
    action,
    isArchived,
    onSearchInputChange,
    prodVulnDispatch,
    reset,
    selectedVulns,
    vulnSearch,
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

  const onCvssOpen = (data) => action('view_cvss', data)

  // COLUMNS
  const columns = VulnerabilityColumns({ isArchived, action })

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
          clearSelectedRows={toggleClear}
          onSelectedRowsChange={handleChange}
          selectableRows={!signedUrlParams && editVulns}
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

      {/* REMOVE CUSTOM VULN */}
      {DELETE.isOpen && (
        <ConfirmationModal
          isOpen={DELETE?.isOpen}
          onConfirm={handleRemove}
          onClose={DELETE?.onClose}
          isLoading={deleteLoading}
          title={'Remove Vulnerability'}
          name={activeRow?.vuln?.vulnId}
          description={`You are about to remove the custom vulnerability from this version`}
        />
      )}

      {/* VULN ADVISORIES */}
      {ADVISORIES.isOpen && (
        <VulnAdvisoriesDrawer
          data={activeRow}
          isOpen={ADVISORIES.isOpen}
          onClose={ADVISORIES.onClose}
        />
      )}
    </>
  )
}

export default Vulnerabilities
