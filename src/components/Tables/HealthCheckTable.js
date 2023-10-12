import { useMutation } from '@apollo/client'
import {
  Button,
  Flex,
  Stack,
  Tag,
  TagLabel,
  useDisclosure,
  Input,
  Tooltip,
  Text,
  IconButton,
  Box,
  Skeleton,
  Badge,
  useToast
} from '@chakra-ui/react'
import ComponentDrawer from 'components/Drawer/ComponentDrawer'
import GeneralDataDrawer from 'components/Drawer/GeneralDataDrawer'
import GlobalContext from 'context/GlobalContext'
import { recheckHealth } from 'graphQL/Mutation'
import { checkResultUpdate } from 'graphQL/Mutation'
import { PackageURL } from 'packageurl-js'
import React, { useContext, useEffect, useMemo, useRef, useState } from 'react'
import DataTable from 'react-data-table-component'
import { BiSolidWrench } from 'react-icons/bi'
import { FaCheckDouble } from 'react-icons/fa'
import { GoSkip } from 'react-icons/go'
import { timeSince } from 'utils'
import { sevColor } from 'utils'
import CpeModal from 'views/Dashboard/Products/components/CpeModal'
import PurlModal from 'views/Dashboard/Products/components/PurlModal'
import CheckModal from 'views/Sbom/components/CheckModal'
import FilterMenu from 'views/Sbom/components/FilterMenu'
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

const FilterComponent = ({ filterText, onFilter, onClear }) => {
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

  return (
    <>
      <Input
        width={'400px'}
        id='search'
        type='text'
        placeholder='Search'
        aria-label='Search Input'
        ref={searchInputRef}
      />
    </>
  )
}

