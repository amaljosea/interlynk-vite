import { useLazyQuery, useMutation, useQuery } from '@apollo/client'
import { useTour } from '@reactour/tour'
import { addDays, differenceInDays, parseISO } from 'date-fns'
import { useCallback, useEffect, useMemo, useState } from 'react'
import DataTable from 'react-data-table-component'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import {
  customStyles,
  getFormat,
  getFullDateAndTime,
  getType,
  timeSince
} from 'utils'
import { getLink } from 'utils'
import { ProductDetailsTabs } from 'utils/TabsObjects'
import SbomList from 'views/Dashboard/Products/components/SbomList'
import SearchFilter from 'views/Sbom/components/SearchFilter'

import { RepeatIcon } from '@chakra-ui/icons'
import {
  Button,
  Flex,
  Grid,
  GridItem,
  IconButton,
  ListItem,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Link as Olink,
  Portal,
  Spinner,
  Stack,
  Tag,
  TagLabel,
  Text,
  Tooltip,
  UnorderedList,
  useColorModeValue,
  useDisclosure
} from '@chakra-ui/react'

import CustomLoader from 'components/CustomLoader'
import ProductSbomDrawer from 'components/Drawer/ProductSbomDrawer'
import ToolsDrawer from 'components/Drawer/ToolsDrawer'
import VulnBadge from 'components/Misc/VulnBadge'
import Pagination from 'components/Pagination'

import { useGlobalState } from 'hooks/useGlobalState'
import { useHasPermission } from 'hooks/useHasPermission'
import { usePaginatatedQuery } from 'hooks/usePaginatatedQuery'
import { useProductUrlContext } from 'hooks/useProductUrlContext'
import { useShouldShowDemoFeatures } from 'hooks/useShouldShowDemoFeatures'

import { sbomDelete } from 'graphQL/Mutation'
import {
  GetSbomAlternatives,
  GetShareSbomAlternatives,
  GetVersionsTable,
  ShareVersionTable,
  UserSettings
} from 'graphQL/Queries'

import {
  FaCodeCompare,
  FaEllipsisVertical,
  FaScrewdriverWrench
} from 'react-icons/fa6'
import { IoMdWarning } from 'react-icons/io'

