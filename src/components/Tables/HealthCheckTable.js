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
  IconButton
} from '@chakra-ui/react'
import ComponentDrawer from 'components/Drawer/ComponentDrawer'
import GlobalContext from 'context/GlobalContext'
import { recheckHealth } from 'graphQL/Mutation'
import { reCheckHealth } from 'graphQL/Mutation'
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

const HealthCheckTable = ({
  data,
  setFilteredData,
  productId,
  sbomId,
  refetch
}) => {
  const customerView = location.pathname.startsWith('/customer')

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

  const [filteredItems, setFilteredItems] = useState([])

  const [healthRecheck] = useMutation(recheckHealth)

  useEffect(() => {
    const filterData = data.filter(
      (item) =>
        (item.healthCheckId &&
          item.healthCheckId
            .toLowerCase()
            .includes(filterText.toLowerCase())) ||
        (item.shortDesc &&
          item.shortDesc.toLowerCase().includes(filterText.toLowerCase()))
    )

    setFilteredItems(filterData)
  }, [filterText])

  const supplierBtn = useRef(null)
  const compBtn = useRef(null)

  const { isOpen, onOpen, onClose } = useDisclosure()

  const {
    isOpen: isCompOpen,
    onOpen: onCompOpen,
    onClose: onCompClose
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

  // EXTRACT ALL SEVERITY OPTIONS FROM HEALTH CHECK DATA
  const severityOptions = [
    ...new Set(healthCheckData.map((item) => item.severity))
  ]

  // EXTRACT ALL SHORT DESC STRING FROM HEALTH CHECK DATA
  const shortDescOptions = [
    ...new Set(healthCheckData.map((item) => item.shortDesc))
  ]

  const handleFilterChange = (selectedFilters) => {
    if (
      selectedFilters.severity.length === 0 &&
      selectedFilters.shortDesc.length === 0
    ) {
      // IF NO FILTER SELECTED RETURN DEFAULT HEALTH CHECK DATA
      setFilteredData(healthCheckData)
    } else {
      // IF ANY FILTER IS SELECTED RETURN SELECTED DATA
      const filtered = healthCheckData.filter(
        (item) =>
          (selectedFilters.severity.length === 0 ||
            selectedFilters.severity.includes(item.severity)) &&
          (selectedFilters.shortDesc.length === 0 ||
            selectedFilters.shortDesc.includes(item.shortDesc))
      )
      setFilteredData(filtered)
    }
  }

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
            severityOptions={severityOptions}
            shortDescOptions={shortDescOptions}
            onFilterChange={handleFilterChange}
          />
        </Stack>

        <Tooltip label='Re-Check'>
          <IconButton
            variant='solid'
            colorScheme='blue'
            fontWeight='normal'
            fontSize={'sm'}
            icon={<FaCheckDouble size={16} />}
          />
        </Tooltip>
      </Flex>
    )
  }, [
    filterText,
    resetPaginationToggle,
    handleFilterChange,
    data,
    setFilteredData
  ])

  const handleOpen = (row) => {
    const { shortDesc, organizationRule } = row

    setActiveRow(row)

    if (organizationRule.rule.friendlyId === 'SB-HC-17') {
      const pkg = PackageURL.fromString('pkg:generic/unknown@1.0')
      setPurlValue('pkg:generic/unknown@1.0')
      setPurlData(pkg)
      return onPurlOpen()
    }

    if (organizationRule.rule.friendlyId === 'SB-HC-20') {
      setCpeData({
        vendor: 'vendor',
        product: 'product',
        version: '1.0',
        targetHardware: '*'
      })
      setCpeValue('cpe:2.3:a:vendor:product:1.0:*:*:*:*:*:*:*')
      return onCpeOpen()
    }

    if (shortDesc === 'Primary Component') {
      return onPrimaryOpen()
    }

    if (
      shortDesc === 'Component Supplier' ||
      shortDesc === 'Component Author'
    ) {
      return onSupplierOpen()
    }

    if (shortDesc === 'Primary Author' || shortDesc === 'Primary Author') {
      return onSupplierOpen()
    }

    if (shortDesc === 'Creation Time') {
      return onOpen()
    }

    if (
      shortDesc === 'Primary Component Version' ||
      shortDesc === 'Component Name' ||
      shortDesc === 'Component Version' ||
      shortDesc === 'Component Author' ||
      shortDesc === 'Primary Relationship' ||
      shortDesc === 'Component Relationship' ||
      shortDesc === 'Component Type' ||
      shortDesc === 'Component Identifier'
    ) {
      return onCompOpen()
    }

    if (shortDesc === 'Component Identifier') {
      const newArray = [...healthCheckData]

      const updatedObjectIndex = newArray.findIndex((obj) => obj.id === id)

      if (updatedObjectIndex !== -1) {
        newArray[updatedObjectIndex].status = 'active'
      }

      setHealthCheckData(newArray)

      setTimeout(() => {
        updateIdenifier()
      }, 300)
    }
  }

  const updateIssue = () => {
    const updatedItems = healthCheckData.map((item) => {
      if (item.id === id) {
        return { ...item, status: 'ignored' }
      }
      return item
    })

    const selectedRow = updatedItems.find((row) => row.id === id)
    const filteredData = healthCheckData.filter((row) => row.id !== id)
    setHealthCheckData([...filteredData, selectedRow])
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
      width: '150px'
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
      width: '160px'
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
      width: '260px'
    },
    // LONG DESCRIPTION
    {
      id: 'longDesc',
      name: 'LONG DESCRIPTION',
      selector: (row) => {
        const { organizationRule } = row
        return (
          <Tooltip label={organizationRule.rule.longDesc} placement='top'>
            <Text>
              {organizationRule.rule.longDesc !== null
                ? `${organizationRule.rule.longDesc?.substring(0, 30)}${
                    organizationRule.rule.longDesc.length > 30 ? '...' : ''
                  }`
                : ''}
            </Text>
          </Tooltip>
        )
      },
      width: '250px'
    },
    // STATUS
    {
      id: 'status',
      name: 'STATUS',
      selector: (row) => row.status,
      sortable: true,
      width: '150px'
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
        const { status } = row
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
                    onClick={() => updateIssue(row)}
                    disabled={customerView}
                  />
                </Tooltip>
              </Stack>
            )}

            {status === 'active' && (
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

  return (
    <>
      {data.length > 0 ? (
        <Flex flexDir={'column'} width={'100%'}>
          <DataTable
            columns={columns}
            data={data}
            onSort={handleSort}
            defaultSortAsc
            defaultSortFieldId={'status'}
            customStyles={customStyles}
            progressPending={data.length === 0}
            subHeader
            subHeaderComponent={subHeaderComponentMemo}
            responsive={true}
          />
        </Flex>
      ) : (
        <Flex
          width={'100%'}
          mt={4}
          alignItems={'center'}
          justifyContent={'center'}
        >
          <Text>No health check data found</Text>
        </Flex>
      )}

      {/* ACTIONS */}
      {activeRow !== null && (
        <>
          {isPrimaryOpen && (
            <CheckModal
              id={activeRow.id}
              shortDesc={activeRow.shortDesc}
              isOpen={isPrimaryOpen}
              onClose={onPrimaryClose}
            />
          )}

          {isCompOpen && (
            <ComponentDrawer
              isOpen={isCompOpen}
              onClose={onCompClose}
              btnRef={compBtn}
              component={''}
              version={''}
              license={['0BSD']}
              type={'application'}
              cpes={['cpe:2.3:a:vendor:product:1.0:*:*:*:*:*:*:*']}
              purl={''}
              primary={false}
              internal={false}
              refetch={null}
              suppliers={null}
              shortDesc={activeRow.shortDesc}
            />
          )}

          {isSupplierOpen && (
            <SupplierModal
              id={activeRow.id}
              btnRef={supplierBtn}
              refetch={null}
              isOpen={onSupplierOpen}
              onClose={onSupplierClose}
              suppliers={[]}
              shortDesc={activeRow.shortDesc}
            />
          )}

          {isOpen && (
            <CheckModal
              id={activeRow.id}
              shortDesc={activeRow.shortDesc}
              isOpen={isOpen}
              onClose={onClose}
            />
          )}

          {isPurlOpen && (
            <PurlModal
              data={purlData}
              isOpen={isPurlOpen}
              onClose={onPurlClose}
              setPurlValue={setPurlValue}
              purlValue={purlValue}
            />
          )}

          {isCpeOpen && (
            <CpeModal
              data={cpeData}
              isOpen={isCpeOpen}
              onClose={onCpeClose}
              cpeValue={cpeValue}
              onCreateCpe={handleCreateCpe}
              onUpdateCpe={handleUpdateCpe}
              selectedCpe={selectedCpe}
            />
          )}
        </>
      )}
    </>
  )
}

export default HealthCheckTable