const HealthCheckTable = ({ productId, sbomId, data, refetch, components }) => {
  const customerView = location.pathname.startsWith('/customer')
  const toast = useToast()
  const { healthCheckData, setHealthCheckData } = useContext(GlobalContext)

  const [purlValue, setPurlValue] = useState('')
  const [purlData, setPurlData] = useState(null)

  const [cpeList, setCpeList] = useState([])
  const [cpeValue, setCpeValue] = useState('')
  const [cpeData, setCpeData] = useState(null)
  const [selectedCpe, setSelectedCpe] = useState(null)

  const [activeRow, setActiveRow] = useState(null)
  const [filterText, setFilterText] = useState('')
  const [resetPaginationToggle, setResetPaginationToggle] = useState(false)

  const [filteredData, setFilteredData] = useState(data.nodes)

  const [updateResult] = useMutation(checkResultUpdate)

  const filteredItems = data.nodes.filter(
    (item) =>
      (item.healthCheckId &&
        item.healthCheckId.toLowerCase().includes(filterText.toLowerCase())) ||
      (item.shortDesc &&
        item.shortDesc.toLowerCase().includes(filterText.toLowerCase()))
  )

  const supplierBtn = useRef(null)
  const creationToolBtn = useRef(null)
  const authorBtn = useRef(null)
  const docSupBtn = useRef(null)

  const { isOpen, onOpen, onClose } = useDisclosure()

  const {
    isOpen: isLicenseOpen,
    onOpen: onLicenseOpen,
    onClose: onLicenseClose
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

  const handleFilterChange = (selectedFilters) => {
    console.log(selectedFilters)
  }

  const [healthRecheck] = useMutation(recheckHealth)

  const handleReCheck = async () => {
    try {
      await healthRecheck({
        variables: {
          sbomId: sbomId
        }
      })
        .then(() =>
          refetch({
            projectId: productId,
            sbomId: sbomId,
            first: 10,
            field: 'STATUS',
            direction: 'ASC'
          })
        )
        .finally(() => {
          toast({
            description: 'Health re-check successfully',
            status: 'success',
            duration: 2000,
            position: 'top'
          })
        })
    } catch (error) {
      console.log('Mutation error', error)
    }
  }

  // EXTRACT ALL SEVERITY OPTIONS FROM HEALTH CHECK DATA
  const severity =
    data && data.nodes.map((item) => item.organizationRule.severity)
  // EXTRACT ALL SHORT DESC STRING FROM HEALTH CHECK DATA
  const category =
    data && data.nodes.map((item) => item.organizationRule.rule.shortDesc)
  // EXTRACT RESOLUTION STRING FROM HEALTH CHECK DATA
  const resolution = data && data.nodes.map((item) => item.status)

  // SUB HEADER
  const subHeaderComponentMemo = useMemo(() => {
    const handleClear = () => {
      if (filterText) {
        setResetPaginationToggle(!resetPaginationToggle)
        setFilterText('')
      }
    }

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
          <FilterComponent
            onFilter={(e) => setFilterText(e.target.value)}
            onClear={handleClear}
            filterText={filterText}
          />

          <FilterMenu
            onFilterChange={handleFilterChange}
            severity={severity}
            category={category}
            resolution={resolution}
          />
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
  }, [filterText, resetPaginationToggle, handleFilterChange, data])

  const handleOpen = (row) => {
    const { shortDesc, organizationRule } = row

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
      }).then(() =>
        refetch({
          projectId: productId,
          sbomId: sbomId,
          first: 10,
          field: 'STATUS',
          direction: 'ASC'
        })
      )
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
      id: 'checkId',
      name: 'CHECK ID',
      selector: (row) => {
        const { organizationRule } = row
        return <Text>{organizationRule.rule.friendlyId}</Text>
      },
      width: '120px'
    },
    // SEVERITY
    {
      id: 'serverity',
      name: 'SEVERITY',
      selector: (row) => {
        const { organizationRule } = row
        return (
          <Tag
            size='md'
            key='md'
            variant='subtle'
            colorScheme={sevColor(organizationRule.severity)}
            textTransform={'capitalize'}
            width={'100%'}
            alignItems={'center'}
            justifyContent={'center'}
          >
            <TagLabel>{organizationRule.severity}</TagLabel>
          </Tag>
        )
      },
      width: '120px'
    },
    // CATEGORY
    {
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
    },
    // LONG DESCRIPTION
    {
      id: 'longDesc',
      name: 'LONG DESCRIPTION',
      selector: (row) => {
        const { organizationRule, component } = row
        return (
          <Tooltip label={organizationRule.rule.longDesc} placement='top'>
            <Stack spacing={2} my={3}>
              {component !== null && (
                <Badge
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
                  ? `${organizationRule.rule.longDesc?.substring(0, 30)}${
                      organizationRule.rule.longDesc.length > 30 ? '...' : ''
                    }`
                  : ''}
              </Text>
            </Stack>
          </Tooltip>
        )
      },
      width: '320px'
    },
    // STATUS
    {
      id: 'status',
      name: 'STATUS',
      selector: (row) => row.status,
      sortable: true,
      width: '160px'
    },
    // UPDATED AT
    {
      id: 'updatedAt',
      name: 'UPDATED_AT',
      selector: (row) => timeSince(row.updatedAt),
      sortable: true,
      width: '150px'
    },
    // ACTION
    {
      id: 'action',
      name: 'ACTION',
      selector: (row) => {
        const { status, id } = row
        return (
          <>
            {status === 'unresolved' && (
              <Stack direction={'row'} alignItems={'center'} spacing={2}>
                <Tooltip label='Fix'>
                  <IconButton
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
              <Button size='sm' variant='solid' colorScheme='whatsapp'>
                Fixed
              </Button>
            )}

            {status === 'ignored' && (
              <Button size='sm' variant='solid' colorScheme='blackAlpha'>
                Ignored
              </Button>
            )}
          </>
        )
      }
    }
  ]

  const handleSort = (column, sortDirection) => {
    refetch({
      projectId: productId,
      sbomId: sbomId,
      field: column.name,
      direction: sortDirection === 'asc' ? 'ASC' : 'DESC'
    })
  }

  const [pageIndex, setPageIndex] = useState(1)

  const onPreviousPage = () => {
    setPageIndex((prev) => pageIndex !== 0 && prev - 1)
    refetch({
      projectId: productId,
      sbomId: sbomId,
      first: undefined,
      last: 10,
      before: data.pageInfo.startCursor,
      after: ''
    })
  }

  const onNextPage = () => {
    setPageIndex((prev) => prev < Math.ceil(data.totalCount) && prev + 1)
    refetch({
      projectId: productId,
      sbomId: sbomId,
      first: 10,
      last: undefined,
      after: data.pageInfo.endCursor,
      before: ''
    })
  }

  return (
    <>
      <Flex flexDir={'column'} width={'100%'}>
        <DataTable
          columns={columns}
          data={data.nodes}
          onSort={handleSort}
          // defaultSortAsc
          // defaultSortFieldId={'status'}
          customStyles={customStyles}
          subHeader
          subHeaderComponent={subHeaderComponentMemo}
          responsive={true}
        />
      </Flex>

      {/* PAGINATION */}
      <Flex
        flexDir={'row'}
        gap={4}
        alignItems={'center'}
        mt={6}
        justifyContent={'flex-start'}
      >
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
          Page {pageIndex} of {Math.ceil(data.totalCount / 10)}
        </Box>
      </Flex>

      {/* ACTIONS */}
      {activeRow !== null && (
        <>
          {/*  COMPONENT PRIMARY MODAL */}
          {isPrimaryOpen && (
            <CheckModal
              id={activeRow.id}
              refetch={refetch}
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
              id={activeRow.id}
              shortDesc={activeRow.organizationRule.rule.shortDesc}
              checkId={activeRow.organizationRule.rule.friendlyId}
              isOpen={isLicenseOpen}
              onClose={onLicenseClose}
            />
          )}

          {/*  COMPONENT TYPE MODAL */}
          {isTypeOpen && (
            <CheckModal
              id={activeRow.id}
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
              isOpen={onSupplierOpen}
              onClose={onSupplierClose}
              suppliers={[]}
              checkId={activeRow.organizationRule.rule.friendlyId}
            />
          )}

          {isOpen && (
            <CheckModal
              id={activeRow.id}
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
              refetch={refetch}
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
              checkId={activeRow.organizationRule.rule.friendlyId}
              shortDesc={activeRow.organizationRule.rule.shortDesc}
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
              checkId={activeRow.organizationRule.rule.friendlyId}
              shortDesc={activeRow.organizationRule.rule.shortDesc}
            />
          )}

          {/* DOCUMENT SUPPLIER DRAWER */}
          {isDocSupOpen && (
            <PriSupplierModal
              refetch={refetch}
              isOpen={isDocSupOpen}
              onClose={onDocSupClose}
              suppliers={null}
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
