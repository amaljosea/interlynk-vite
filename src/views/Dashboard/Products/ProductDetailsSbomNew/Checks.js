import { useLazyQuery, useMutation, useQuery } from '@apollo/client'
import React, { useMemo, useState } from 'react'
import DataTable from 'react-data-table-component'
import { useParams } from 'react-router-dom'
import { customStyles, isCustomerView } from 'utils'
import CpeModal from 'views/Dashboard/Products/components/CpeModal'
import PurlModal from 'views/Dashboard/Products/components/PurlModal'
import CheckModal from 'views/Sbom/components/CheckModal'
import PriSupplierModal from 'views/Sbom/components/PriSupplierModal'
import SupplierModal from 'views/Sbom/components/SupplierModal'

import { Flex, useDisclosure } from '@chakra-ui/react'

import CustomLoader from 'components/CustomLoader'
import RelationshipDrawer from 'components/Drawer/RelationshipDrawer'
import LicenseModal from 'components/LicenseModal'
import Pagination from 'components/Pagination'

import useCustomToast from 'hooks/useCustomToast'
import { useGlobalState } from 'hooks/useGlobalState'
import { useHasPermission } from 'hooks/useHasPermission'
import { usePaginatedQuery } from 'hooks/usePaginatedQuery'
import useQueryParam from 'hooks/useQueryParam'
import { useThemeColor } from 'hooks/useThemeColors'

import {
  UpdateComponent,
  checkResultUpdate,
  recheckHealth,
  sbomUpdate
} from 'graphQL/Mutation'
import {
  GetCheckFilterData,
  GetCheckResults,
  GetExistingRules,
  GetProductData
} from 'graphQL/Queries'
import { GetComponentPath } from 'graphQL/Queries'

import AuthorModal from '../components/AuthorModal'
import FixedModal from '../components/FixedModal'
import ChecksColumns from './Components/tableColumns/ChecksColumns'
import ChecksSubHeader from './Components/tableSubHeaders/ChecksSubHeader'

const getUndefinedIfEmptyOrAll = (value, allValue = 'all') =>
  value.includes(allValue) || value.length === 0 ? undefined : value

