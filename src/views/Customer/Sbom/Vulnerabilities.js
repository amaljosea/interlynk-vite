import { useQuery } from '@apollo/client'
import { useCallback, useEffect, useState } from 'react'
import DataTable from 'react-data-table-component'
import { useParams } from 'react-router-dom'
import { getSignedUrlParams } from 'utils'
import { parseEpssRange } from 'utils'
import { isSbomArchived } from 'utils'
import { customStyles } from 'utils/styleUtils'
import VulnerabilityColumns from 'views/Dashboard/Products/ProductDetailsSbomNew/Components/tableColumns/VulnerabilityColumns'
import ExpandedComponent from 'views/Dashboard/Products/ProductDetailsSbomNew/Components/tableExpanded/VulnerabilityExpanded'
import VulnerabilitySubHeader from 'views/Dashboard/Products/ProductDetailsSbomNew/Components/tableSubHeaders/VulnerabilitySubHeader'

import { Flex, useDisclosure } from '@chakra-ui/react'

import CustomLoader from 'components/CustomLoader'
import CvssCard from 'components/Misc/CvssCard'
import Pagination from 'components/Pagination'

import { useGlobalState } from 'hooks/useGlobalState'
import { usePaginatedQuery } from 'hooks/usePaginatedQuery'
import useQueryParam from 'hooks/useQueryParam'
import { useThemeColor } from 'hooks/useThemeColors'

import {
  FirstDegreePartVulns,
  ShareVulnData,
  ShareVulnFilters
} from 'graphQL/Queries'

const Vulnerabilities = ({ sbomData }) => {
  const params = useParams()
  const sbomId = params.sbomid
  const activeTab = useQueryParam('tab')

  const { prodVulnState, dispatch } = useGlobalState()
  const {
    field,
    direction,
    searchInput,
    severities,
    components,
    statues,
    include,
    kev,
    epss,
    filters,
    direct,
    vexComplete
  } = prodVulnState
  const { prodVulnDispatch } = dispatch

  const { headingTextColor } = useThemeColor(['headingTextColor'])
  const [activeRow, setActiveRow] = useState(null)
  const [vulnSearch, setVulnSearch] = useState(searchInput)

  useEffect(() => {
    if (sbomData?.sbom?.sbomParts?.length > 0) {
      prodVulnDispatch({ type: 'FILTER_INCLUDE', payload: ['parts'] })
    }
  }, [prodVulnDispatch, sbomData?.sbom?.sbomParts?.length])

  /*   getEpssRangeArray */
  const epssRange = parseEpssRange(epss)

  const { nodes, paginationProps, reset, loading } = usePaginatedQuery(
    ShareVulnData,
    {
      skip: sbomId && activeTab === 'vulnerabilities' ? false : true,
      selector: 'shareLynkQuery.sbom.vulns',
      variables: {
        sbomId: sbomId,
        search: searchInput !== '' ? searchInput : undefined,
        severity: severities.length > 0 ? severities : undefined,
        source: include.includes('parts') ? undefined : 'COMPONENT',
        componentName: components.length > 0 ? components : undefined,
        status: statues.length > 0 ? statues : undefined,
        kev:
          kev === 'all' || kev === ''
            ? undefined
            : kev === 'yes'
              ? true
              : false,
        epss: epss !== '' && epss !== 'all' ? epssRange : undefined,
        direct: direct === 'direct only' ? true : undefined,
        includeRetracted: include.includes('retracted') ? true : false,
        vexComplete: vexComplete === 'all' ? undefined : false,
        field: field,
        direction: direction
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

  // GET VULN FILTER HEADS
  useQuery(ShareVulnFilters, {
    variables: {
      sbomId: sbomId
    },
    onCompleted: (data) => {
      prodVulnDispatch({
        type: 'ADD_FILTER_HEADS',
        payload: data?.shareLynkQuery?.sbom?.filters
      })
    }
  })

  const {
    isOpen: isCvssOpen,
    onOpen: onCvssOpen,
    onClose: onCvssClose
  } = useDisclosure()

  const handleCvssOpen = (data) => {
    setActiveRow(data)
    onCvssOpen()
  }

  const isArchived = isSbomArchived(sbomData)

  // COLUMNS
  const columns = VulnerabilityColumns({ isArchived })

  // CLEAR SERACH
  const handleClear = useCallback(() => {
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
    (event) => {
      const { value } = event.target
      if (event.key === 'Enter') {
        prodVulnDispatch({ type: 'CHANGE_SEARCH_INPUT', payload: value })
        reset()
      }
    },
    [prodVulnDispatch, reset]
  )

  //Subheader
  const subHeader = VulnerabilitySubHeader({
    handleClear,
    handleSearch,
    onSearchInputChange,
    prodVulnDispatch,
    reset,
    signedUrlParams,
    vulnSearch,
    filters
  })

  const handleSort = (column, sortDirection) => {
    prodVulnDispatch({
      type: 'SET_SORT_ORDER',
      payload: {
        field: column?.id,
        direction: sortDirection === 'asc' ? 'ASC' : 'DESC'
      }
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

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
            onCvssOpen: handleCvssOpen
          }}
        />
      </Flex>

      {/* PAGINATION */}
      {<Pagination {...paginationProps} />}

      {/* CVSS CARD */}
      {isCvssOpen && (
        <CvssCard
          isOpen={isCvssOpen}
          onClose={onCvssClose}
          value={activeRow?.vuln?.cvssVector}
        />
      )}
    </>
  )
}

export default Vulnerabilities
