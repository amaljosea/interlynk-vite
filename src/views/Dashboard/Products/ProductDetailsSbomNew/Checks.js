import { useLazyQuery, useMutation, useQuery } from '@apollo/client'
import React, { useCallback, useMemo, useRef, useState } from 'react'
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

import CustomLoader from 'components/CustomLoader'
import GeneralDataDrawer from 'components/Drawer/GeneralDataDrawer'
import LicenseModal from 'components/LicenseModal'
import ComponentCard from 'components/Misc/ComponentCard'
import Pagination from 'components/Pagination'

import { useGlobalState } from 'hooks/useGlobalState'
import { usePaginatatedQuery } from 'hooks/usePaginatatedQuery'

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

  const { userPermissions, dispatch } = useGlobalState()
  const { prodCompDispatch, sbomDispatch } = dispatch

  const { data: prodData } = useQuery(GetProductData, {
    skip: activeTab === 'checks' ? false : true,
    variables: { projectId: productId, sbomId }
  })

  const { sbom: sbomData } = prodData || ''

  const [checkState, setCheckState] = useState({
    field: 'CHECK_RESULTS_UPDATED_AT',
    direction: 'DESC'
  })

  const { nodes, paginationProps, refetch, loading, reset } =
    usePaginatatedQuery(GetCheckResults, {
      skip: activeTab === 'checks' ? false : true,
      selector: 'sbom.checkResults',
      variables: {
        sbomId: sbomId,
        projectId: productId,
        ...checkState
      }
    })

  const { totalRows } = paginationProps

  // GET HEALTH CHECK FILTER HEADS
  const { data: filterHead, refetch: filterRefetch } = useQuery(
    GetCheckFilterData,
    {
      fetchPolicy: 'network-only',
      skip: activeTab === 'checks' ? false : true,
      variables: {
        projectId: productId,
        sbomId
      }
    }
  )

  const handleRefetch = useCallback(() => {
    reset()
    refetch()
    filterRefetch()
  }, [filterRefetch, refetch, reset])

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
  const [updateResult] = useMutation(checkResultUpdate)

  const [getCpe] = useLazyQuery(CpeAutoComplete)
  const [updateComponent] = useMutation(UpdateComponent)
  const [updateSbom] = useMutation(sbomUpdate)

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

  const {
    isOpen: isCardOpen,
    onOpen: onCardOpen,
    onClose: onCardClose
  } = useDisclosure()

  const [healthRecheck] = useMutation(recheckHealth)

  const handleReCheck = useCallback(async () => {
    await healthRecheck({
      variables: {
        sbomId: sbomId
      }
    }).then((res) => {
      if (res.data) {
        handleRefetch()
        toast({
          description: 'Health re-check successfully',
          status: 'success',
          duration: 3000,
          position: 'top'
        })
      }
    })
  }, [handleRefetch, healthRecheck, sbomId, toast])

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
    filterHead,
    handleReCheck,
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
          handleRefetch()
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
    const { shortDesc } = organizationRule?.rule || ''
    setActiveRow(row)
    // TIMESTAMP SELECTOR UI
    if (shortDesc === 'Document creation timestamp') {
      return onOpen()
    }

    // CREATION TOOL SIDE DRAWER
    if (shortDesc === 'Document has creation tools present') {
      return onCreationOpen()
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

    // COMPONENT ADD SUPPLIER MODAL
    if (shortDesc === 'Component has a supplier') {
      return onSupplierOpen()
    }

    // PURL MODAL
    if (
      shortDesc === 'Component has a purl' ||
      shortDesc === 'Component has a valid purl'
    ) {
      prodCompDispatch({
        type: 'SET_PURL_STRING',
        payload: 'pkg:type/name@version'
      })
      return onPurlOpen()
    }

    // CPE MODAL
    if (
      shortDesc === 'Component has a valid cpe' ||
      shortDesc === 'Component has a cpe'
    ) {
      prodCompDispatch({
        type: 'SET_CPE_STRING',
        payload: 'cpe:2.3:::::*:*:*:*:*:*:*'
      })
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

  const onCheckOpen = (row) => {
    const { organizationRule } = row
    const { shortDesc } = organizationRule?.rule || ''
    if (shortDesc === 'Component has a unique identifier') {
      handleComUpdate(row)
    } else if (shortDesc === 'Document has a unique identifier') {
      handleSbomUpdate(row)
    } else {
      handleOpen(row)
    }
  }

  const updateIssue = async (id) => {
    await updateResult({
      variables: {
        id: id,
        status: 'ignored'
      }
    }).then((res) => {
      if (res?.data) {
        handleRefetch()
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
          <Stack spacing={2} my={3}>
            {component !== null && (
              <Badge
                fontSize={'sm'}
                variant='subtle'
                colorScheme='blue'
                cursor={'pointer'}
                width={'fit-content'}
                fontWeight={'medium'}
                onClick={() => {
                  setActiveRow(component)
                  onCardOpen()
                }}
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
      right: 'true'
    },
    // ACTION
    {
      id: 'RESOLUTION',
      name: 'RESOLUTION',
      selector: (row) => {
        const { status, id } = row
        const { friendlyId } = row?.organizationRule?.rule || ''
        const fixedIDs = ['SB-HC-4', 'SB-HC-5', 'SB-HC-6', 'SB-HC-16']
        const fixedByDefault = fixedIDs.includes(friendlyId)
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

            {fixedByDefault && (
              <Button
                size='sm'
                variant='solid'
                colorScheme='blue'
                fontWeight='normal'
                disabled={customerView || !editChecks || !updateSboms}
              >
                Fixed
              </Button>
            )}

            {status === 'resolved' && (
              <Button
                size='sm'
                fontSize={'xs'}
                variant='solid'
                colorScheme='whatsapp'
                onClick={() => onCheckOpen(row)}
                leftIcon={<CheckIcon />}
              >
                View
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
          columns={columns}
          data={nodes}
          onSort={handleSort}
          defaultSortAsc={false}
          defaultSortFieldId={checkState?.field}
          customStyles={customStyles}
          progressPending={loading}
          progressComponent={<CustomLoader />}
          persistTableHead
          subHeader
          subHeaderComponent={subHeader}
          responsive={true}
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
              isOpen={isDataLicenseOpen}
              onClose={onDataLicenseClose}
              activeRow={activeRow}
              refetch={handleRefetch}
              data={sbomData}
            />
          )}

          {/* COMPONENT PRIMARY MODAL */}
          {isPrimaryOpen && (
            <CheckModal
              id={activeRow.id}
              componentId={null}
              refetch={handleRefetch}
              filterRefetch={filterRefetch}
              activeRow={activeRow}
              isOpen={isPrimaryOpen}
              onClose={onPrimaryClose}
              getCpe={getCpe}
            />
          )}

          {/* COMPONENT LICENSE MODAL */}
          {isLicenseOpen && (
            <CheckModal
              activeCheck={activeRow}
              componentId={activeRow.component.id}
              refetch={handleRefetch}
              filterRefetch={filterRefetch}
              activeRow={activeRow}
              isOpen={isLicenseOpen}
              onClose={onLicenseClose}
            />
          )}

          {/* COMPONENT TYPE MODAL */}
          {isTypeOpen && (
            <CheckModal
              id={activeRow.component.id}
              refetch={handleRefetch}
              activeRow={activeRow}
              isOpen={isTypeOpen}
              onClose={onTypeClose}
            />
          )}

          {/* SUPPLIER MODAL */}
          {isSupplierOpen && (
            <SupplierModal
              id={null}
              data={null}
              activeRow={activeRow}
              refetch={handleRefetch}
              isOpen={isSupplierOpen}
              onClose={onSupplierClose}
            />
          )}

          {isOpen && (
            <CheckModal
              activeCheck={activeRow}
              refetch={handleRefetch}
              activeRow={activeRow}
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
              activeRow={activeRow}
              refetch={handleRefetch}
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
              setCpeValue={setCpeValue}
              onCreateCpe={handleCreateCpe}
              onUpdateCpe={handleUpdateCpe}
              selectedCpe={selectedCpe}
              activeRow={activeRow}
              refetch={handleRefetch}
              getCpe={getCpe}
              activeComp={null}
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
              refetch={handleRefetch}
              totalRows={totalRows}
              activeRow={activeRow}
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
              refetch={handleRefetch}
              filterRefetch={filterRefetch}
              activeRow={activeRow}
              getCpe={getCpe}
            />
          )}

          {/* DOCUMENT SUPPLIER DRAWER */}
          {isDocSupOpen && (
            <PriSupplierModal
              suppliers={null}
              refetch={handleRefetch}
              isOpen={isDocSupOpen}
              onClose={onDocSupClose}
              activeRow={activeRow}
              getCpe={getCpe}
            />
          )}
        </>
      )}

      {isCardOpen && (
        <ComponentCard
          isOpen={isCardOpen}
          onClose={onCardClose}
          data={activeRow}
        />
      )}
    </>
  )
}

export default Checks
