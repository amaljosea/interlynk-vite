import { useMutation, useQuery } from '@apollo/client'
import { useCallback, useMemo, useState } from 'react'
import DataTable from 'react-data-table-component'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getFullDateAndTime, timeSince } from 'utils'
import { customStyles } from 'utils'
import ProdFilterMenu from 'views/Dashboard/Products/components/ProdFilterMenu'
import ProductModal from 'views/Dashboard/Products/components/ProductModal'
import StatusModal from 'views/Dashboard/Products/components/StatusModal'
import UploadModal from 'views/Dashboard/Products/components/UploadModal'
import SearchFilter from 'views/Sbom/components/SearchFilter'

import { AddIcon, RepeatIcon } from '@chakra-ui/icons'
import {
  Button,
  Divider,
  Flex,
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
  Portal,
  Stack,
  Switch,
  Text,
  Tooltip,
  UnorderedList,
  useColorModeValue,
  useDisclosure
} from '@chakra-ui/react'

import Card from 'components/Card/Card'
import CustomLoader from 'components/CustomLoader'
import ShareLynkDrawer from 'components/Drawer/ShareLynkDrawer'

import { useGlobalState } from 'hooks/useGlobalState'
import { useProductUrlContext } from 'hooks/useProductUrlContext'

import { DeleteProjectGroup } from 'graphQL/Mutation'
import { GetSharelynks } from 'graphQL/Queries'

import { FaEllipsisV } from 'react-icons/fa'
import { FaCode, FaInbox, FaSquareArrowUpRight } from 'react-icons/fa6'

import Pagination from '../Pagination'

