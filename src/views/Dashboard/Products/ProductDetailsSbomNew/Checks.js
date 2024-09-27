import { useLazyQuery, useMutation, useQuery } from '@apollo/client'
import { TabContext } from 'context/TabContext'
import React, { useCallback, useContext, useMemo, useState } from 'react'
import DataTable from 'react-data-table-component'
import { useParams } from 'react-router-dom'
import { customStyles, getFullDateAndTime, sevColor, timeSince } from 'utils'
import { isCustomerView } from 'utils'
import CpeModal from 'views/Dashboard/Products/components/CpeModal'
import PurlModal from 'views/Dashboard/Products/components/PurlModal'
import CheckModal from 'views/Sbom/components/CheckModal'
import PriSupplierModal from 'views/Sbom/components/PriSupplierModal'
import SearchFilter from 'views/Sbom/components/SearchFilter'
import SupplierModal from 'views/Sbom/components/SupplierModal'

import { CheckIcon } from '@chakra-ui/icons'
import {
  Box,
  Button,
  Flex,
  IconButton,
  Stack,
  Tag,
  TagLabel,
  Text,
  Tooltip,
  useDisclosure
} from '@chakra-ui/react'

import CustomLoader from 'components/CustomLoader'
import RelationshipDrawer from 'components/Drawer/RelationshipDrawer'
import RefreshBtn from 'components/Icons/RefreshBtn'
import LicenseModal from 'components/LicenseModal'
import Pagination from 'components/Pagination'
import RowComponent from 'components/RowComponent'

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

import { BiSolidWrench } from 'react-icons/bi'
import { FaCheckDouble } from 'react-icons/fa'
import { GoSkip } from 'react-icons/go'

import AuthorModal from '../components/AuthorModal'
import FixedModal from '../components/FixedModal'
import CheckFilters from './CheckFilters'

