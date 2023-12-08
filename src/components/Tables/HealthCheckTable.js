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
import GlobalContext from 'context/GlobalContext'
import { CreateAutomation } from 'graphQL/Mutation'
import { UpdateComponent } from 'graphQL/Mutation'
import { recheckHealth, checkResultUpdate } from 'graphQL/Mutation'
import { CpeAutoComplete } from 'graphQL/Queries'
import React, { useContext, useMemo, useRef, useState } from 'react'
import DataTable from 'react-data-table-component'
import { BiSolidWrench } from 'react-icons/bi'
import { FaCheckDouble } from 'react-icons/fa'
import { GoSkip } from 'react-icons/go'
import { timeSince, sevColor, getFullDateAndTime } from 'utils'
import CpeModal from 'views/Dashboard/Products/components/CpeModal'
import PurlModal from 'views/Dashboard/Products/components/PurlModal'
import CheckFilterMenu from 'views/Sbom/components/CheckFilterMenu'
import CheckModal from 'views/Sbom/components/CheckModal'
import PriSupplierModal from 'views/Sbom/components/PriSupplierModal'
import RowLimit from 'views/Sbom/components/RowLimit'
import SearchFilter from 'views/Sbom/components/SearchFilter'
import SupplierModal from 'views/Sbom/components/SupplierModal'

const customStyles = {
  headCells: {
    style: {
      fontWeight: 'bold',
      color: '#2D3748',
      fontSize: '12px',
      letterSpacing: '1px'
    }
  },
  subHeader: {
    style: {
      padding: 0,
      margin: 0
    }
  }
}

