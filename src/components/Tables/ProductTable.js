import { useMutation, useQuery } from '@apollo/client'
import { useTour } from '@reactour/tour'
import { useCallback, useMemo, useState } from 'react'
import DataTable from 'react-data-table-component'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getFullDateAndTime, timeSince } from 'utils'
import { customStyles, getFormat, getLink, getType } from 'utils'
import GithubAddModal from 'views/Dashboard/Products/components/GithubAddModal'
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

import useGithubConfigSaved from 'hooks/useGithubConfigSaved'
import { useGlobalState } from 'hooks/useGlobalState'
import { useHasPermission } from 'hooks/useHasPermission'
import { useProductUrlContext } from 'hooks/useProductUrlContext'
import { useShouldShowDemoFeatures } from 'hooks/useShouldShowDemoFeatures'

import { DeleteProjectGroup } from 'graphQL/Mutation'
import { GetSharelynks } from 'graphQL/Queries'

import { FaEllipsisV, FaGithub } from 'react-icons/fa'
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
  const { setIsOpen } = useTour()
  const { shouldShowDemoFeatures } = useShouldShowDemoFeatures()
  const { generateProductDetailPageUrlFromCurrentUrl } = useProductUrlContext()
  const signedUrlParams = sessionStorage.getItem('signedUrlParams')

  const headColor = useColorModeValue('#4A5568', '#CBD5E0')
  const textColor = useColorModeValue('#1A202C', '#F7FAFC')

  const { search, enabled, field } = filters
  const { totalRows } = paginationProps

  const params = useParams()
  const productId = params.productid

  const { setEnvName, setClearSelect, setSelectedSbom, dispatch, envName } =
    useGlobalState()

  const environment = envName

  const { prodDispatch } = dispatch

  const [filterText, setFilterText] = useState(search || '')
  const [activeRow, setActiveRow] = useState(null)
  const isGithubConfigSaved = useGithubConfigSaved()

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
  const {
    isOpen: isGithubOpen,
    onOpen: onGithubOpen,
    onClose: onGithubClose
  } = useDisclosure()

  const canAddProduct = useHasPermission({
    parentKey: 'view_product_group',
    childKey: 'update_product_group'
  })

  const canEditProduct = useHasPermission({
    parentKey: 'view_product_group',
    childKey: 'update_product_group'
  })

  const canArchiveProduct = useHasPermission({
    parentKey: 'view_product_group',
    childKey: 'archive_product_group'
  })

  const canEditShareynk = useHasPermission({
    parentKey: 'view_product_group',
    childKey: 'edit_share_lynk'
  })

  const canCreateSBOM = useHasPermission({
    parentKey: 'view_sbom',
    childKey: 'update_sbom'
  })

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
          {/* ADD GITHUB PROJECT */}
          {shouldShowDemoFeatures && isGithubConfigSaved && (
            <Tooltip label='Add GitHub Project'>
              <IconButton
                icon={<FaGithub />}
                colorScheme='blue'
                onClick={onGithubOpen}
              />
            </Tooltip>
          )}
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
    onSearchInputChange,
    handleClear,
    handleSearch,
    signedUrlParams,
    enabled,
    onFilterActive,
    shouldShowDemoFeatures,
    isGithubConfigSaved,
    onGithubOpen,
    canAddProduct,
    refetch,
    onOpen
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
      selector: (row, index) => {
        const { id, name, projects, defaultProject, description } = row
        const handleClick = () => {
          setIsOpen(false)
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
            productid: env?.id || defaultProject?.id,
            paramsObj: {
              tab: 'versions'
            }
          })

          navigate(link)
        }
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
              <Tooltip label={getFormat(name)} placement='top'>
                <Olink
                  href={getLink(name)}
                  isExternal={getLink(name) === '#' ? false : true}
                >
                  <IconButton
                    size='xs'
                    isRound={true}
                    color={textColor}
                    icon={getType(name)}
                  />
                </Olink>
              </Tooltip>
            </GridItem>
            <GridItem gap={1} colSpan={6}>
              <Text
                fontSize={14}
                color={'blue.500'}
                fontWeight={'medium'}
                onClick={handleClick}
                cursor={'pointer'}
                width={'fit-content'}
                className={index === 0 ? 'product' : ''}
              >
                {name?.length > 20 ? `${name?.substring(0, 20)}...` : name}
              </Text>
              <Text color={textColor}>
                {description?.length > 50
                  ? description.substring(0, 50) + '....'
                  : description}
              </Text>
            </GridItem>
          </Grid>
        )
      },
      width: '20%',
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

      {/* GITHUB ADD PROJECT */}
      {isGithubOpen && (
        <GithubAddModal isOpen={isGithubOpen} onClose={onGithubClose} />
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