const Checks = ({ sbomData }) => {
  const { showToast } = useCustomToast()
  const params = useParams()
  const productId = params.productid
  const sbomId = params.sbomid
  const activeTab = useQueryParam('tab')
  const customerView = isCustomerView()

  const isArchived = sbomData?.lifecycle === 'archived'

  const { headingTextColor, primaryTextColor } = useThemeColor([
    'headingTextColor',
    'primaryTextColor'
  ])

  const { dispatch } = useGlobalState()
  const { prodCompDispatch, sbomDispatch } = dispatch

  const { data: prodData } = useQuery(GetProductData, {
    skip: activeTab === 'checks' ? false : true,
    variables: { projectId: productId, sbomId }
  })

  const [getComPath, { data: relation, loading: comPathLoading }] =
    useLazyQuery(GetComponentPath)
  const { pathToPrimary } = relation?.component || ''

  const { sbom } = prodData || ''

  const [checkState, setCheckState] = useState({
    field: 'CHECK_RESULTS_UPDATED_AT',
    direction: 'DESC'
  })

  const { nodes, paginationProps, loading, reset } = usePaginatedQuery(
    GetCheckResults,
    {
      skip: activeTab === 'checks' ? false : true,
      selector: 'sbom.checkResults',
      variables: {
        sbomId: sbomId,
        projectId: productId,
        ...checkState
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

  const [recheck] = useMutation(recheckHealth)

  const handleRecheck = () => {
    recheck({
      variables: {
        sbomId: params?.sbomid,
        checkId: activeRow?.organizationRule?.rule?.friendlyId || undefined,
        compId: activeRow?.component?.id || undefined
      }
    })
  }

  const editChecks = useHasPermission({
    parentKey: 'view_sbom',
    childKey: 'edit_checks'
  })

  const updateComp = useHasPermission({
    parentKey: 'view_sbom',
    childKey: 'update_sbom_components'
  })

  const [checkSearch, setCheckSearch] = useState('')
  const [activeRow, setActiveRow] = useState(null)
  const [ruleExists, setRuleExists] = useState(false)

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

  const handleReCheck = useCallback(async () => {
    showToast({
      description: 'Checks rescan is in progress',
      status: 'info'
    })
    await healthRecheck({
      variables: {
        sbomId: sbomId
      }
    }).then((res) => {
      if (res.data) {
        showToast({
          description: 'Health re-check successfully',
          status: 'success'
        })
      }
    })
    reset()
  }, [healthRecheck, sbomId, showToast, reset])

  const setSearchFilter = useCallback(
    (value) => {
      setCheckState((oldFilter) => ({
        ...oldFilter,
        search: value
      }))
      reset()
    },
    [reset]
  )

  // CLEAR SERACH
  const handleClear = useCallback(() => {
    setCheckSearch('')
    setCheckState((oldFilter) => ({
      ...oldFilter,
      search: undefined
    }))
    reset()
  }, [reset])

  // ON SEARCH INPUT CHANGE
  const onSearchInputChange = useCallback(
    (e) => {
      const { value } = e.target
      if (value === '') {
        handleClear()
      } else {
        setCheckSearch(value)
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

  // SUB HEADER
  const subHeader = useMemo(() => {
    return (
      <Flex
        width={'100%'}
        alignItems={'center'}
        justifyContent={'space-between'}
      >
        <Stack
          width={'100%'}
          direction={'row'}
          spacing={3}
          alignItems={'flex-start'}
        >
          {/* SEARCH COMPONENTS */}
          <SearchFilter
            id='healthcheck'
            filterText={checkSearch}
            onChange={onSearchInputChange}
            onFilter={handleSearch}
            onClear={handleClear}
          />

          {/* FILTER COMPONENTS BASED ON ECOSYSTEM */}
          {filterHead && (
            <CheckFilters
              filters={filterHead?.sbom?.filters}
              setCheckState={(newFilters) => {
                setCheckState(newFilters)
                reset()
              }}
            />
          )}
        </Stack>

        <Stack spacing={3} direction={'row'}>
          <Tooltip label='Re-Check'>
            <IconButton
              fontSize={'sm'}
              variant='solid'
              colorScheme='blue'
              fontWeight='normal'
              onClick={handleReCheck}
              hidden={isArchived}
              isDisabled={!editChecks}
              icon={<FaCheckDouble size={16} />}
            />
          </Tooltip>
          <RefreshBtn />
        </Stack>
      </Flex>
    )
  }, [
    isArchived,
    checkSearch,
    onSearchInputChange,
    handleSearch,
    handleClear,
    filterHead,
    handleReCheck,
    editChecks,
    reset
  ])

  const handleOpenLicense = () => {
    prodCompDispatch({ type: 'CLEAR_LICENSES' })
    COMP_LICENSE.onOpen()
  }

  const handleComUpdate = async (row) => {
    await updateComponent({
      variables: {
        id: row.componentId,
        sbomId: sbomId,
        uniqueId: true
      }
    })
      .then((res) => {
        if (res.data) {
          healthRecheck({
            variables: {
              checkId: row.organizationRule.rule.friendlyId,
              compId: row.componentId,
              sbomId: sbomId
            }
          })
        }
      })
      .finally(() => {
        setTimeout(() => {
          showToast({
            description: 'A unique identifier has been added to the component',
            status: 'success'
          })
        }, 1000)
      })
  }

  const handleSbomUpdate = async (row) => {
    await updateSbom({
      variables: {
        id: row.sbomId,
        spec: row.sbom.spec,
        generateUniqueId: true
      }
    })
      .then((res) => {
        if (res.data) {
          healthRecheck({
            variables: {
              checkId: row.organizationRule.rule.friendlyId,
              sbomId: sbomId
            }
          })
        }
      })
      .finally(() => {
        setTimeout(() => {
          showToast({
            description: 'A unique identifier has been added to the component',
            status: 'success'
          })
        }, 1000)
      })
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
  }

  const onCheckOpen = (row) => {
    setActiveRow(row)
    const { component, organizationRule } = row
    const { name, version } = component || ''
    const { shortDesc, friendlyId } = organizationRule?.rule || ''
    if (shortDesc === 'Component has a unique identifier') {
      handleComUpdate(row)
    } else if (shortDesc === 'Document has a unique identifier') {
      handleSbomUpdate(row)
    } else {
      getRules({
        variables: {
          id: productId,
          checkIdentifier: friendlyId,
          checkComponent: component ? name : undefined,
          checkVersion: component ? version : undefined
        }
      })
        .then((res) => {
          const result = res?.data?.project?.automationRules?.nodes
          if (result?.length > 0) {
            setRuleExists(true)
          } else {
            setRuleExists(false)
          }
        })
        .finally(() => handleOpen(row))
    }
  }

  const updateIssue = async (id) => {
    await updateResult({
      variables: {
        id: id,
        status: 'ignored'
      }
    })
  }

  // COLUMNS
  const columns = [
    // HEALTH CHECK ID
    {
      id: 'RULES_FRIENDLY_ID',
      name: 'CHECK ID',
      selector: (row) => {
        const { organizationRule } = row
        return (
          <Text color={primaryTextColor}>
            {organizationRule.rule.friendlyId}
          </Text>
        )
      },
      sortable: true,
      width: '10%'
    },
    // SEVERITY
    {
      id: 'ORGANIZATION_RULES_SEVERITY',
      name: 'SEVERITY',
      selector: (row) => {
        const { organizationRule } = row
        return (
          <Tag
            size='md'
            variant='subtle'
            bg={sevColor(organizationRule.severity).bg}
            textColor={sevColor(organizationRule.severity).text}
            textTransform={'capitalize'}
            width={'80px'}
          >
            <TagLabel mx={'auto'}>{organizationRule.severity}</TagLabel>
          </Tag>
        )
      },
      width: '10%',
      sortable: true
    },
    // LONG DESCRIPTION
    {
      id: 'COMPONENTS_NAME',
      name: 'DESCRIPTION',
      selector: (row) => {
        const { organizationRule, component } = row
        return (
          <Stack spacing={2} my={3}>
            {component !== null && (
              <Box
                width={'fit-content'}
                onClick={() => setActiveRow(component)}
              >
                <RowComponent content={component} />
              </Box>
            )}
            <Text color={primaryTextColor}>
              {organizationRule.rule.longDesc !== null
                ? `${organizationRule.rule.shortDesc?.substring(0, 300)}${
                    organizationRule.rule.shortDesc.length > 300 ? '...' : ''
                  }`
                : ''}
            </Text>
          </Stack>
        )
      },
      sortable: true,
      wrap: true
    },
    // UPDATED AT
    {
      id: 'CHECK_RESULTS_UPDATED_AT',
      name: 'UPDATED',
      selector: (row) => (
        <Tooltip label={getFullDateAndTime(row.updatedAt)} placement={'top'}>
          <Text color={primaryTextColor}>{timeSince(row.updatedAt)}</Text>
        </Tooltip>
      ),
      sortable: true,
      sortFunction: (a, b) => {
        const dateA = new Date(a.updatedAt)
        const dateB = new Date(b.updatedAt)
        return dateA - dateB // Sort in descending order
      },
      right: 'true'
    },
    // ACTION
    {
      id: 'RESOLUTION',
      name: 'RESOLUTION',
      selector: (row) => {
        const { status, id, componentId } = row
        const { friendlyId } = row?.organizationRule?.rule || ''
        const fixedIDs = ['SB-HC-4', 'SB-HC-5', 'SB-HC-6', 'SB-HC-16']
        const fixedByDefault = fixedIDs.includes(friendlyId)
        const isPrimary = friendlyId === 'SB-HC-10'
        const isEditable = componentId ? updateComp : editChecks
        return (
          <>
            {status === 'unresolved' && !fixedByDefault && (
              <Stack direction={'row'} alignItems={'center'} spacing={2}>
                <Tooltip label='Fix'>
                  <IconButton
                    size='sm'
                    variant='solid'
                    colorScheme='blue'
                    fontWeight='normal'
                    icon={<BiSolidWrench size={18} />}
                    onClick={() => onCheckOpen(row)}
                    disabled={customerView || !isEditable || isArchived}
                  />
                </Tooltip>

                <Tooltip label='Ignore'>
                  <IconButton
                    size='sm'
                    variant='solid'
                    colorScheme='blue'
                    fontWeight='normal'
                    icon={<GoSkip size={18} />}
                    onClick={() => updateIssue(id)}
                    disabled={customerView || !editChecks || isArchived}
                  />
                </Tooltip>
              </Stack>
            )}

            {fixedByDefault && (
              <Button
                size='sm'
                variant='solid'
                fontSize={'xs'}
                fontWeight='normal'
                colorScheme='whatsapp'
                leftIcon={<CheckIcon />}
                onClick={() => (isPrimary ? null : FIXED.onOpen())}
                disabled={customerView || !editChecks || isArchived}
              >
                {isPrimary ? 'Fixed' : 'View'}
              </Button>
            )}

            {!fixedByDefault && status === 'resolved' && (
              <Button
                size='sm'
                fontSize={'xs'}
                variant='solid'
                colorScheme='whatsapp'
                isDisabled={isArchived}
                leftIcon={<CheckIcon />}
                onClick={() => (isPrimary ? null : onCheckOpen(row))}
                isLoading={activeRow?.id === id && loadingRules}
              >
                {isPrimary ? 'Fixed' : 'View'}
              </Button>
            )}

            {status === 'ignored' && (
              <Button size='sm' width={'74px'} fontSize={'xs'} variant='solid'>
                Ignored
              </Button>
            )}
          </>
        )
      },
      width: '12%',
      right: 'true'
    }
  ]

  // SORTING
  const handleSort = (column, sortDirection) => {
    setCheckState((oldFilters) => ({
      ...oldFilters,
      field: column?.id,
      direction: sortDirection.toUpperCase()
    }))
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
          customStyles={customStyles(headingTextColor)}
          subHeaderComponent={subHeader}
          progressComponent={<CustomLoader />}
          defaultSortFieldId={checkState?.field}
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
