import { useLazyQuery, useMutation } from '@apollo/client'
import {
  Button,
  Flex,
  Stack,
  Tag,
  TagLabel,
  useDisclosure,
  Tooltip,
  Text,
  IconButton,
  Box,
  Badge,
  useToast
} from '@chakra-ui/react'
import CustomLoader from 'components/CustomLoader'
import GeneralDataDrawer from 'components/Drawer/GeneralDataDrawer'
import LicenseModal from 'components/LicenseModal'
import { sbomUpdate } from 'graphQL/Mutation'
import { CreateAutomation } from 'graphQL/Mutation'
import { UpdateComponent } from 'graphQL/Mutation'
import { recheckHealth, checkResultUpdate } from 'graphQL/Mutation'
import { GetCheckFilterData } from 'graphQL/Queries'
import { CpeAutoComplete } from 'graphQL/Queries'
import { useGlobalState } from 'hooks/useGlobalState'
import React, { useMemo, useRef, useState, useEffect } from 'react'
import DataTable from 'react-data-table-component'
import { BiSolidWrench } from 'react-icons/bi'
import { FaCheckDouble } from 'react-icons/fa'
import { GoSkip } from 'react-icons/go'
import { timeSince, sevColor, getFullDateAndTime, customStyles } from 'utils'
import CpeModal from 'views/Dashboard/Products/components/CpeModal'
import PurlModal from 'views/Dashboard/Products/components/PurlModal'
import CheckFilterMenu from 'views/Sbom/components/CheckFilterMenu'
import CheckModal from 'views/Sbom/components/CheckModal'
import PriSupplierModal from 'views/Sbom/components/PriSupplierModal'
import RowLimit from 'views/Sbom/components/RowLimit'
import SearchFilter from 'views/Sbom/components/SearchFilter'
import SupplierModal from 'views/Sbom/components/SupplierModal'