const Checks = ({ sbomData }) => {
  const { showToast } = useCustomToast()
  const params = useParams()
  const productId = params.productid
  const sbomId = params.sbomid
  const activeTab = useQueryParam('tab')
  const customerView = isCustomerView()

  const isArchived = sbomData?.lifecycle === 'archived'

  const { headingTextColor } = useThemeColor(['headingTextColor'])

  const { sbomCheckState, dispatch } = useGlobalState()
  const { prodCompDispatch, sbomDispatch, sbomCheckDispatch } = dispatch

  const { field, direction, checkId, category, severity, status, search } =
    sbomCheckState

  const [activeRow, setActiveRow] = useState(null)
  const [ruleExists, setRuleExists] = useState(false)
  const [checkSearch, setCheckSearch] = useState(search || '')

  const checksData = useMemo(() => {
    return {
      checkId: getUndefinedIfEmptyOrAll(checkId),
      category: getUndefinedIfEmptyOrAll(category),
      severity: getUndefinedIfEmptyOrAll(severity),
      status: getUndefinedIfEmptyOrAll(status)
    }
  }, [category, checkId, severity, status])

  const { data: prodData } = useQuery(GetProductData, {
    skip: activeTab === 'checks' ? false : true,
    variables: { projectId: productId, sbomId }
  })

  const [getComPath, { data: relation, loading: comPathLoading }] =
    useLazyQuery(GetComponentPath)
  const { pathToPrimary } = relation?.component || ''

  const { sbom } = prodData || ''

  const { nodes, paginationProps, loading, reset } = usePaginatedQuery(
    GetCheckResults,
    {
      skip: activeTab === 'checks' ? false : true,
      selector: 'sbom.checkResults',
      variables: {
        ...checksData,
        sbomId: sbomId,
        projectId: productId,
        field: field !== '' ? field : undefined,
        search: search !== '' ? search : undefined,
        direction: direction !== '' ? direction : undefined
      }
    }
  )

  // GET HEALTH CHECK FILTER HEADS
  const { data: filterHead } = useQuery(GetCheckFilterData, {
    fetchPolicy: 'network-only',
    skip: activeTab === 'checks' ? false : true,
    variables: {
      projectId: productId,
      sbomId
    }
  })

  const editChecks = useHasPermission({
    parentKey: 'view_sbom',
    childKey: 'edit_checks'
  })

  const updateComp = useHasPermission({
    parentKey: 'view_sbom',
    childKey: 'update_sbom_components'
  })

  const [getRules, { loading: loadingRules }] = useLazyQuery(GetExistingRules)
  const [updateResult] = useMutation(checkResultUpdate)
  const [updateComponent] = useMutation(UpdateComponent)
  const [healthRecheck] = useMutation(recheckHealth)
  const [updateSbom] = useMutation(sbomUpdate)

  const DOC_CREATION_TIME = useDisclosure()
  const DOC_LICENSE = useDisclosure()
  const DOC_SUPPLIER = useDisclosure()
  const DOC_PRIMARY = useDisclosure()
  const DOC_AUTHOR = useDisclosure()
  const COMP_LICENSE = useDisclosure()
  const COMP_SUPPLIER = useDisclosure()
  const COMP_TYPE = useDisclosure()
  const COMP_VERSION = useDisclosure()
  const COMP_RELATION = useDisclosure()
  const COMP_PURL = useDisclosure()
  const COMP_CPE = useDisclosure()
  const FIXED = useDisclosure()
  const COMP_SUPPORT = useDisclosure()

  const handleRecheck = () => {
    healthRecheck({
      variables: {
        sbomId: params?.sbomid,
        checkId: activeRow?.organizationRule?.rule?.friendlyId || undefined,
        compId: activeRow?.component?.id || undefined
      }
    })
  }

  const handleOpenLicense = () => {
    prodCompDispatch({ type: 'CLEAR_LICENSES' })
    COMP_LICENSE.onOpen()
  }

  const handleOpen = (row) => {
    setActiveRow(row)
    const { organizationRule } = row
    const { shortDesc } = organizationRule?.rule || ''

    // TIMESTAMP SELECTOR UI
    if (shortDesc === 'Document creation timestamp') {
      return DOC_CREATION_TIME.onOpen()
    }

    // AUTHOR SIDE DRAWER
    if (shortDesc === 'Document has authors present') {
      return DOC_AUTHOR.onOpen()
    }

    // SUPPLIER SIDE DRAWER
    if (shortDesc === 'Document has suppliers present') {
      return DOC_SUPPLIER.onOpen()
    }

    // SUPPLIER SIDE DRAWER
    if (shortDesc === 'Document has data license specified') {
      sbomDispatch({ type: 'CLEAR_LICENSES' })
      return DOC_LICENSE.onOpen()
    }

    // PRIMARY COMPONENT SELECTOR MODAL
    if (shortDesc === 'Document has a primary component') {
      return DOC_PRIMARY.onOpen()
    }

    // COMPONENT TYPE SELECTOR MODAL
    if (
      shortDesc === 'Component has a valid type' ||
      shortDesc === 'Component has a type'
    ) {
      return COMP_TYPE.onOpen()
    }

    // COMPONENT VERSION SELECTOR MODAL
    if (shortDesc === 'Component has a version') {
      return COMP_VERSION.onOpen()
    }

    // COMPONENT ADD SUPPLIER MODAL
    if (shortDesc === 'Component has a supplier') {
      return COMP_SUPPLIER.onOpen()
    }

    // COMPONENT HAS RELATIONSHIP
    if (shortDesc === 'Component has relationship/s') {
      getComPath({
        variables: { compId: row?.component?.id, sbomId: sbomId }
      }).then((res) => res?.data && COMP_RELATION.onOpen())
    }

    // PURL MODAL
    if (
      shortDesc === 'Component has a purl' ||
      shortDesc === 'Component has a valid purl'
    ) {
      return COMP_PURL.onOpen()
    }

    // CPE MODAL
    if (
      shortDesc === 'Component has a valid cpe' ||
      shortDesc === 'Component has a cpe'
    ) {
      return COMP_CPE.onOpen()
    }

    // COMPONENT LICENSE SELECTOR MODAL
    if (
      shortDesc === 'Component has license/s specified' ||
      shortDesc === 'Componet has deprecated license/s' ||
      shortDesc === 'Component has restrictive licenses specified'
    ) {
      return handleOpenLicense()
    }

    // COMPONENT SUPPORT LEVEL
    if (shortDesc === 'Component has support level') {
      return COMP_SUPPORT.onOpen()
    }
  }

  // COLUMNS
  const columns = ChecksColumns(
    setActiveRow,
    updateComp,
    editChecks,
    customerView,
    isArchived,
    activeRow,
    loadingRules,
    FIXED,
    updateResult,
    getRules,
    productId,
    setRuleExists,
    handleOpen,
    showToast,
    sbomId,
    healthRecheck,
    updateComponent,
    updateSbom
  )

  // SUB HEADER
  const subHeader = ChecksSubHeader(
    checkSearch,
    filterHead,
    reset,
    isArchived,
    editChecks,
    showToast,
    healthRecheck,
    sbomId,
    setCheckSearch,
    sbomCheckDispatch
  )

  // SORTING
  const handleSort = (column, sortDirection) => {
    sbomCheckDispatch({
      type: 'SET_SORT_ORDER',
      payload: {
        field: column?.id,
        direction: sortDirection === 'asc' ? 'ASC' : 'DESC'
      }
    })
  }

  return (
    <>
      <Flex flexDir={'column'} width={'100%'}>
        <DataTable
          subHeader
          data={nodes}
          persistTableHead
          columns={columns}
          responsive={true}
          onSort={handleSort}
          defaultSortAsc={false}
          progressPending={loading}
          defaultSortFieldId={field}
          subHeaderComponent={subHeader}
          progressComponent={<CustomLoader />}
          customStyles={customStyles(headingTextColor)}
        />
        {/* PAGINATION */}
        <Pagination {...paginationProps} />
      </Flex>

      {/* ACTIONS */}
      {activeRow !== null && (
        <>
          {/* SBOM DATA LICENSES DRAWER */}
          {DOC_LICENSE.isOpen && (
            <LicenseModal
              data={sbom}
              activeRow={activeRow}
              recheck={handleRecheck}
              isOpen={DOC_LICENSE.isOpen}
              onClose={DOC_LICENSE.onClose}
            />
          )}

          {/* COMPONENT PRIMARY MODAL */}
          {DOC_PRIMARY.isOpen && (
            <CheckModal
              activeRow={activeRow}
              ruleExists={ruleExists}
              recheck={handleRecheck}
              isOpen={DOC_PRIMARY.isOpen}
              onClose={DOC_PRIMARY.onClose}
            />
          )}

          {/* COMPONENT VERSION MODAL */}
          {COMP_VERSION.isOpen && (
            <CheckModal
              activeRow={activeRow}
              ruleExists={ruleExists}
              recheck={handleRecheck}
              isOpen={COMP_VERSION.isOpen}
              onClose={COMP_VERSION.onClose}
            />
          )}

          {/* COMPONENT SUPPORT MODAL */}
          {COMP_SUPPORT.isOpen && (
            <CheckModal
              activeRow={activeRow}
              ruleExists={ruleExists}
              recheck={handleRecheck}
              isOpen={COMP_SUPPORT.isOpen}
              onClose={COMP_SUPPORT.onClose}
            />
          )}

          {/* COMPONENT LICENSE MODAL */}
          {COMP_LICENSE.isOpen && (
            <CheckModal
              activeRow={activeRow}
              ruleExists={ruleExists}
              recheck={handleRecheck}
              isOpen={COMP_LICENSE.isOpen}
              onClose={COMP_LICENSE.onClose}
            />
          )}

          {/* COMPONENT TYPE MODAL */}
          {COMP_TYPE.isOpen && (
            <CheckModal
              activeRow={activeRow}
              recheck={handleRecheck}
              ruleExists={ruleExists}
              isOpen={COMP_TYPE.isOpen}
              onClose={COMP_TYPE.onClose}
            />
          )}

          {/* SUPPLIER MODAL */}
          <SupplierModal
            activeRow={activeRow}
            ruleExists={ruleExists}
            recheck={handleRecheck}
            isOpen={COMP_SUPPLIER.isOpen}
            onClose={COMP_SUPPLIER.onClose}
          />

          {DOC_CREATION_TIME.isOpen && (
            <CheckModal
              isOpen={DOC_CREATION_TIME.isOpen}
              onClose={DOC_CREATION_TIME.onClose}
              activeRow={activeRow}
              ruleExists={ruleExists}
              recheck={handleRecheck}
            />
          )}

          {/* PURL MODAL */}
          {COMP_PURL.isOpen && (
            <PurlModal
              activeRow={activeRow}
              recheck={handleRecheck}
              ruleExists={ruleExists}
              isOpen={COMP_PURL.isOpen}
              onClose={COMP_PURL.onClose}
            />
          )}

          {/* CPE MODAL */}
          {COMP_CPE.isOpen && (
            <CpeModal
              activeRow={activeRow}
              recheck={handleRecheck}
              ruleExists={ruleExists}
              isOpen={COMP_CPE.isOpen}
              onClose={COMP_CPE.onClose}
            />
          )}

          {/* AUTHOR DRAWER */}
          {DOC_AUTHOR.isOpen && (
            <AuthorModal
              recheck={handleRecheck}
              isOpen={DOC_AUTHOR.isOpen}
              onClose={DOC_AUTHOR.onClose}
            />
          )}

          {/* DOCUMENT SUPPLIER DRAWER */}
          {DOC_SUPPLIER.isOpen && (
            <PriSupplierModal
              activeRow={activeRow}
              recheck={handleRecheck}
              ruleExists={ruleExists}
              isOpen={DOC_SUPPLIER.isOpen}
              onClose={DOC_SUPPLIER.onClose}
            />
          )}

          {/* COMPONENT RELATIONSHIP DRAWER */}
          {COMP_RELATION.isOpen && (
            <RelationshipDrawer
              activeRow={activeRow}
              ruleExists={ruleExists}
              recheck={handleRecheck}
              compPath={pathToPrimary}
              isOpen={COMP_RELATION.isOpen}
              onClose={COMP_RELATION.onClose}
              comPathLoading={comPathLoading}
            />
          )}
        </>
      )}

      {FIXED.isOpen && (
        <FixedModal isOpen={FIXED.isOpen} onClose={FIXED.onClose} />
      )}
    </>
  )
}

export default Checks