const VersionsTable = ({
  handleSort,
  projectGroup,
  retentionTime,
  filters,
  setFilters
}) => {
  const navigate = useNavigate()
  const params = useParams()
  const productId = params.productid
  const signedUrlParams = sessionStorage.getItem('signedUrlParams')
  const {
    clearSelect,
    setClearSelect,
    selectedSbom,
    setSelectedSbom,
    versionState,
    dispatch
  } = useGlobalState()
  const { searchInput } = versionState
  const { prodVulnDispatch, prodCompDispatch } = dispatch
  const { generateProductVersionDetailPageUrlFromCurrentUrl } =
    useProductUrlContext()
  const { shouldShowDemoFeatures } = useShouldShowDemoFeatures()
  const [filterText, setFilterText] = useState(searchInput)
  const [isLoading, setIsLoading] = useState(false)
  const [activeRow, setActiveRow] = useState(null)

  const currentDate = new Date()

  const headColor = useColorModeValue('#4A5568', '#CBD5E0')
  const textColor = useColorModeValue('#1A202C', '#F7FAFC')
  const warningColor = useColorModeValue('#E53E3E', '#F56565')

  const [getAlternatives, { data: sbomAlts }] = useLazyQuery(
    signedUrlParams ? GetShareSbomAlternatives : GetSbomAlternatives
  )

  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const tab = queryParams.get('tab')

  const { setIsOpen } = useTour()

  const { VERSIONS } = ProductDetailsTabs
  const { nodes, paginationProps, loading, refetch } = usePaginatatedQuery(
    signedUrlParams ? ShareVersionTable : GetVersionsTable,
    {
      skip: (tab === VERSIONS || tab === null) && !isToolOpen ? false : true,
      selector: signedUrlParams
        ? 'shareLynkQuery.project.sbomVersions'
        : 'project.sbomVersions',
      variables: {
        id: productId,
        ...filters
      },
      onCompleted: () => setClearSelect(false)
    }
  )

  useQuery(UserSettings, {
    skip: tab !== VERSIONS || signedUrlParams,
    onCompleted: (data) => {
      const { productDetailsOnboardingCompleted: hasSeenTour } =
        data?.currentUserSettings || ''
      if (!hasSeenTour) {
        // setTimeout(() => {
        //  setIsOpen(true)
        // }, 1000)
      }
    }
  })

  const createSbom = useHasPermission({
    parentKey: 'view_sbom',
    childKey: 'update_sbom'
  })

  const archiveSbom = useHasPermission({
    parentKey: 'view_sbom',
    childKey: 'archive_sbom'
  })

  const [deleteSbom] = useMutation(sbomDelete, {
    onCompleted: (data) => data && refetch({ id: productId })
  })

  const {
    isOpen: isToolOpen,
    onOpen: onToolOpen,
    onClose: onToolClose
  } = useDisclosure()
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose
  } = useDisclosure()
  const {
    isOpen: isListOpen,
    onOpen: onListOpen,
    onClose: onListClose
  } = useDisclosure()
  const {
    isOpen: isSbomOpen,
    onOpen: onSbomOpen,
    onClose: onSbomClose
  } = useDisclosure()

  const onFilterSev = async (value) => {
    prodVulnDispatch({ type: 'FILTER_SEVERITY', payload: value })
    prodVulnDispatch({ type: 'FILTER_INCLUDE', payload: ['parts'] })
  }

  const handleListSbom = (row) => {
    getAlternatives({
      variables: {
        projectId: signedUrlParams ? undefined : productId,
        sbomId: row?.id
      }
    })
    setActiveRow(row)
    onListOpen()
  }

  const onSelectLicenses = (row) => {
    const { id } = row
    navigate(
      generateProductVersionDetailPageUrlFromCurrentUrl({
        sbomid: id,
        paramsObj: {
          tab: 'licenses'
        }
      })
    )
  }

  useEffect(() => {
    const refetchInterval = setInterval(() => {
      const inProgress = nodes?.some(
        (item) => item?.vulnRunStatus === 'IN_PROGRESS'
      )
      if (inProgress) {
        refetch()
      } else {
        clearInterval(refetchInterval)
      }
    }, 5000)
    return () => clearInterval(refetchInterval)
  }, [nodes, refetch])

  const onStartTour = () => {
    if (signedUrlParams) {
      setIsOpen(false)
    } else {
      prodCompDispatch({ type: 'CLEAR_PROD_COMP' })
    }
  }

  const retention = retentionTime && Math.floor(retentionTime)

  // COLUMNS
  const columns = [
    // VERSION
    {
      id: 'SBOMS_PROJECT_VERSION',
      name: 'VERSION',
      selector: (row, index) => {
        const { projectVersion, createdAt } = row
        const parsedCreatedDate = parseISO(createdAt)
        const endDate = addDays(parsedCreatedDate, retention)
        const diff = differenceInDays(endDate, currentDate)
        const daysUntilDeletion = diff <= 7 && diff >= 0 && retention !== 0
        // const exceedingItems = endDate > currentDate
        const link = generateProductVersionDetailPageUrlFromCurrentUrl({
          sbomid: row.id,
          paramsObj: {
            tab: 'general'
          }
        })
        return (
          <Grid
            my={3}
            gap={1}
            alignItems={'center'}
            justifyContent={'center'}
            templateColumns='repeat(7, 1fr)'
          >
            <GridItem
              colSpan={1}
              width={'40px'}
              hidden={!shouldShowDemoFeatures}
            >
              <Tooltip label={getFormat(projectVersion)} placement='top'>
                <Olink
                  href={getLink(projectVersion)}
                  isExternal={getLink(projectVersion) === '#' ? false : true}
                >
                  <IconButton
                    size='xs'
                    isRound={true}
                    color={textColor}
                    icon={getType(projectVersion)}
                  />
                </Olink>
              </Tooltip>
            </GridItem>
            <GridItem
              gap={2}
              colSpan={6}
              display={'flex'}
              flexDirection={'row'}
              alignItems={'center'}
            >
              <Link to={link} onClick={onStartTour}>
                <Text
                  className={index === 0 ? 'versions' : ''}
                  color={'blue.500'}
                  minWidth='100%'
                  fontSize={14}
                >
                  {projectVersion}
                </Text>
              </Link>
              {daysUntilDeletion && !signedUrlParams && (
                <Tooltip
                  label={`Marked for deletion on ${endDate ? new Date(endDate).toLocaleDateString() : ''}`}
                >
                  <IconButton
                    size='xs'
                    color={warningColor}
                    icon={<IoMdWarning size={16} />}
                  />
                </Tooltip>
              )}
            </GridItem>
          </Grid>
        )
      },
      width: '15%',
      wrap: true,
      sortable: true
    },
    // COMPONENTS
    {
      id: 'COMPONENTS',
      name: 'COMPONENTS',
      selector: (row) => {
        const { stats, id } = row
        return (
          <Link
            to={generateProductVersionDetailPageUrlFromCurrentUrl({
              sbomid: id,
              paramsObj: {
                tab: 'components'
              }
            })}
          >
            <Tag size='md' variant='subtle' width={16} colorScheme={'blue'}>
              <TagLabel mx={'auto'}>{stats?.compCount}</TagLabel>
            </Tag>
          </Link>
        )
      },
      width: '11%'
    },
    // LICENSES
    {
      id: 'LICENSES',
      name: 'LICENSES',
      selector: (row) => {
        const { stats } = row
        return (
          <Tag
            size='md'
            variant='subtle'
            width={16}
            colorScheme={'blue'}
            cursor={'pointer'}
            onClick={() => onSelectLicenses(row)}
          >
            <TagLabel mx={'auto'}>{stats?.compLicenseCount}</TagLabel>
          </Tag>
        )
      },
      width: '8%'
    },
    // VULNERABILITIES
    {
      id: 'VULNERABILITIES',
      name: 'VULNERABILITIES',
      selector: (row) => {
        const { stats, id, vulnRunStatus } = row
        const link = generateProductVersionDetailPageUrlFromCurrentUrl({
          sbomid: id,
          paramsObj: {
            tab: 'vulnerabilities'
          }
        })
        return (
          <Stack fontWeight={'medium'} direction={'row'}>
            <Link to={link} onClick={() => onFilterSev(['critical'])}>
              <VulnBadge color='red' label='Critical' status={vulnRunStatus}>
                {stats?.vulnStats?.critical || 0}
              </VulnBadge>
            </Link>
            <Link to={link} onClick={() => onFilterSev(['high'])}>
              <VulnBadge color='orange' label='High' status={vulnRunStatus}>
                {stats?.vulnStats?.high || 0}
              </VulnBadge>
            </Link>
            <Link to={link} onClick={() => onFilterSev(['medium'])}>
              <VulnBadge color='yellow' label='Medium' status={vulnRunStatus}>
                {stats?.vulnStats?.medium || 0}
              </VulnBadge>
            </Link>
            <Link to={link} onClick={() => onFilterSev(['low'])}>
              <VulnBadge color='green' label='Low' status={vulnRunStatus}>
                {stats?.vulnStats?.low || 0}
              </VulnBadge>
            </Link>
            <Link to={link} onClick={() => onFilterSev(['unknown'])}>
              <VulnBadge color='gray' label='Unknown' status={vulnRunStatus}>
                {stats?.vulnStats?.unknown || 0}
              </VulnBadge>
            </Link>
          </Stack>
        )
      },
      width: '26%'
    },
    // STATUS
    {
      id: 'STATUS',
      name: 'STATUS',
      selector: (row) => {
        const { lifecycle } = row

        return (
          <Tag width={24} colorScheme='cyan' textTransform={'capitalize'}>
            <TagLabel mx={'auto'}>{lifecycle}</TagLabel>
          </Tag>
        )
      },
      width: '10%'
    },
    // CREATED AT
    {
      id: 'SBOMS_CREATED_AT',
      name: 'IMPORTED',
      selector: (row) => {
        const { createdAt } = row
        return (
          <Tooltip label={getFullDateAndTime(createdAt)} placement='top'>
            <Text color={textColor} textAlign={'right'}>
              {timeSince(createdAt)}
            </Text>
          </Tooltip>
        )
      },
      width: '10%',
      right: 'true',
      sortable: true
    },
    // UPDATED AT
    {
      id: 'SBOMS_UPDATED_AT',
      name: 'UPDATED',
      selector: (row) => {
        const { updatedAt } = row
        return (
          <Tooltip label={getFullDateAndTime(updatedAt)} placement='top'>
            <Text color={textColor} textAlign={'right'}>
              {timeSince(updatedAt)}
            </Text>
          </Tooltip>
        )
      },
      sortable: true,
      width: '10%',
      right: 'true'
    },
    // ACTIONS
    {
      id: 'ACTION',
      name: 'ACTION',
      selector: (row) => {
        return (
          <Menu>
            <MenuButton
              as={IconButton}
              icon={<FaEllipsisVertical />}
              variant='none'
              color='gray.400'
            />
            <Portal>
              <MenuList fontSize={16}>
                <MenuItem onClick={() => handleListSbom(row)}>
                  List SBOM
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    setActiveRow(row)
                    onDeleteOpen()
                  }}
                  isDisabled={!archiveSbom || signedUrlParams}
                >
                  Delete
                </MenuItem>
              </MenuList>
            </Portal>
          </Menu>
        )
      },
      right: 'true'
    }
  ]

  const handleDelete = () => {
    setIsLoading(true)
    deleteSbom({
      variables: {
        id: activeRow.id
      }
    }).then((res) => {
      const { errors } = res?.data?.sbomDelete || ''
      if (errors?.length > 0) {
        console.log(errors[0])
      } else {
        setIsLoading(false)
        setClearSelect(true)
        setSelectedSbom([])
        onDeleteClose()
      }
    })
  }

  // REFRESH PRODUCTS
  const handleRefresh = useCallback(async () => {
    refetch()
  }, [refetch])

  const onBuildSbom = useCallback(() => {
    prodCompDispatch({ type: 'CLEAR_LICENSES' })
    onSbomOpen()
  }, [onSbomOpen, prodCompDispatch])

  const handleChange = (state) => {
    setSelectedSbom(state?.selectedRows)
  }

  const setSearchFilter = useCallback(
    (value) => {
      setFilters((oldFilter) => ({
        ...oldFilter,
        search: value
      }))
    },
    [setFilters]
  )

  // CLEAR SERACH
  const handleClear = useCallback(async () => {
    setFilterText('')
    setFilters((oldFilter) => ({
      ...oldFilter,
      search: undefined
    }))
  }, [setFilters])

  // ON SEARCH INPUT CHANGE
  const onSearchInputChange = useCallback(
    (e) => {
      const { value } = e.target
      if (value === '') {
        handleClear()
      } else {
        setFilterText(value)
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

  const subHeaderComponent = useMemo(() => {
    return (
      <Flex
        width={'100%'}
        alignItems={'center'}
        justifyContent={'space-between'}
      >
        <Stack direction={'row'} alignItems={'center'} spacing={3}>
          <SearchFilter
            id='versions'
            filterText={filterText}
            onChange={onSearchInputChange}
            onClear={handleClear}
            onFilter={handleSearch}
          />
          {selectedSbom?.length === 1 && (
            <Text color={'red.500'}>
              ** Select one more version to enable comparison
            </Text>
          )}
          {selectedSbom?.length > 2 && (
            <Text color={'red.500'}>
              ** Comparison is permitted with only two versions
            </Text>
          )}
        </Stack>
        <Stack direction={'row'} spacing={2} alignItems={'center'}>
          {/* COMPARE VERSION */}
          {selectedSbom?.length === 2 && (
            <Tooltip label='Compare Version'>
              <IconButton
                onClick={onToolOpen}
                colorScheme='blue'
                icon={<FaCodeCompare />}
                isLoading={isToolOpen}
              />
            </Tooltip>
          )}
          {/* BUILD SBOM */}
          <Tooltip label='Build Version'>
            <IconButton
              isDisabled={!projectGroup?.enabled || !createSbom}
              hidden={signedUrlParams}
              colorScheme='blue'
              onClick={onBuildSbom}
              icon={<FaScrewdriverWrench />}
            />
          </Tooltip>
          {/* REFETCH VERSION */}
          <Tooltip label='Refresh'>
            <IconButton
              onClick={handleRefresh}
              colorScheme='blue'
              icon={<RepeatIcon />}
            ></IconButton>
          </Tooltip>
        </Stack>
      </Flex>
    )
  }, [
    filterText,
    onSearchInputChange,
    handleClear,
    handleSearch,
    selectedSbom?.length,
    onToolOpen,
    isToolOpen,
    projectGroup?.enabled,
    createSbom,
    signedUrlParams,
    onBuildSbom,
    handleRefresh
  ])

  const disableRowCheckBox = (row) => {
    if (selectedSbom.length >= 2) {
      return !selectedSbom.some((selectedRow) => selectedRow.id === row.id)
    }
    return false
  }

  const dataTableProps = {
    columns: columns,
    data: nodes || [],
    customStyles: customStyles(headColor),
    onSort: handleSort,
    defaultSortFieldId: filters?.field,
    defaultSortAsc: filters?.direction === 'ASC',
    subHeader: true,
    subHeaderComponent: subHeaderComponent,
    progressPending: loading,
    progressComponent: <CustomLoader />,
    responsive: true,
    persistTableHead: true,
    selectableRows: true,
    clearSelectedRows: clearSelect,
    onSelectedRowsChange: handleChange,
    selectableRowDisabled: disableRowCheckBox
  }

  return (
    <>
      <Flex flexDir={'column'} width={'100%'}>
        <DataTable {...dataTableProps} />
        <Pagination {...paginationProps} />
      </Flex>

      {/* DELETE VERSION */}
      {isDeleteOpen && (
        <Modal isOpen={isDeleteOpen} onClose={onDeleteClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Delete Version</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Tag py={1} colorScheme='blue' mb={3} wordBreak={'break-all'}>
                {activeRow?.projectVersion}
              </Tag>
              <Text>Deleting this version will: </Text>
              <UnorderedList>
                <Flex flexDir={'column'} gap={1} mt={4}>
                  {[
                    'remove this versions and its SBOM',
                    'remove access to this version for all users'
                  ].map((item, index) => (
                    <ListItem key={index}>{item}</ListItem>
                  ))}
                </Flex>
              </UnorderedList>
              <br />
              <Text mt={10}>Are you sure you wish to continue?</Text>
            </ModalBody>
            <ModalFooter>
              <Flex
                width={'100%'}
                alignItems={'center'}
                justifyContent={'space-between'}
                gap={4}
              >
                <Stack>{isLoading && <Spinner color='red.500' />}</Stack>
                <Stack direction='row' alignItems='center' gap={1}>
                  <Button onClick={onDeleteClose}>No</Button>
                  <Button
                    colorScheme='red'
                    onClick={handleDelete}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Deleting...' : 'Yes'}
                  </Button>
                </Stack>
              </Flex>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}

      {/* SBOM LIST */}
      {isListOpen && nodes && (
        <SbomList
          data={
            signedUrlParams ? sbomAlts?.shareLynkQuery?.sbom : sbomAlts?.sbom
          }
          sboms={nodes}
          isOpen={isListOpen}
          onClose={onListClose}
        />
      )}

      {/* BUILD SBOM */}
      {isSbomOpen && projectGroup && (
        <ProductSbomDrawer
          isOpen={isSbomOpen}
          onClose={onSbomClose}
          data={projectGroup}
          refetch={refetch}
          productId={productId}
        />
      )}

      {isToolOpen && (
        <ToolsDrawer
          sbomIdOne={selectedSbom[0]?.id}
          sbomIdTwo={selectedSbom[1]?.id}
          onClose={onToolClose}
        />
      )}
    </>
  )
}

export default VersionsTable
