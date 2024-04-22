import { useLazyQuery, useMutation, useQuery } from '@apollo/client'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import DataTable from 'react-data-table-component'
import { useLocation, useParams } from 'react-router-dom'
import { customStyles, getFullDateAndTime, sevColor, timeSince } from 'utils'
import CpeModal from 'views/Dashboard/Products/components/CpeModal'
import PurlModal from 'views/Dashboard/Products/components/PurlModal'
import CheckModal from 'views/Sbom/components/CheckModal'
import PriSupplierModal from 'views/Sbom/components/PriSupplierModal'
import SearchFilter from 'views/Sbom/components/SearchFilter'
import SupplierModal from 'views/Sbom/components/SupplierModal'

import {
  Badge,
  Button,
  Flex,
  IconButton,
  Stack,
  Tag,
  TagLabel,
  Text,
  Tooltip,
  useDisclosure,
  useToast
} from '@chakra-ui/react'

import Card from 'components/Card/Card'
import CustomLoader from 'components/CustomLoader'
import GeneralDataDrawer from 'components/Drawer/GeneralDataDrawer'
import LicenseModal from 'components/LicenseModal'
import Pagination from 'components/Pagination'

import { useGlobalState } from 'hooks/useGlobalState'

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
  GetProductData
} from 'graphQL/Queries'

import { BiSolidWrench } from 'react-icons/bi'
import { FaCheckDouble } from 'react-icons/fa'
import { GoSkip } from 'react-icons/go'

import CheckFilters from './CheckFilters'