const HealthCheckTable = ({
  productId,
  sbomId,
  data,
  components,
  pageIndex,
  setPageIndex,
  refetch,
  totalRows,
  setTotalRows,
  filterRefetch,
  sbomData
}) => {
  const customerView = location.pathname.startsWith('/customer')
  const toast = useToast()

  const {
    setLicenseType,
    setSpdxList,
    setSpdxLicense,
    setLicenseExp,
    checkFilters,
    checkField,
    setCheckField,
    checkDirection,
    setCheckDirection,
    checkSearchInput,
    setCheckSearchInput,
    checkRules,
    checkCategory,
    checkSeverity,
    checkStatus,
    setCpeString,
    setCheckAfter,
    setCheckBefore,
    setPurlString,
    setCustomList,
    setCustomLicense,
    checkAfter,
    checkBefore
  } = useContext(GlobalContext)

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
        search: checkSearchInput !== '' ? checkSearchInput : undefined,
        checkId: checkRules.includes('all') || checkRules.length === 0 ? undefined : checkRules,
        category: checkCategory.includes('all') || checkCategory.length === 0 ? undefined : checkCategory,
        severity: checkSeverity.includes('all') || checkSeverity.length === 0 ? undefined : checkSeverity,
        status: checkStatus.includes('all') || checkStatus.length === 0 ? undefined : checkStatus,
        first: totalRows,
        // after: checkAfter !== '' ? checkAfter : undefined,
        // last: checkBefore !== '' ? totalRows : undefined,
        // before: checkBefore !== '' ? checkBefore : undefined,
        field: checkField,
        direction: checkDirection
      }
    })
  }

  const [updateResult] = useMutation(checkResultUpdate, {
    onCompleted: () => fetchCheckData()
  })

  const [getCpe] = useLazyQuery(CpeAutoComplete)
  const [updateComponent] = useMutation(UpdateComponent)
  const [createAutoCheck] = useMutation(CreateAutomation)

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
    if (event.key === 'Enter' && checkSearchInput !== '') {
      await refetch({
        variables: {
          projectId: productId,
          sbomId: sbomId,
          search: checkSearchInput !== '' ? checkSearchInput : undefined,
          checkId:
            checkRules.includes('all') || checkRules.length === 0
              ? undefined
              : checkRules,
          category:
            checkCategory.includes('all') || checkCategory.length === 0
              ? undefined
              : checkCategory,
          severity:
            checkSeverity.includes('all') || checkSeverity.length === 0
              ? undefined
              : checkSeverity,
          status:
            checkStatus.includes('all') || checkStatus.length === 0
              ? undefined
              : checkStatus,
          first: totalRows,
          field: checkField,
          direction: checkDirection
        }
      })
      setPageIndex(1)
    }
  }

  // CLEAR SERACH
  const handleClear = async () => {
    setCheckSearchInput('')
    setPageIndex(1)
    await refetch({
      variables: {
        projectId: productId,
        sbomId: sbomId,
        search: undefined,
        checkId:
          checkRules.includes('all') || checkRules.length === 0
            ? undefined
            : checkRules,
        category:
          checkCategory.includes('all') || checkCategory.length === 0
            ? undefined
            : checkCategory,
        severity:
          checkSeverity.includes('all') || checkSeverity.length === 0
            ? undefined
            : checkSeverity,
        status:
          checkStatus.includes('all') || checkStatus.length === 0
            ? undefined
            : checkStatus,
        first: totalRows,
        field: checkField,
        direction: checkDirection
      }
    })
  }

  // SET ROW LENGTH
  const handleSetRow = async (e) => {
    setTotalRows(Number(e.target.value))
    await refetch({
      variables: {
        projectId: productId,
        sbomId: sbomId,
        first: Number(e.target.value),
        last: undefined,
        after: undefined,
        before: undefined,
        field: checkField,
        direction: checkDirection
      }
    })
    setPageIndex(1)
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
            filterText={checkSearchInput}
            setFilterText={setCheckSearchInput}
            onFilter={handleSearch}
            onClear={handleClear}
          />

          {/* FILTER COMPONENTS BASED ON ECOSYSTEM */}
          {checkFilters && (
            <CheckFilterMenu
              refetch={refetch}
              productId={productId}
              sbomId={sbomId}
              setPageIndex={setPageIndex}
              totalRows={totalRows}
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
  }, [checkFilters, handleReCheck])

  const handleOpenLicense = () => {
    setLicenseType('license_spdx')
    setSpdxList([])
    setSpdxLicense([])
    setLicenseExp('')
    setCustomList([])
    setCustomLicense([])
    onLicenseOpen()
  }

  const handleComUpdate = async (row) => {
    await updateComponent({
      variables: {
        id: row.componentId,
        sbomId: sbomId,
        uniqueId: true
      }
    }).then((res) => {
      if (res.data) {
        setPageIndex(1)
        healthRecheck({
          variables: {
            checkId: row.organizationRule.rule.friendlyId,
            sbomId: sbomId
          }
        })
      }
    })
  }

  // CHECK UNIQUE IDENTIFIER
  const handleUniqueID = async (row) => {
    setActiveRow(row)
    await createAutoCheck({
      variables: {
        projectId: productId,
        applicable: 'component',
        condition: 'missing',
        attr: 'uniq_serial',
        enabled: true,
        compName: row.component.name,
        compVersion: row.component.version,
        set: JSON.stringify({ value: '' }, null, 2)
      }
    }).then((res) => res.data && handleComUpdate(row))
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
      setPurlString('pkg:type/name@version')
      return onPurlOpen()
    }

    // CPE MODAL
    if (
      organizationRule.rule.shortDesc === 'Component has a valid cpe' ||
      organizationRule.rule.shortDesc === 'Component has a cpe'
    ) {
      setCpeString('cpe:2.3:::::*:*:*:*:*:*:*')
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
    const cpeItem = cpeList.find((item) => item === string)
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
    const cpeItem = cpeList.find((item) => item === string)
    if (cpeItem) {
      toast({
        description: 'CPE already exists',
        status: 'error',
        position: 'top',
        duration: 3000
      })
    } else if (cpeList.find((item, index) => index === id)) {
      const updatedData = cpeList.map((item, index) => {
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
                        ? handleUniqueID(row)
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
        search: checkSearchInput !== '' ? checkSearchInput : undefined,
        checkId:
          checkRules.includes('all') || checkRules.length === 0
            ? undefined
            : checkRules,
        category:
          checkCategory.includes('all') || checkCategory.length === 0
            ? undefined
            : checkCategory,
        severity:
          checkSeverity.includes('all') || checkSeverity.length === 0
            ? undefined
            : checkSeverity,
        status:
          checkStatus.includes('all') || checkStatus.length === 0
            ? undefined
            : checkStatus,
        field: checkField,
        direction: checkDirection
      }
    })
  }

  // SORT FUNCTION
  const handleSort = (column, sortDirection) => {
    setCheckField(column.id)
    setCheckDirection(sortDirection === 'asc' ? 'ASC' : 'DESC')
    refetch({
      variables: {
        projectId: productId,
        sbomId: sbomId,
        first: totalRows,
        search: checkSearchInput !== '' ? checkSearchInput : undefined,
        checkId:
          checkRules.includes('all') || checkRules.length === 0
            ? undefined
            : checkRules,
        category:
          checkCategory.includes('all') || checkCategory.length === 0
            ? undefined
            : checkCategory,
        severity:
          checkSeverity.includes('all') || checkSeverity.length === 0
            ? undefined
            : checkSeverity,
        status:
          checkStatus.includes('all') || checkStatus.length === 0
            ? undefined
            : checkStatus,
        field: column.id,
        direction: sortDirection === 'asc' ? 'ASC' : 'DESC'
      }
    })
  }

  const onPreviousPage = async () => {
    setPageIndex((prev) => pageIndex !== 0 && prev - 1)
    setCheckBefore(data.pageInfo.startCursor)
    setCheckAfter('')
    handleRefetch(null, data.pageInfo.startCursor)
  }

  const onNextPage = async () => {
    setPageIndex((prev) => prev < Math.ceil(data.totalCount) && prev + 1)
    setCheckAfter(data.pageInfo.endCursor)
    setCheckBefore('')
    handleRefetch(data.pageInfo.endCursor, null)
  }

  return (
    <>
      <Flex flexDir={'column'} width={'100%'}>
        <DataTable
          columns={columns}
          data={data && data.nodes}
          onSort={handleSort}
          defaultSortAsc={false}
          defaultSortFieldId={checkField}
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
              setPageIndex={setPageIndex}
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
              setPageIndex={setPageIndex}
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
              setPageIndex={setPageIndex}
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
              setPageIndex={setPageIndex}
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
              suppliers={[]}
              setPageIndex={setPageIndex}
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
              setPageIndex={setPageIndex}
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
              setPageIndex={setPageIndex}
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
              setPageIndex={setPageIndex}
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
              setPageIndex={setPageIndex}
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
              setPageIndex={setPageIndex}
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
