import { useMutation } from '@apollo/client'
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
  useToast,
  Select,
  Skeleton
} from '@chakra-ui/react'
import CustomLoader from 'components/CustomLoader'
import GeneralDataDrawer from 'components/Drawer/GeneralDataDrawer'
import ProductSbomDrawer from 'components/Drawer/ProductSbomDrawer'
import GlobalContext from 'context/GlobalContext'
import { recheckHealth, checkResultUpdate } from 'graphQL/Mutation'
import { PackageURL } from 'packageurl-js'
import React, { useContext, useEffect, useMemo, useRef, useState } from 'react'
import DataTable from 'react-data-table-component'
import { BiSolidWrench } from 'react-icons/bi'
import { FaCheckDouble } from 'react-icons/fa'
import { GoSkip } from 'react-icons/go'
import { getFullDateAndTime } from 'utils'
import { timeSince, sevColor } from 'utils'
import CpeModal from 'views/Dashboard/Products/components/CpeModal'
import PurlModal from 'views/Dashboard/Products/components/PurlModal'
import CheckFilterMenu from 'views/Sbom/components/CheckFilterMenu'
import CheckModal from 'views/Sbom/components/CheckModal'
import PriSupplierModal from 'views/Sbom/components/PriSupplierModal'
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
    checkFilters,
    checkField,
    setCheckField,
    checkDirection,
    setCheckDirection
  } = useContext(GlobalContext)

  const [purlValue, setPurlValue] = useState('')
  const [purlData, setPurlData] = useState(null)

  const [cpeList, setCpeList] = useState([])
  const [cpeValue, setCpeValue] = useState('')
  const [cpeData, setCpeData] = useState(null)
  const [selectedCpe, setSelectedCpe] = useState(null)

  const [activeRow, setActiveRow] = useState(null)

  const [updateResult] = useMutation(checkResultUpdate, {
    onCompleted: () =>
      refetch({
        projectId: productId,
        sbomId: sbomId,
        first: totalRows,
        last: undefined,
        field: checkField,
        direction: checkDirection
      })
  })

  const supplierBtn = useRef(null)
  const creationToolBtn = useRef(null)
  const authorBtn = useRef(null)
  const licenseBtn = useRef(null)

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
    onCompleted: () =>
      refetch({
        projectId: productId,
        sbomId: sbomId,
        first: totalRows,
        field: checkField,
        direction: checkDirection
      })
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

  // SET ROW LENGTH
  const handleSetRow = async (e) => {
    setTotalRows(Number(e.target.value))
    await refetch({
      projectId: productId,
      sbomId: sbomId,
      first: Number(e.target.value),
      field: checkField,
      direction: checkDirection
    })
    setPageIndex(1)
  }

  const searchInputRef = useRef()

  const focusSearchInput = () => {
    if (searchInputRef?.current) {
      searchInputRef?.current.focus()
    }
  }

  const handleKeyPress = (e) => {
    if (e.ctrlKey && e.key === '/') {
      focusSearchInput()
    }
  }

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress)

    return () => {
      window.removeEventListener('keydown', handleKeyPress)
    }
  }, [])

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
      const pkg = PackageURL.fromString('pkg:generic/unknown@1.0')
      setPurlValue('pkg:generic/unknown@1.0')
      setPurlData(pkg)
      return onPurlOpen()
    }

    // CPE MODAL
    if (
      organizationRule.rule.shortDesc === 'Component has a valid cpe' ||
      organizationRule.rule.shortDesc === 'Component has a cpe'
    ) {
      setCpeData({
        vendor: 'vendor',
        product: 'product',
        version: '1.0',
        targetHardware: '*'
      })
      setCpeValue('cpe:2.3:a:vendor:product:1.0:*:*:*:*:*:*:*')
      return onCpeOpen()
    }

    // COMPONENT LICENSE SELECTOR MODAL
    if (
      organizationRule.rule.shortDesc === 'Component has license/s specified' ||
      organizationRule.rule.shortDesc === 'Componet has deprecated license/s' ||
      organizationRule.rule.shortDesc ===
        'Component has restrictive licenses specified'
    ) {
      return onLicenseOpen()
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
      id: 'CHECK_ID',
      name: 'CHECK ID',
      selector: (row) => {
        const { organizationRule } = row
        return <Text>{organizationRule.rule.friendlyId}</Text>
      },
      width: '120px'
    },
    // SEVERITY
    {
      id: 'SEVERITY',
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
      width: '120px'
    },
    // CATEGORY
    /*     {
      id: 'category',
      name: 'CATEGORY',
      selector: (row) => {
        const { organizationRule } = row
        return (
          <Tooltip label={organizationRule.rule.shortDesc} placement='top'>
            <Text>
              {organizationRule.rule.shortDesc !== null
                ? `${organizationRule.rule.shortDesc?.substring(0, 30)}${
                    organizationRule.rule.shortDesc.length > 30 ? '...' : ''
                  }`
                : ''}
            </Text>
          </Tooltip>
        )
      },
      width: '250px'
    }, */
    // LONG DESCRIPTION
    {
      id: 'DESCRIPTION',
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
      width: '900px'
    },
    /*     // STATUS
    {
      id: 'status',
      name: 'STATUS',
      selector: (row) => row.status,
      sortable: true,
      width: '160px'
    }, */
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
      width: '150px'
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
                    onClick={() => handleOpen(row)}
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
      }
    }
  ]

  // SORT FUNCTION
  const handleSort = (column, sortDirection) => {
    setCheckField(column.id)
    setCheckDirection(sortDirection === 'asc' ? 'ASC' : 'DESC')
    refetch({
      projectId: productId,
      sbomId: sbomId,
      first: totalRows,
      last: undefined,
      field: column.id,
      direction: sortDirection === 'asc' ? 'ASC' : 'DESC'
    })
  }

  const [loading, setLoading] = useState(false)

  const onPreviousPage = async () => {
    setLoading(true)
    setPageIndex((prev) => pageIndex !== 0 && prev - 1)
    await refetch({
      projectId: productId,
      sbomId: sbomId,
      first: undefined,
      last: totalRows,
      before: data.pageInfo.startCursor,
      after: undefined,
      field: checkField,
      direction: checkDirection
    }).then(() => {
      setTimeout(() => {
        setLoading(false)
      }, 2000)
    })
  }

  const onNextPage = async () => {
    setLoading(true)
    setPageIndex((prev) => prev < Math.ceil(data.totalCount) && prev + 1)
    await refetch({
      projectId: productId,
      sbomId: sbomId,
      first: totalRows,
      last: undefined,
      after: data.pageInfo.endCursor,
      before: undefined,
      field: checkField,
      direction: checkDirection
    }).then(() => {
      setTimeout(() => {
        setLoading(false)
      }, 2000)
    })
  }

  return (
    <>
      <Flex flexDir={'column'} width={'100%'}>
        <DataTable
          columns={columns}
          data={data.nodes}
          onSort={handleSort}
          defaultSortAsc={false}
          defaultSortFieldId={checkField}
          customStyles={customStyles}
          progressPending={loading}
          progressComponent={<CustomLoader />}
          persistTableHead
          subHeader
          subHeaderComponent={subHeaderComponentMemo}
          responsive={true}
        />
      </Flex>

      {/* PAGINATION */}
      {!loading && (
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

          <Stack alignItems={'center'} direction={'row'} spacing={4}>
            <Text>Show</Text>
            <Select width={20} value={totalRows} onChange={handleSetRow}>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </Select>
          </Stack>
        </Flex>
      )}

      {/* ACTIONS */}
      {activeRow !== null && (
        <>
          {/* SBOM DATA LICENSES DRAWER */}
          {isDataLicenseOpen && (
            <ProductSbomDrawer
              totalRows={totalRows}
              checkId={activeRow.organizationRule.rule.friendlyId}
              filterRefetch={filterRefetch}
              isOpen={isDataLicenseOpen}
              onClose={onDataLicenseClose}
              btnRef={licenseBtn}
              name={sbomData.project.name}
              refetch={refetch}
              sbomData={sbomData}
              type={sbomData.format}
            />
          )}

          {/*  COMPONENT PRIMARY MODAL */}
          {isPrimaryOpen && (
            <CheckModal
              id={activeRow.id}
              componentId={null}
              totalRows={totalRows}
              refetch={refetch}
              filterRefetch={filterRefetch}
              shortDesc={activeRow.organizationRule.rule.shortDesc}
              checkId={activeRow.organizationRule.rule.friendlyId}
              isOpen={isPrimaryOpen}
              components={components}
              onClose={onPrimaryClose}
            />
          )}

          {/*  COMPONENT LICENSE MODAL */}
          {isLicenseOpen && (
            <CheckModal
              id={activeRow.component.id}
              componentId={activeRow.component.id}
              totalRows={totalRows}
              refetch={refetch}
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
              refetch={refetch}
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
              id={activeRow.component.id}
              btnRef={supplierBtn}
              refetch={refetch}
              filterRefetch={filterRefetch}
              isOpen={onSupplierOpen}
              onClose={onSupplierClose}
              suppliers={[]}
              checkId={activeRow.organizationRule.rule.friendlyId}
              totalRows={totalRows}
            />
          )}

          {isOpen && (
            <CheckModal
              id={activeRow.id}
              totalRows={totalRows}
              refetch={refetch}
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
              id={activeRow.component.id}
              totalRows={totalRows}
              refetch={refetch}
              filterRefetch={filterRefetch}
              checkId={activeRow.organizationRule.rule.friendlyId}
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
              id={activeRow.component.id}
              refetch={refetch}
              filterRefetch={filterRefetch}
              totalRows={totalRows}
              setPageIndex={setPageIndex}
              checkId={activeRow.organizationRule.rule.friendlyId}
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
              refetch={refetch}
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
              refetch={refetch}
              filterRefetch={filterRefetch}
              totalRows={totalRows}
              checkId={activeRow.organizationRule.rule.friendlyId}
            />
          )}

          {/* DOCUMENT SUPPLIER DRAWER */}
          {isDocSupOpen && (
            <PriSupplierModal
              refetch={refetch}
              filterRefetch={filterRefetch}
              isOpen={isDocSupOpen}
              onClose={onDocSupClose}
              suppliers={null}
              totalRows={totalRows}
              checkId={activeRow.organizationRule.rule.friendlyId}
              shortDesc={activeRow.organizationRule.rule.shortDesc}
            />
          )}
        </>
      )}
    </>
  )
}

export default HealthCheckTable