const ProductTable = ({
  data,
  refetch,
  loading,
  filters,
  setFilters,
  paginationProps
}) => {
  const navigate = useNavigate()
  const { generateProductDetailPageUrlFromCurrentUrl } = useProductUrlContext()
  const signedUrlParams = sessionStorage.getItem('signedUrlParams')

  const headColor = useColorModeValue('#4A5568', '#CBD5E0')
  const textColor = useColorModeValue('#1A202C', '#F7FAFC')

  const { search, enabled, field } = filters
  const { totalRows } = paginationProps

  const params = useParams()
  const productId = params.productid

  const environment = localStorage.getItem('environment')

  const {
    userPermissions,
    setEnvName,
    setClearSelect,
    setSelectedSbom,
    dispatch
  } = useGlobalState()

  const { prodDispatch } = dispatch

  const [filterText, setFilterText] = useState(search || '')
  const [activeRow, setActiveRow] = useState(null)

  const { isOpen, onOpen, onClose } = useDisclosure()

  const {
    isOpen: isOpenUpload,
    onOpen: onOpenUpload,
    onClose: onCloseUpload
  } = useDisclosure()
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose
  } = useDisclosure()
  const {
    isOpen: isWarningOpen,
    onOpen: onWarningOpen,
    onClose: onWarningClose
  } = useDisclosure()
  const {
    isOpen: isLynkOpen,
    onOpen: onLynkOpen,
    onClose: onLynkClose
  } = useDisclosure()

  const productPermissions = useMemo(
    () => userPermissions?.find((item) => item.key === 'view_product_group'),
    [userPermissions]
  )

  const sbomPermissions = useMemo(
    () => userPermissions?.find((item) => item.key === 'view_sbom'),
    [userPermissions]
  )

  const canAddProduct = useMemo(
    () =>
      productPermissions?.supersededBy?.some(
        (permission) =>
          permission.key === 'update_product_group' && permission.value
      ),
    [productPermissions]
  )

  const canEditProduct = useMemo(
    () =>
      productPermissions?.supersededBy?.some(
        (permission) =>
          permission.key === 'update_product_group' && permission.value
      ),
    [productPermissions]
  )

  const canCreateSBOM = useMemo(
    () =>
      sbomPermissions?.supersededBy?.some(
        (permission) => permission.key === 'update_sbom' && permission.value
      ),
    [sbomPermissions]
  )

  const canArchiveProduct = useMemo(
    () =>
      productPermissions?.supersededBy?.some(
        (permission) =>
          permission.key === 'archive_product_group' && permission.value
      ),
    [productPermissions]
  )

  const canEditShareynk = useMemo(
    () =>
      productPermissions?.supersededBy?.some(
        (permission) => permission.key === 'edit_share_lynk' && permission.value
      ),
    [productPermissions]
  )

  const {
    data: lynks,
    refetch: lynkRefetch,
    error
  } = useQuery(GetSharelynks, {
    skip: activeRow && isLynkOpen ? false : true,
    fetchPolicy: 'network-only',
    variables: {
      ids: activeRow ? [activeRow?.id] : undefined,
      first: totalRows
    }
  })

  const [deleteProjectGroup] = useMutation(DeleteProjectGroup)

  const onProductDelete = useCallback(async () => {
    await deleteProjectGroup({ variables: { id: activeRow.id } }).then(
      (res) => res.data && onDeleteClose()
    )
  }, [deleteProjectGroup, activeRow, onDeleteClose])

  const setSearchFilter = useCallback(
    (value) => {
      setFilters((oldFilter) => ({
        ...oldFilter,
        search: value
      }))
    },
    [setFilters]
  )

  const handleClear = useCallback(async () => {
    setFilterText('')
    setFilters((oldFilter) => ({
      ...oldFilter,
      search: undefined
    }))
  }, [setFilters])

  const onSearchInputChange = useCallback(
    (event) => {
      const { value } = event.target
      if (value === '') {
        handleClear()
      } else {
        setFilterText(value)
      }
    },
    [handleClear]
  )

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

  const onFilterActive = useCallback(
    (value) => {
      console.log(value)
      setFilters((oldFilter) => ({
        ...oldFilter,
        enabled: value === 'yes' ? true : value === 'no' ? false : undefined
      }))
    },
    [setFilters]
  )

  const onSharelynkOpen = (row) => {
    setActiveRow(row)
    onLynkOpen()
  }

  // HEADER
  const subHeaderComponent = useMemo(() => {
    return (
      <Flex
        width={'100%'}
        alignItems={'center'}
        justifyContent={'space-between'}
      >
        <Stack direction={'row'} spacing={2} alignItems={'center'}>
          {/* SEARCH PRODUCTS */}
          <SearchFilter
            id='product'
            filterText={filterText}
            onChange={onSearchInputChange}
            onClear={handleClear}
            onFilter={handleSearch}
          />
          {/* FILTER PRODUCTS */}
          {!signedUrlParams && (
            <ProdFilterMenu enabled={enabled} onFilter={onFilterActive} />
          )}
        </Stack>
        <Stack direction={'row'} spacing={2} alignItems={'center'}>
          {/* ADD PRODUCT */}
          <Tooltip label='Add Product'>
            <IconButton
              icon={<AddIcon />}
              colorScheme='blue'
              variant='solid'
              isDisabled={!canAddProduct}
              hidden={signedUrlParams}
              onClick={() => {
                setActiveRow(null)
                onOpen()
              }}
            />
          </Tooltip>
          {/* REFRESH */}
          <Tooltip label='Refresh'>
            <IconButton
              onClick={refetch}
              colorScheme='blue'
              icon={<RepeatIcon />}
            />
          </Tooltip>
        </Stack>
      </Flex>
    )
  }, [
    filterText,
    canAddProduct,
    onSearchInputChange,
    handleClear,
    handleSearch,
    signedUrlParams,
    enabled,
    onFilterActive,
    onOpen,
    refetch
  ])

  // COLUMNS
  const columns = [
    // ACTIVE
    {
      id: 'PROJECT_GROUPS_ENABLED',
      name: 'ACTIVE',
      selector: (row) => {
        const { enabled, name } = row
        return (
          <Switch
            name={name}
            id={name}
            size='md'
            isChecked={enabled}
            isDisabled={signedUrlParams || !canEditProduct}
            onChange={() => {
              setActiveRow(row)
              onWarningOpen()
            }}
          />
        )
      },
      width: '8%',
      sortable: true
    },
    // PRODUCT
    {
      id: 'PROJECT_GROUPS_NAME',
      name: 'PRODUCT',
      selector: (row) => {
        const { id, name, projects, defaultProject, description } = row
        const handleClick = () => {
          setClearSelect(true)
          setSelectedSbom([])
          const env = projects?.find((item) => item.name === environment)
          setEnvName(env ? env?.name : defaultProject?.name)
          prodDispatch({
            type: 'SET_CURRENT_PRODUCT',
            payload: { id: env?.id || defaultProject?.id }
          })
          const link = generateProductDetailPageUrlFromCurrentUrl({
            productgroupid: id,
            productid: env?.id || defaultProject?.id
          })

          navigate(link)
        }
        return (
          <Stack
            direction='column'
            alignItems={'flex-start'}
            spacing={1}
            my={3}
          >
            <Text
              fontSize={14}
              color={'blue.500'}
              minWidth='100%'
              fontWeight={'medium'}
              onClick={handleClick}
              cursor={'pointer'}
            >
              {name?.length > 20 ? `${name?.substring(0, 20)}...` : name}
            </Text>
            <Text color={textColor}>
              {description?.length > 50
                ? description.substring(0, 50) + '....'
                : description}
            </Text>
          </Stack>
        )
      },
      wrap: true,
      sortable: true
    },
    // ENVIRONMENT
    {
      id: 'ENVIRONMENTS',
      name: 'ENVIRONMENTS',
      selector: (row) => {
        const { projects } = row
        const handleClick = (value) => {
          const env = projects?.find((item) => item.name === value)
          localStorage.setItem('environment', env?.name)

          prodDispatch({
            type: 'SET_CURRENT_PRODUCT',
            payload: { id: env?.id }
          })
          setEnvName(env?.name)
        }
        return (
          <Stack direction={'row'} spacing={2} alignItems={'center'}>
            <Tooltip label='Default'>
              <Link
                to={generateProductDetailPageUrlFromCurrentUrl({
                  productgroupid: row.id,
                  productid: row.defaultProject.id
                })}
                onClick={() => handleClick('default')}
              >
                <IconButton size='sm' colorScheme='blue' icon={<FaInbox />} />
              </Link>
            </Tooltip>
            <Tooltip label='Development'>
              <Link
                to={generateProductDetailPageUrlFromCurrentUrl({
                  productgroupid: row.id,
                  productid: projects?.find(
                    (item) => item.name === 'development'
                  ).id
                })}
                onClick={() => handleClick('development')}
              >
                <IconButton size='sm' colorScheme='blue' icon={<FaCode />} />
              </Link>
            </Tooltip>
            <Tooltip label='Production'>
              <Link
                to={generateProductDetailPageUrlFromCurrentUrl({
                  productgroupid: row.id,
                  productid: projects?.find(
                    (item) => item.name === 'production'
                  ).id
                })}
                onClick={() => handleClick('production')}
              >
                <IconButton
                  size='sm'
                  colorScheme='blue'
                  icon={<FaSquareArrowUpRight />}
                />
              </Link>
            </Tooltip>
          </Stack>
        )
      },
      width: '12%',
      wrap: true
    },
    // VERSION
    {
      id: 'VERSIONS',
      name: 'VERSIONS',
      selector: (row) => {
        const { sbomsCount } = row

        return <Text color={textColor}>{sbomsCount || 0}</Text>
      },
      wrap: true,
      right: 'true'
    },
    // UPDATEDAT
    {
      id: 'PROJECT_GROUPS_UPDATED_AT',
      name: 'UPDATED',
      selector: (row) => {
        const { updatedAt } = row
        return (
          <Tooltip label={getFullDateAndTime(updatedAt)} placement={'top'}>
            <Text color={textColor}>{timeSince(updatedAt)}</Text>
          </Tooltip>
        )
      },
      sortable: true,
      sortFunction: (a, b) => {
        const dateA = new Date(a.updatedAt)
        const dateB = new Date(b.updatedAt)
        return dateA - dateB
      },
      wrap: true,
      right: 'true'
    },
    // ACTIONS
    {
      id: 'ACTIONS',
      name: 'ACTIONS',
      selector: (row) => {
        const { enabled } = row
        return (
          <Menu>
            <MenuButton
              as={IconButton}
              icon={<FaEllipsisV />}
              variant='none'
              color='gray.400'
            />
            <Portal>
              <MenuList fontSize={'sm'}>
                {/* EDIT PRODUCT */}
                <MenuItem
                  onClick={() => {
                    setActiveRow(row)
                    onOpen()
                  }}
                  isDisabled={!enabled || !canEditProduct}
                >
                  Edit Product
                </MenuItem>
                <Divider />
                {/* UPLOAD SBOM */}
                <MenuItem
                  onClick={() => {
                    setActiveRow(row)
                    onOpenUpload()
                  }}
                  isDisabled={!enabled || !canCreateSBOM}
                >
                  Upload SBOM
                </MenuItem>
                {/* VIEW SHARELYNK */}
                <MenuItem
                  isDisabled={!enabled || !canEditShareynk}
                  onClick={() => onSharelynkOpen(row)}
                >
                  View ShareLynk
                </MenuItem>
                <Divider />
                {/* ARCHIVE PRODUCT GROUP */}
                <MenuItem
                  color='red'
                  onClick={() => {
                    setActiveRow(row)
                    onDeleteOpen()
                  }}
                  isDisabled={!canArchiveProduct}
                >
                  Archive Product
                </MenuItem>
              </MenuList>
            </Portal>
          </Menu>
        )
      },
      width: '10%',
      right: 'true',
      omit: signedUrlParams
    }
  ]

  const handleSort = (column, sortDirection) => {
    setFilters((oldFilters) => ({
      ...oldFilters,
      field: column?.id,
      direction: sortDirection.toUpperCase()
    }))
  }

  const dataTableProps = {
    columns: columns,
    data: data || [],
    onSort: handleSort,
    customStyles: customStyles(headColor),
    defaultSortFieldId: field,
    defaultSortAsc: false,
    subHeader: true,
    subHeaderComponent: subHeaderComponent,
    progressPending: loading,
    progressComponent: <CustomLoader />,
    responsive: true,
    persistTableHead: true
  }

  return (
    <>
      <Card>
        <Flex flexDir={'column'} width={'100%'}>
          <DataTable {...dataTableProps} />
          <Pagination {...paginationProps} />
        </Flex>
      </Card>

      {/* UPLOAD SBOM */}
      {isOpenUpload && (
        <UploadModal
          data={activeRow}
          isOpen={isOpenUpload}
          onClose={onCloseUpload}
          activeEnv={productId}
        />
      )}

      {/* UPDATE PRODUCT */}
      {isOpen && data && (
        <ProductModal isOpen={isOpen} onClose={onClose} data={activeRow} />
      )}

      {/* DELETE */}
      {isDeleteOpen && (
        <Modal isOpen={isDeleteOpen} onClose={onDeleteClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Archive Product</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Text>Archiving this product will: </Text>
              <UnorderedList>
                <Flex flexDir={'column'} gap={1} mt={4}>
                  {[
                    'remove this product, its versions and SBOMs',
                    'remove access to the product for all users',
                    'disable uploads of SBOMs to this product'
                  ].map((item, index) => (
                    <ListItem key={index}>{item}</ListItem>
                  ))}
                </Flex>
              </UnorderedList>
              <br />
              <Text mt={10}>Are you sure you wish to continue?</Text>
            </ModalBody>
            <ModalFooter>
              <Button mr={3} onClick={onDeleteClose}>
                No
              </Button>
              <Button colorScheme='red' onClick={onProductDelete}>
                Yes
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}

      {/* DISABLED */}
      {isWarningOpen && data && (
        <StatusModal
          isOpen={isWarningOpen}
          onClose={onWarningClose}
          group={activeRow}
        />
      )}

      {/* ShareLynks */}
      {isLynkOpen && (
        <ShareLynkDrawer
          error={error}
          groupId={activeRow?.id}
          data={lynks?.shareLynks}
          refetch={lynkRefetch}
          isOpen={isLynkOpen}
          onClose={onLynkClose}
        />
      )}
    </>
  )
}

export default ProductTable