const HealthCheckTable = ({ productId, sbomId, data, refetch, sbomData }) => {
  // GET HEALTH CHECK FILTER HEADS
  const [getCheckFilters, { refetch: filterRefetch }] =
    useLazyQuery(GetCheckFilterData)

  const customerView = location.pathname.startsWith('/customer')
  const toast = useToast()

  const { totalRows, setTotalRows, prodCheckState, dispatch } = useGlobalState()
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
  const { prodCompDispatch, prodCheckDispatch } = dispatch

  const [purlValue, setPurlValue] = useState('')
  const [purlData, setPurlData] = useState(null)
  const [cpeList, setCpeList] = useState([])
  const [cpeValue, setCpeValue] = useState('')
  const [cpeData, setCpeData] = useState(null)
  const [selectedCpe, setSelectedCpe] = useState(null)

  const [activeRow, setActiveRow] = useState(null)

  const fetchCheckData = () => {
    refetch({
      variables: {
        projectId: productId,
        sbomId: sbomId,
        search: searchInput !== '' ? searchInput : undefined,
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
          statues.includes('all') || statues.length === 0 ? undefined : statues,
        first: totalRows,
        // after: after !== '' ? after : undefined,
        // last: before !== '' ? totalRows : undefined,
        // before: before !== '' ? before : undefined,
        field: field,
        direction: direction
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

  const handleReCheck = () => {
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
  }

  // SEARCH COMPONENT
  const handleSearch = async (event) => {
    if (event.key === 'Enter' && searchInput !== '') {
      await refetch({
        variables: {
          projectId: productId,
          sbomId: sbomId,
          search: searchInput !== '' ? searchInput : undefined,
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
        }
      }).then((res) => {
        if (res.data) {
          prodCheckDispatch({ type: 'FETCH_DATA_SUCCESS' })
        }
      })
    }
  }

  // CLEAR SERACH
  const handleClear = async () => {
    await refetch({
      variables: {
        projectId: productId,
        sbomId: sbomId,
        search: undefined,
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
          statues.includes('all') || statues.length === 0 ? undefined : statues,
        first: totalRows,
        field: field,
        direction: direction
      }
    }).then(
      (res) => res.data && prodCheckDispatch({ type: 'CLEAR_SEARCH_INPUT' })
    )
  }

  // SET ROW LENGTH
  const handleSetRow = async (e) => {
    await refetch({
      variables: {
        projectId: productId,
        sbomId: sbomId,
        first: Number(e.target.value),
        last: undefined,
        after: undefined,
        before: undefined,
        field: field,
        direction: direction
      }
    }).then((res) => {
      if (res.data) {
        setTotalRows(Number(e.target.value))
        prodCheckDispatch({ type: 'FETCH_DATA_SUCCESS' })
      }
    })
  }

  // SUB HEADER
  const subHeaderComponentMemo = useMemo(() => {
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
            filterText={searchInput}
            onFilter={handleSearch}
            onClear={handleClear}
          />

          {/* FILTER COMPONENTS BASED ON ECOSYSTEM */}
          {filters && (
            <CheckFilterMenu
              refetch={refetch}
              productId={productId}
              sbomId={sbomId}
            />
          )}
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
  }, [filters, handleReCheck])

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
        uniqueId: true
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

    console.log('row', row)

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
      name: 'UPDATED AT',
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
                    disabled={customerView}
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
                    disabled={customerView}
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
    refetch({
      variables: {
        projectId: productId,
        sbomId: sbomId,
        first: after ? totalRows : undefined,
        after: after,
        last: before ? totalRows : undefined,
        before: before,
        search: searchInput !== '' ? searchInput : undefined,
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
          statues.includes('all') || statues.length === 0 ? undefined : statues,
        field: field,
        direction: direction
      }
    })
  }

  // SORT FUNCTION
  const handleSort = async (column, sortDirection) => {
    await refetch({
      variables: {
        projectId: productId,
        sbomId: sbomId,
        first: after !== '' ? totalRows : undefined,
        after: after !== '' ? after : undefined,
        last: before !== '' ? totalRows : undefined,
        before: before !== '' ? before : undefined,
        search: searchInput !== '' ? searchInput : undefined,
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
          statues.includes('all') || statues.length === 0 ? undefined : statues,
        field: column.id,
        direction: sortDirection === 'asc' ? 'ASC' : 'DESC'
      }
    }).then((res) => {
      if (res.data) {
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

  const onPreviousPage = async () => {
    prodCheckDispatch({
      type: 'DECREMENT_PAGE',
      payload: data.pageInfo.startCursor
    })
    handleRefetch(null, data.pageInfo.startCursor)
  }

  const onNextPage = async () => {
    prodCheckDispatch({
      type: 'INCREMENT_PAGE',
      payload: data.pageInfo.endCursor
    })
    handleRefetch(data.pageInfo.endCursor, null)
  }

  useEffect(() => {
    if (data) {
      getCheckFilters({
        variables: {
          projectId: productId,
          sbomId: sbomId
        }
      }).then((res) => {
        if (res.data) {
          prodCheckDispatch({
            type: 'ADD_FILTER_HEADS',
            payload: res.data.sbom.filters
          })
        }
      })
    }
  }, [data])

  return (
    <>
      <Flex flexDir={'column'} width={'100%'}>
        <DataTable
          columns={columns}
          data={data && data.nodes}
          onSort={handleSort}
          defaultSortAsc={false}
          defaultSortFieldId={field}
          customStyles={customStyles}
          progressPending={data ? false : true}
          progressComponent={<CustomLoader />}
          persistTableHead
          subHeader
          subHeaderComponent={subHeaderComponentMemo}
          responsive={true}
        />
      </Flex>

      {/* PAGINATION */}
      {data && (
        <Flex
          width={'100%'}
          flexDir={'row'}
          gap={4}
          alignItems={'center'}
          mt={6}
          justifyContent={'space-between'}
        >
          <Stack alignItems={'center'} direction={'row'} spacing={4}>
            <Button
              colorScheme='blue'
              onClick={onPreviousPage}
              isDisabled={!data.pageInfo.hasPreviousPage}
            >
              Previous
            </Button>
            <Button
              colorScheme='blue'
              onClick={onNextPage}
              isDisabled={!data.pageInfo.hasNextPage}
            >
              Next
            </Button>
            <Box>
              Page {pageIndex} of{' '}
              {data.totalCount === 0
                ? 1
                : Math.ceil(data.totalCount / totalRows)}
            </Box>
          </Stack>

          <RowLimit onChange={handleSetRow} name='healthCheck' />
        </Flex>
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
              data={purlData}
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
              data={cpeData}
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

export default HealthCheckTable