const Checks = () => {
  const toast = useToast()
  const params = useParams()
  const productId = params.productid
  const sbomId = params.sbomid
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const activeTab = queryParams.get('tab')
  const customerView = location.pathname.startsWith('/customer')

  const { userPermissions, totalRows, setTotalRows, prodCheckState, dispatch } =
    useGlobalState()
  const {
    field,
    direction,
    pageIndex,
    searchInput,
    rules,
    categories,
    severities,
    statues,
    filters,
    after,
    before
  } = prodCheckState
  const { prodCompDispatch, prodCheckDispatch, sbomDispatch } = dispatch

  const getUndefinedIfEmpty = (value) => (value !== '' ? value : undefined)
  const getUndefinedIfEmptyOrAll = (value, allValue = 'all') =>
    value.includes(allValue) || value.length === 0 ? undefined : value

  const { data: prodData } = useQuery(GetProductData, {
    skip: activeTab === 'checks' ? false : true,
    variables: { projectId: productId, sbomId }
  })

  const { sbom: sbomData } = prodData || ''

  // GET HEALTH CHECK DATA
  const { data, refetch, error } = useQuery(GetCheckResults, {
    skip: activeTab === 'checks' ? false : true,
    variables: {
      projectId: productId,
      sbomId: sbomId,
      first: totalRows,
      last: undefined,
      search: getUndefinedIfEmpty(searchInput),
      checkId: getUndefinedIfEmptyOrAll(rules),
      category: getUndefinedIfEmptyOrAll(categories),
      severity: getUndefinedIfEmptyOrAll(severities),
      status: getUndefinedIfEmptyOrAll(statues),
      field: field || 'CHECK_RESULTS_UPDATED_AT',
      direction: direction || 'DESC'
    }
  })

  const { checkResults } = data?.sbom || ''

  // GET HEALTH CHECK FILTER HEADS
  const { refetch: filterRefetch } = useQuery(GetCheckFilterData, {
    skip: activeTab === 'checks' ? false : true,
    variables: {
      projectId: productId,
      sbomId
    },
    onCompleted: (data) =>
      prodCheckDispatch({
        type: 'ADD_FILTER_HEADS',
        payload: data?.sbom?.filters
      })
  })

  const paginationSizes = [25, 50, 100]
  const [isPrevActive, setIsPrevActive] = useState(false)
  const [isNextActive, setIsNextActive] = useState(false)

  useEffect(() => {
    if (checkResults) {
      setIsPrevActive(checkResults?.pageInfo?.hasPreviousPage)
      setIsNextActive(checkResults?.pageInfo?.hasNextPage)
    }
  }, [checkResults])

  const setPaginationControl = (data) => {
    setIsPrevActive(data.sbom?.checkResults?.pageInfo?.hasPreviousPage)
    setIsNextActive(data.sbom?.checkResults?.pageInfo?.hasNextPage)
  }

  const disablePaginationControl = () => {
    setIsPrevActive(false)
    setIsNextActive(false)
  }

  //end

  const sboms = userPermissions?.find((item) => item.key === 'view_sbom')
  const editChecks = sboms?.supersededBy?.some(
    (permission) =>
      permission.key === 'edit_checks' && permission.value === true
  )
  const updateSboms = sboms?.supersededBy?.some(
    (permission) =>
      permission.key === 'update_sbom' && permission.value === true
  )

  const [purlValue, setPurlValue] = useState('')
  const [cpeList, setCpeList] = useState([])
  const [cpeValue, setCpeValue] = useState('')
  const [selectedCpe, setSelectedCpe] = useState(null)
  const [checkSearch, setCheckSearch] = useState('')
  const [activeRow, setActiveRow] = useState(null)

  const fetchCheckData = () => {
    disablePaginationControl()
    refetch({
      projectId: productId,
      sbomId: sbomId,
      search: searchInput !== '' ? searchInput : undefined,
      checkId: rules.includes('all') || rules.length === 0 ? undefined : rules,
      category:
        categories.includes('all') || categories.length === 0
          ? undefined
          : categories,
      severity:
        severities.includes('all') || severities.length === 0
          ? undefined
          : severities,
      status:
        statues.includes('all') || statues.length === 0 ? undefined : statues,
      first: totalRows,
      field: field,
      direction: direction
    }).then((res) => {
      if (res.data) {
        setPaginationControl(res.data)
      }
    })
  }

  const [updateResult] = useMutation(checkResultUpdate, {
    onCompleted: () => fetchCheckData()
  })

  const [getCpe] = useLazyQuery(CpeAutoComplete)
  const [updateComponent] = useMutation(UpdateComponent)
  const [updateSbom] = useMutation(sbomUpdate)

  const supplierBtn = useRef(null)
  const creationToolBtn = useRef(null)
  const authorBtn = useRef(null)

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
    isOpen: isCreationOpen,
    onOpen: onCreationOpen,
    onClose: onCreationClose
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

  const [healthRecheck] = useMutation(recheckHealth, {
    onCompleted: () => fetchCheckData()
  })

  const handleReCheck = useCallback(() => {
    try {
      healthRecheck({
        variables: {
          sbomId: sbomId
        }
      }).then((res) => {
        if (res.data) {
          toast({
            description: 'Health re-check successfully',
            status: 'success',
            duration: 3000,
            position: 'top'
          })
        }
      })
    } catch (error) {
      console.log('Mutation error', error)
    }
  }, [healthRecheck, sbomId, toast])

  // CLEAR SERACH
  const handleClear = useCallback(async () => {
    disablePaginationControl()
    setCheckSearch('')
    await refetch({
      projectId: productId,
      sbomId: sbomId,
      search: undefined,
      checkId: rules.includes('all') || rules.length === 0 ? undefined : rules,
      category:
        categories.includes('all') || categories.length === 0
          ? undefined
          : categories,
      severity:
        severities.includes('all') || severities.length === 0
          ? undefined
          : severities,
      status:
        statues.includes('all') || statues.length === 0 ? undefined : statues,
      first: totalRows,
      field: field,
      direction: direction
    }).then((res) => {
      if (res.data) {
        setPaginationControl(res.data)
        prodCheckDispatch({ type: 'CLEAR_SEARCH_INPUT' })
      }
    })
  }, [
    categories,
    direction,
    field,
    prodCheckDispatch,
    productId,
    refetch,
    rules,
    sbomId,
    severities,
    statues,
    totalRows
  ])

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
    async (event) => {
      disablePaginationControl()
      const { value } = event.target
      if (event.key === 'Enter' && checkSearch !== '') {
        await refetch({
          projectId: productId,
          sbomId: sbomId,
          search: value,
          checkId:
            rules.includes('all') || rules.length === 0 ? undefined : rules,
          category:
            categories.includes('all') || categories.length === 0
              ? undefined
              : categories,
          severity:
            severities.includes('all') || severities.length === 0
              ? undefined
              : severities,
          status:
            statues.includes('all') || statues.length === 0
              ? undefined
              : statues,
          first: totalRows,
          field: field,
          direction: direction
        }).then((res) => {
          if (res.data) {
            setPaginationControl(res.data)
            prodCheckDispatch({ type: 'CHANGE_SEARCH_INPUT', payload: value })
          }
        })
      }
    },
    [
      categories,
      checkSearch,
      direction,
      field,
      prodCheckDispatch,
      productId,
      refetch,
      rules,
      sbomId,
      severities,
      statues,
      totalRows
    ]
  )

  // SET ROW LENGTH
  const handleSetRow = async (e) => {
    disablePaginationControl()
    setTotalRows(Number(e.target.value))
    await refetch({
      projectId: productId,
      sbomId: sbomId,
      first: Number(e.target.value),
      last: undefined,
      after: undefined,
      before: undefined,
      field: field,
      direction: direction
    }).then((res) => {
      if (res.data) {
        setPaginationControl(res.data)
        prodCheckDispatch({ type: 'FETCH_DATA_SUCCESS' })
      }
    })
  }

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
          spacing={4}
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
          {filters && <CheckFilters />}
        </Stack>

        <Tooltip label='Re-Check'>
          <IconButton
            variant='solid'
            colorScheme='blue'
            fontWeight='normal'
            fontSize={'sm'}
            onClick={handleReCheck}
            icon={<FaCheckDouble size={16} />}
          />
        </Tooltip>
      </Flex>
    )
  }, [
    checkSearch,
    onSearchInputChange,
    handleSearch,
    handleClear,
    filters,
    handleReCheck
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
          prodCheckDispatch({ type: 'CLEAR_PROD_CHECK' })
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
          toast({
            description: 'A unique identifier has been added to the component',
            status: 'success',
            duration: 3000,
            position: 'top'
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
          prodCheckDispatch({ type: 'CLEAR_PROD_CHECK' })
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
          toast({
            description: 'A unique identifier has been added to the component',
            status: 'success',
            duration: 3000,
            position: 'top'
          })
        }, 1000)
      })
  }

  const handleOpen = (row) => {
    const { organizationRule } = row

    setActiveRow(row)

    // TIMESTAMP SELECTOR UI
    if (organizationRule.rule.shortDesc === 'Document creation timestamp') {
      return onOpen()
    }

    // CREATION TOOL SIDE DRAWER
    if (
      organizationRule.rule.shortDesc === 'Document has creation tools present'
    ) {
      return onCreationOpen()
    }

    // AUTHOR SIDE DRAWER
    if (organizationRule.rule.shortDesc === 'Document has authors present') {
      return onAuthorOpen()
    }

    // SUPPLIER SIDE DRAWER
    if (organizationRule.rule.shortDesc === 'Document has suppliers present') {
      return onDocSupOpen()
    }

    // SUPPLIER SIDE DRAWER
    if (
      organizationRule.rule.shortDesc === 'Document has data license specified'
    ) {
      sbomDispatch({ type: 'CLEAR_LICENSES' })
      return onDataLicenseOpen()
    }

    // PRIMARY COMPONENT SELECTOR MODAL
    if (
      organizationRule.rule.shortDesc === 'Document has a primary component'
    ) {
      return onPrimaryOpen()
    }

    // COMPONENT TYPE SELECTOR MODAL
    if (
      organizationRule.rule.shortDesc === 'Component has a valid type' ||
      organizationRule.rule.shortDesc === 'Component has a type'
    ) {
      return onTypeOpen()
    }

    // COMPONENT ADD SUPPLIER MODAL
    if (organizationRule.rule.shortDesc === 'Component has a supplier') {
      return onSupplierOpen()
    }

    // PURL MODAL
    if (
      organizationRule.rule.shortDesc === 'Component has a purl' ||
      organizationRule.rule.shortDesc === 'Component has a valid purl'
    ) {
      prodCompDispatch({
        type: 'SET_PURL_STRING',
        payload: 'pkg:type/name@version'
      })
      return onPurlOpen()
    }

    // CPE MODAL
    if (
      organizationRule.rule.shortDesc === 'Component has a valid cpe' ||
      organizationRule.rule.shortDesc === 'Component has a cpe'
    ) {
      prodCompDispatch({
        type: 'SET_CPE_STRING',
        payload: 'cpe:2.3:::::*:*:*:*:*:*:*'
      })
      return onCpeOpen()
    }

    // COMPONENT LICENSE SELECTOR MODAL
    if (
      organizationRule.rule.shortDesc === 'Component has license/s specified' ||
      organizationRule.rule.shortDesc === 'Componet has deprecated license/s' ||
      organizationRule.rule.shortDesc ===
        'Component has restrictive licenses specified'
    ) {
      return handleOpenLicense()
    }
  }

  const updateIssue = async (id) => {
    try {
      await updateResult({
        variables: {
          id: id,
          status: 'ignored'
        }
      })
    } catch (error) {
      console.log('Mutation error', error)
      toast({
        description: error,
        status: 'error',
        position: 'bottom',
        duration: 3000
      })
    }
  }

  const handleCreateCpe = (string) => {
    const cpeItem = cpeList?.find((item) => item === string)
    if (cpeItem) {
      toast({
        description: 'CPE already exists',
        status: 'error',
        position: 'top',
        duration: 3000
      })
    } else {
      setCpeList([...cpeList, string])
      setCpeValue('')
      setSelectedCpe(null)
      onCpeClose()
    }
  }

  const handleUpdateCpe = (string, id) => {
    const cpeItem = cpeList?.find((item) => item === string)
    if (cpeItem) {
      toast({
        description: 'CPE already exists',
        status: 'error',
        position: 'top',
        duration: 3000
      })
    } else if (cpeList?.find((item, index) => index === id)) {
      const updatedData = cpeList?.map((item, index) => {
        if (index === id) {
          return string
        }
        return item
      })
      setCpeList(updatedData)
      setCpeValue('')
      setSelectedCpe(null)
    }
  }

  // COLUMNS
  const columns = [
    // HEALTH CHECK ID
    {
      id: 'RULES_FRIENDLY_ID',
      name: 'CHECK ID',
      selector: (row) => {
        const { organizationRule } = row
        return <Text>{organizationRule.rule.friendlyId}</Text>
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
            colorScheme={sevColor(organizationRule.severity)}
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
          <Tooltip label={organizationRule.rule.longDesc} placement='top'>
            <Stack spacing={2} my={3}>
              {component !== null && (
                <Badge
                  fontSize={'sm'}
                  fontWeight={'medium'}
                  width={'fit-content'}
                  colorScheme='blue'
                  variant='subtle'
                >
                  {component.name}
                </Badge>
              )}
              <Text>
                {organizationRule.rule.longDesc !== null
                  ? `${organizationRule.rule.shortDesc?.substring(0, 300)}${
                      organizationRule.rule.shortDesc.length > 300 ? '...' : ''
                    }`
                  : ''}
              </Text>
            </Stack>
          </Tooltip>
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
          {timeSince(row.updatedAt)}
        </Tooltip>
      ),
      sortable: true,
      sortFunction: (a, b) => {
        const dateA = new Date(a.updatedAt)
        const dateB = new Date(b.updatedAt)
        return dateA - dateB // Sort in descending order
      },
      width: '150px',
      right: 'true'
    },
    // ACTION
    {
      id: 'RESOLUTION',
      name: 'RESOLUTION',
      selector: (row) => {
        const { status, id } = row
        return (
          <>
            {status === 'unresolved' && (
              <Stack direction={'row'} alignItems={'center'} spacing={2}>
                <Tooltip label='Fix'>
                  <IconButton
                    size='sm'
                    variant='solid'
                    colorScheme='blue'
                    fontWeight='normal'
                    icon={<BiSolidWrench size={18} />}
                    onClick={() =>
                      row.organizationRule.rule.shortDesc ===
                      'Component has a unique identifier'
                        ? handleComUpdate(row)
                        : row.organizationRule.rule.shortDesc ===
                            'Document has a unique identifier'
                          ? handleSbomUpdate(row)
                          : handleOpen(row)
                    }
                    disabled={customerView || !editChecks || !updateSboms}
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
                    disabled={customerView || !editChecks || !updateSboms}
                  />
                </Tooltip>
              </Stack>
            )}

            {status === 'manually-resolved' && (
              <Button
                size='sm'
                width={'70px'}
                fontSize={'xs'}
                variant='solid'
                colorScheme='whatsapp'
              >
                Fixed
              </Button>
            )}

            {status === 'ignored' && (
              <Button
                width={'70px'}
                size='sm'
                fontSize={'xs'}
                variant='solid'
                colorScheme='blackAlpha'
              >
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

  const handleRefetch = (after, before) => {
    disablePaginationControl()
    refetch({
      projectId: productId,
      sbomId: sbomId,
      first: after ? totalRows : undefined,
      after: after,
      last: before ? totalRows : undefined,
      before: before,
      search: searchInput !== '' ? searchInput : undefined,
      checkId: rules.includes('all') || rules.length === 0 ? undefined : rules,
      category:
        categories.includes('all') || categories.length === 0
          ? undefined
          : categories,
      severity:
        severities.includes('all') || severities.length === 0
          ? undefined
          : severities,
      status:
        statues.includes('all') || statues.length === 0 ? undefined : statues,
      field: field,
      direction: direction
    }).then((res) => {
      if (res.data) {
        setPaginationControl(res.data)
      }
    })
  }

  // SORT FUNCTION
  const handleSort = async (column, sortDirection) => {
    disablePaginationControl()
    await refetch({
      projectId: productId,
      sbomId: sbomId,
      first: after !== '' ? totalRows : undefined,
      after: after !== '' ? after : undefined,
      last: before !== '' ? totalRows : undefined,
      before: before !== '' ? before : undefined,
      search: searchInput !== '' ? searchInput : undefined,
      checkId: rules.includes('all') || rules.length === 0 ? undefined : rules,
      category:
        categories.includes('all') || categories.length === 0
          ? undefined
          : categories,
      severity:
        severities.includes('all') || severities.length === 0
          ? undefined
          : severities,
      status:
        statues.includes('all') || statues.length === 0 ? undefined : statues,
      field: column.id,
      direction: sortDirection === 'asc' ? 'ASC' : 'DESC'
    }).then((res) => {
      if (res.data) {
        setPaginationControl(res.data)
        prodCheckDispatch({
          type: 'SET_SORT_ORDER',
          payload: {
            field: column.id,
            direction: sortDirection === 'asc' ? 'ASC' : 'DESC'
          }
        })
      }
    })
  }

  const handlePreviousPage = async () => {
    disablePaginationControl()
    prodCheckDispatch({
      type: 'DECREMENT_PAGE',
      payload: checkResults?.pageInfo?.startCursor
    })
    handleRefetch(null, checkResults?.pageInfo?.startCursor)
  }

  const handleNextPage = async () => {
    disablePaginationControl()
    prodCheckDispatch({
      type: 'INCREMENT_PAGE',
      payload: {
        total: checkResults?.totalCount,
        after: checkResults?.pageInfo?.endCursor
      }
    })
    handleRefetch(checkResults?.pageInfo?.endCursor, null)
  }

  if (error) {
    return (
      <Card>
        <Text>Something went wrong</Text>
      </Card>
    )
  }

  return (
    <>
      <Flex flexDir={'column'} width={'100%'}>
        <DataTable
          columns={columns}
          data={checkResults?.nodes}
          onSort={handleSort}
          defaultSortAsc={false}
          defaultSortFieldId={field}
          customStyles={customStyles}
          progressPending={checkResults ? false : true}
          progressComponent={<CustomLoader />}
          persistTableHead
          subHeader
          subHeaderComponent={subHeader}
          responsive={true}
        />
      </Flex>

      {/* PAGINATION */}
      {checkResults && (
        <Pagination
          paginationSizes={paginationSizes}
          pageIndex={pageIndex}
          totalRows={totalRows}
          totalCount={checkResults?.totalCount}
          onPreviousPage={handlePreviousPage}
          onNextPage={handleNextPage}
          onSetRow={handleSetRow}
          hasNextPage={isNextActive}
          hasPreviousPage={isPrevActive}
        />
      )}

      {/* ACTIONS */}
      {activeRow !== null && (
        <>
          {/* SBOM DATA LICENSES DRAWER */}
          {isDataLicenseOpen && (
            <LicenseModal
              isOpen={isDataLicenseOpen}
              onClose={onDataLicenseClose}
              checkId={activeRow.organizationRule.rule.friendlyId}
              filterRefetch={filterRefetch}
              refetch={fetchCheckData}
              data={sbomData}
            />
          )}

          {/*  COMPONENT PRIMARY MODAL */}
          {isPrimaryOpen && (
            <CheckModal
              id={activeRow.id}
              componentId={null}
              totalRows={totalRows}
              refetch={fetchCheckData}
              filterRefetch={filterRefetch}
              shortDesc={activeRow.organizationRule.rule.shortDesc}
              checkId={activeRow.organizationRule.rule.friendlyId}
              isOpen={isPrimaryOpen}
              onClose={onPrimaryClose}
              getCpe={getCpe}
            />
          )}

          {/*  COMPONENT LICENSE MODAL */}
          {isLicenseOpen && (
            <CheckModal
              activeCheck={activeRow}
              componentId={activeRow.component.id}
              totalRows={totalRows}
              refetch={fetchCheckData}
              filterRefetch={filterRefetch}
              shortDesc={activeRow.organizationRule.rule.shortDesc}
              checkId={activeRow.organizationRule.rule.friendlyId}
              isOpen={isLicenseOpen}
              onClose={onLicenseClose}
            />
          )}

          {/*  COMPONENT TYPE MODAL */}
          {isTypeOpen && (
            <CheckModal
              id={activeRow.component.id}
              totalRows={totalRows}
              refetch={fetchCheckData}
              filterRefetch={filterRefetch}
              shortDesc={activeRow.organizationRule.rule.shortDesc}
              checkId={activeRow.organizationRule.rule.friendlyId}
              isOpen={isTypeOpen}
              onClose={onTypeClose}
            />
          )}

          {/* SUPPLIER MODAL */}
          {isSupplierOpen && (
            <SupplierModal
              activeCheck={activeRow.component}
              btnRef={supplierBtn}
              refetch={fetchCheckData}
              filterRefetch={filterRefetch}
              isOpen={isSupplierOpen}
              onClose={onSupplierClose}
              data={null}
              checkId={activeRow.organizationRule.rule.friendlyId}
              totalRows={totalRows}
            />
          )}

          {isOpen && (
            <CheckModal
              activeCheck={activeRow}
              totalRows={totalRows}
              refetch={fetchCheckData}
              filterRefetch={filterRefetch}
              checkId={activeRow.organizationRule.rule.friendlyId}
              shortDesc={activeRow.organizationRule.rule.shortDesc}
              isOpen={isOpen}
              onClose={onClose}
            />
          )}

          {/* PURL MODAL */}
          {isPurlOpen && (
            <PurlModal
              data={null}
              isOpen={isPurlOpen}
              onClose={onPurlClose}
              setPurlValue={setPurlValue}
              purlValue={purlValue}
              activeCheck={activeRow.component}
              totalRows={totalRows}
              refetch={fetchCheckData}
              filterRefetch={filterRefetch}
              checkId={activeRow.organizationRule.rule.friendlyId}
              getCpe={getCpe}
            />
          )}

          {/* CPE MODAL */}
          {isCpeOpen && (
            <CpeModal
              data={null}
              isOpen={isCpeOpen}
              onClose={onCpeClose}
              cpeValue={cpeValue}
              onCreateCpe={handleCreateCpe}
              onUpdateCpe={handleUpdateCpe}
              selectedCpe={selectedCpe}
              activeCheck={activeRow.component}
              refetch={fetchCheckData}
              filterRefetch={filterRefetch}
              totalRows={totalRows}
              checkId={activeRow.organizationRule.rule.friendlyId}
              getCpe={getCpe}
            />
          )}

          {/* CREATION TOOLS DRAWER */}
          {isCreationOpen && (
            <GeneralDataDrawer
              isOpen={isCreationOpen}
              onClose={onCreationClose}
              btnRef={creationToolBtn}
              data={null}
              selectedKey={'tools'}
              refetch={fetchCheckData}
              filterRefetch={filterRefetch}
              totalRows={totalRows}
              checkId={activeRow.organizationRule.rule.friendlyId}
            />
          )}

          {/* AUTHOR DRAWER */}
          {isAuthorOpen && (
            <GeneralDataDrawer
              isOpen={isAuthorOpen}
              onClose={onAuthorClose}
              btnRef={authorBtn}
              data={null}
              selectedKey={'author'}
              refetch={fetchCheckData}
              filterRefetch={fetchCheckData}
              totalRows={totalRows}
              checkId={activeRow.organizationRule.rule.friendlyId}
              getCpe={getCpe}
            />
          )}

          {/* DOCUMENT SUPPLIER DRAWER */}
          {isDocSupOpen && (
            <PriSupplierModal
              refetch={fetchCheckData}
              filterRefetch={filterRefetch}
              isOpen={isDocSupOpen}
              onClose={onDocSupClose}
              suppliers={null}
              totalRows={totalRows}
              checkId={activeRow.organizationRule.rule.friendlyId}
              shortDesc={activeRow.organizationRule.rule.shortDesc}
              getCpe={getCpe}
            />
          )}
        </>
      )}
    </>
  )
}

export default Checks
