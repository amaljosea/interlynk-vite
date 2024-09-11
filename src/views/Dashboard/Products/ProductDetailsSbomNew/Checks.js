import { useLazyQuery, useMutation, useQuery } from '@apollo/client'
import { TabContext } from 'context/TabContext'
import React, { useCallback, useContext, useMemo, useState } from 'react'
import DataTable from 'react-data-table-component'
import { useLocation, useParams } from 'react-router-dom'
import { customStyles, getFullDateAndTime, sevColor, timeSince } from 'utils'
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
  useColorModeValue,
  useDisclosure
} from '@chakra-ui/react'

import CustomLoader from 'components/CustomLoader'
import RelationshipDrawer from 'components/Drawer/RelationshipDrawer'
import RefreshBtn from 'components/Icons/RefreshBtn'
import LicenseModal from 'components/LicenseModal'
import Pagination from 'components/Pagination'
import RowComponent from 'components/RowComponent'

import useCustomToast from 'hooks/useCustomToast'
import { useGlobalQueryContext } from 'hooks/useGlobalQueryContext'
import { useGlobalState } from 'hooks/useGlobalState'
import { useHasPermission } from 'hooks/useHasPermission'
import { usePaginatedQuery } from 'hooks/usePaginatedQuery'

import {
  UpdateComponent,
  checkResultUpdate,
  recheckHealth,
  sbomUpdate
} from 'graphQL/Mutation'
import {
  CpeAutoComplete,
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

const Checks = () => {
  const { isFreeTier } = useGlobalQueryContext()
  const { showToast } = useCustomToast()
  const params = useParams()
  const productId = params.productid
  const sbomId = params.sbomid
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const activeTab = queryParams.get('tab')
  const customerView = location.pathname.startsWith('/customer')

  const { setTabData } = useContext(TabContext)

  const headColor = useColorModeValue('#4A5568', '#CBD5E0')
  const textColor = useColorModeValue('#1A202C', '#F7FAFC')

  const { dispatch } = useGlobalState()
  const { prodCompDispatch, sbomDispatch } = dispatch

  const { data: prodData } = useQuery(GetProductData, {
    skip: activeTab === 'checks' ? false : true,
    variables: { projectId: productId, sbomId }
  })

  const [getComPath, { data: relation }] = useLazyQuery(GetComponentPath)
  const { pathToPrimary } = relation?.component || ''

  const { sbom: sbomData } = prodData || ''

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

  const [getCpe] = useLazyQuery(CpeAutoComplete)
  const [getRules, { loading: loadingRules }] = useLazyQuery(GetExistingRules)
  const [updateResult] = useMutation(checkResultUpdate)
  const [updateComponent] = useMutation(UpdateComponent)
  const [healthRecheck] = useMutation(recheckHealth)
  const [updateSbom] = useMutation(sbomUpdate)

  const { isOpen, onOpen, onClose } = useDisclosure()

  const {
    isOpen: isLicenseOpen,
    onOpen: onLicenseOpen,
    onClose: onLicenseClose
  } = useDisclosure()

  const {
    isOpen: isDataLicenseOpen,
    onOpen: onDataLicenseOpen,
    onClose: onDataLicenseClose
  } = useDisclosure()

  const {
    isOpen: isDocSupOpen,
    onOpen: onDocSupOpen,
    onClose: onDocSupClose
  } = useDisclosure()

  const {
    isOpen: isTypeOpen,
    onOpen: onTypeOpen,
    onClose: onTypeClose
  } = useDisclosure()

  const {
    isOpen: isAuthorOpen,
    onOpen: onAuthorOpen,
    onClose: onAuthorClose
  } = useDisclosure()

  const {
    isOpen: isSupplierOpen,
    onOpen: onSupplierOpen,
    onClose: onSupplierClose
  } = useDisclosure()

  const {
    isOpen: isPrimaryOpen,
    onOpen: onPrimaryOpen,
    onClose: onPrimaryClose
  } = useDisclosure()

  const {
    isOpen: isPurlOpen,
    onOpen: onPurlOpen,
    onClose: onPurlClose
  } = useDisclosure()

  const {
    isOpen: isCpeOpen,
    onOpen: onCpeOpen,
    onClose: onCpeClose
  } = useDisclosure()

  const {
    isOpen: isFixedOpen,
    onOpen: onFixedOpen,
    onClose: onFixedClose
  } = useDisclosure()

  const {
    isOpen: isVersionOpen,
    onOpen: onVersionOpen,
    onClose: onVersionClose
  } = useDisclosure()

  const {
    isOpen: isRelOpen,
    onOpen: onRelOpen,
    onClose: onRelClose
  } = useDisclosure()

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
              isDisabled={!editChecks}
              icon={<FaCheckDouble size={16} />}
            />
          </Tooltip>
          <RefreshBtn />
        </Stack>
      </Flex>
    )
  }, [
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
    onLicenseOpen()
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
      return onOpen()
    }

    // AUTHOR SIDE DRAWER
    if (shortDesc === 'Document has authors present') {
      return onAuthorOpen()
    }

    // SUPPLIER SIDE DRAWER
    if (shortDesc === 'Document has suppliers present') {
      return onDocSupOpen()
    }

    // SUPPLIER SIDE DRAWER
    if (shortDesc === 'Document has data license specified') {
      sbomDispatch({ type: 'CLEAR_LICENSES' })
      return onDataLicenseOpen()
    }

    // PRIMARY COMPONENT SELECTOR MODAL
    if (shortDesc === 'Document has a primary component') {
      return onPrimaryOpen()
    }

    // COMPONENT TYPE SELECTOR MODAL
    if (
      shortDesc === 'Component has a valid type' ||
      shortDesc === 'Component has a type'
    ) {
      return onTypeOpen()
    }

    // COMPONENT VERSION SELECTOR MODAL
    if (shortDesc === 'Component has a version') {
      return onVersionOpen()
    }

    // COMPONENT ADD SUPPLIER MODAL
    if (shortDesc === 'Component has a supplier') {
      return onSupplierOpen()
    }

    // COMPONENT HAS RELATIONSHIP
    if (shortDesc === 'Component has relationship/s') {
      getComPath({
        variables: { compId: row?.component?.id, sbomId: sbomId }
      }).then((res) => res?.data && onRelOpen())
    }

    // PURL MODAL
    if (
      shortDesc === 'Component has a purl' ||
      shortDesc === 'Component has a valid purl'
    ) {
      setTabData((prev) => ({
        ...prev,
        identifiers: { ...prev.identifiers, purl: 'pkg:type/name@version' }
      }))
      return onPurlOpen()
    }

    // CPE MODAL
    if (
      shortDesc === 'Component has a valid cpe' ||
      shortDesc === 'Component has a cpe'
    ) {
      setTabData((prev) => ({
        ...prev,
        identifiers: { ...prev.identifiers, cpe: 'cpe:2.3:::::*:*:*:*:*:*:*' }
      }))
      return onCpeOpen()
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
        return <Text color={textColor}>{organizationRule.rule.friendlyId}</Text>
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
            <Text color={textColor}>
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
          <Text color={textColor}>{timeSince(row.updatedAt)}</Text>
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
                    disabled={customerView || !isEditable}
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
                    disabled={customerView || !editChecks}
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
                onClick={() => (isPrimary ? null : onFixedOpen())}
                disabled={customerView || !editChecks}
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
          customStyles={customStyles(headColor)}
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
          {isDataLicenseOpen && (
            <LicenseModal
              data={sbomData}
              activeRow={activeRow}
              isOpen={isDataLicenseOpen}
              onClose={onDataLicenseClose}
            />
          )}

          {/* COMPONENT PRIMARY MODAL */}
          {isPrimaryOpen && (
            <CheckModal
              activeRow={activeRow}
              isOpen={isPrimaryOpen}
              ruleExists={ruleExists}
              onClose={onPrimaryClose}
              isFreeTier={isFreeTier}
            />
          )}

          {/* COMPONENT VERSION MODAL */}
          {isVersionOpen && (
            <CheckModal
              activeRow={activeRow}
              isOpen={isVersionOpen}
              ruleExists={ruleExists}
              onClose={onVersionClose}
              isFreeTier={isFreeTier}
            />
          )}

          {/* COMPONENT LICENSE MODAL */}
          {isLicenseOpen && (
            <CheckModal
              activeRow={activeRow}
              isOpen={isLicenseOpen}
              ruleExists={ruleExists}
              onClose={onLicenseClose}
              isFreeTier={isFreeTier}
            />
          )}

          {/* COMPONENT TYPE MODAL */}
          {isTypeOpen && (
            <CheckModal
              isOpen={isTypeOpen}
              onClose={onTypeClose}
              activeRow={activeRow}
              ruleExists={ruleExists}
              isFreeTier={isFreeTier}
            />
          )}

          {/* SUPPLIER MODAL */}
          {isSupplierOpen && (
            <SupplierModal
              id={null}
              data={null}
              activeRow={activeRow}
              isOpen={isSupplierOpen}
              ruleExists={ruleExists}
              onClose={onSupplierClose}
              isFreeTier={isFreeTier}
            />
          )}

          {isOpen && (
            <CheckModal
              isOpen={isOpen}
              onClose={onClose}
              activeRow={activeRow}
              ruleExists={ruleExists}
              isFreeTier={isFreeTier}
            />
          )}

          {/* PURL MODAL */}
          {isPurlOpen && (
            <PurlModal
              data={null}
              getCpe={getCpe}
              isOpen={isPurlOpen}
              activeRow={activeRow}
              onClose={onPurlClose}
              ruleExists={ruleExists}
              isFreeTier={isFreeTier}
            />
          )}

          {/* CPE MODAL */}
          {isCpeOpen && (
            <CpeModal
              getCpe={getCpe}
              activeComp={null}
              isOpen={isCpeOpen}
              onClose={onCpeClose}
              activeRow={activeRow}
              ruleExists={ruleExists}
              isFreeTier={isFreeTier}
            />
          )}

          {/* AUTHOR DRAWER */}
          {isAuthorOpen && (
            <AuthorModal isOpen={isAuthorOpen} onClose={onAuthorClose} />
          )}

          {/* DOCUMENT SUPPLIER DRAWER */}
          {isDocSupOpen && (
            <PriSupplierModal
              getCpe={getCpe}
              suppliers={null}
              activeRow={activeRow}
              isOpen={isDocSupOpen}
              ruleExists={ruleExists}
              onClose={onDocSupClose}
              isFreeTier={isFreeTier}
            />
          )}

          {/* COMPONENT RELATIONSHIP DRAWER */}
          {isRelOpen && (
            <RelationshipDrawer
              data={null}
              isOpen={isRelOpen}
              onClose={onRelClose}
              activeRow={activeRow}
              ruleExists={ruleExists}
              compPath={pathToPrimary}
              isFreeTier={isFreeTier}
            />
          )}
        </>
      )}

      {isFixedOpen && (
        <FixedModal isOpen={isFixedOpen} onClose={onFixedClose} />
      )}
    </>
  )
}

export default Checks
