import {
  IconButton,
  Text,
  Switch,
  Menu,
  MenuItem,
  MenuButton,
  MenuList,
  Portal,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Flex,
  Button,
  UnorderedList,
  ListItem,
  Divider,
  Tooltip,
  Stack
} from '@chakra-ui/react'
import { AddIcon, RepeatIcon } from '@chakra-ui/icons'
import { FaEllipsisV } from 'react-icons/fa'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

import { useMutation, useQuery } from '@apollo/client'
import { DeleteProjectGroup } from 'graphQL/Mutation'

import { customStyles, getFullDateAndTime, timeSince } from 'utils'

import DataTable from 'react-data-table-component'
import CustomLoader from 'components/CustomLoader'
import ProductModal from 'views/Dashboard/Products/components/ProductModal'
import UploadModal from 'views/Dashboard/Products/components/UploadModal'
import ProductSbomDrawer from 'components/Drawer/ProductSbomDrawer'
import ProdFilterMenu from 'views/Dashboard/Products/components/ProdFilterMenu'
import { useGlobalState } from 'hooks/useGlobalState'
import Card from 'components/Card/Card'
import SearchFilter from 'views/Sbom/components/SearchFilter'
import StatusModal from 'views/Dashboard/Products/components/StatusModal'
import Pagination from '../Pagination'
import { FaCode, FaInbox, FaSquareArrowUpRight } from 'react-icons/fa6'
import { GetSharelynks } from 'graphQL/Queries'
import ShareLynkDrawer from 'components/Drawer/ShareLynkDrawer'

const ProductTable = ({ data, refetch }) => {
  const signedUrlParams = sessionStorage.getItem('signedUrlParams')

  //This part is needed for the pagination to work. (Modify with caution)
  const paginationSizes = [25, 50, 100]

  const [isPrevActive, setIsPrevActive] = useState(false)
  const [isNextActive, setIsNextActive] = useState(false)

  useEffect(() => {
    if (data) {
      setIsPrevActive(data?.pageInfo?.hasPreviousPage)
      setIsNextActive(data?.pageInfo?.hasNextPage)
    }
  }, [data])

  const setPaginationControl = (data) => {
    if (signedUrlParams) {
      setIsPrevActive(
        data?.shareLynkQuery?.projectGroups?.pageInfo?.hasPreviousPage
      )
      setIsNextActive(
        data?.shareLynkQuery?.projectGroups?.pageInfo?.hasNextPage
      )
    } else {
      setIsPrevActive(
        data?.organization?.projectGroups?.pageInfo?.hasPreviousPage
      )
      setIsNextActive(data?.organization?.projectGroups?.pageInfo?.hasNextPage)
    }
  }

  const disablePaginationControl = () => {
    setIsPrevActive(false)
    setIsNextActive(false)
  }
  //end

  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const productId = queryParams.get('id')
  const activeEnv = localStorage.getItem('activeEnv')
  const environment = localStorage.getItem('environment')
  const path = location?.pathname?.startsWith('/vendor') ? 'vendor' : 'customer'

  const { userPermissions, setEnvName, setClearSelect, setSelectedSbom, setActiveSbomTab, prodState, dispatch } =
    useGlobalState()

  const { field, direction, searchInput, pageIndex, enabled } = prodState
  const { prodDispatch, prodCompDispatch } = dispatch

  const [totalRows, setTotalRows] = useState(paginationSizes[0])
  const [filterText, setFilterText] = useState(searchInput)
  const [activeRow, setActiveRow] = useState(null)

  const { isOpen, onOpen, onClose } = useDisclosure()
  const {
    isOpen: isOpenProduct,
    onOpen: onOpenProduct,
    onClose: onCloseProduct
  } = useDisclosure()
  const {
    isOpen: isOpenUpload,
    onOpen: onOpenUpload,
    onClose: onCloseUpload
  } = useDisclosure()
  const {
    isOpen: isSbomOpen,
    onOpen: onSbomOpen,
    onClose: onSbomClose
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

  const canAddProduct = () =>
    productPermissions?.supersededBy?.some(
      (permission) =>
        permission.key === 'create_product_group' && permission.value
    )

  const canUpdateProduct = useMemo(
    () =>
      productPermissions?.supersededBy?.some(
        (permission) =>
          permission.key === 'update_product_group' && permission.value
      ),
    [productPermissions]
  )

  const canArchiveProduct = useMemo(
    () =>
      productPermissions?.supersededBy?.some(
        (permission) =>
          permission.key === 'archive_product_group' && permission.value
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

  const [deleteProjectGroup] = useMutation(DeleteProjectGroup, {
    onCompleted: () => {
      disablePaginationControl()
      refetch({ first: totalRows, field, direction }).then((res) => {
        if (res.data) {
          setPaginationControl(res.data)
        }
      })
    }
  })

  const handleOpenSbom = useCallback(
    (row) => {
      localStorage.setItem('activeEnv', row?.defaultProject?.id)
      prodCompDispatch({ type: 'CLEAR_LICENSES' })
      setActiveRow(row)
      onSbomOpen()
    },
    [prodCompDispatch, setActiveRow, onSbomOpen]
  )

  const onProductDelete = useCallback(async () => {
    await deleteProjectGroup({
      variables: {
        id: activeRow.id
      }
    }).then((res) => res.data && onDeleteClose())
  }, [deleteProjectGroup, activeRow, onDeleteClose])

  const handleRefresh = useCallback(async () => {
    disablePaginationControl()
    await refetch({
      first: totalRows,
      after: undefined,
      last: undefined,
      before: undefined,
      field: field,
      direction: direction
    }).then((res) => {
      if (res.data) {
        setPaginationControl(res?.data)
        prodDispatch({type: 'FETCH_DATA_SUCCESS'})
      }
    })
  }, [refetch, totalRows, field, direction])

  const handleClear = useCallback(async () => {
    setFilterText('')
    disablePaginationControl()
    await refetch({
      search: undefined,
      first: totalRows,
      last: undefined,
      after: undefined,
      before: undefined,
      field: field,
      direction: direction
    }).then((res) => {
      if (res.data) {
        setPaginationControl(res.data)
        prodDispatch({ type: 'CLEAR_SEARCH_INPUT' })
      }
    })
  }, [refetch, totalRows, prodDispatch])

  const onSearchInputChange = useCallback(
    (event) => {
      const { value } = event.target
      if (value === '') {
        handleClear()
      } else {
        setFilterText(value)
      }
    },
    [handleClear, prodDispatch]
  )

  const handleSearch = useCallback(
    (event) => {
      const { value } = event.target
      if (event.key === 'Enter' && filterText !== '') {
        disablePaginationControl()
        refetch({
          search: value,
          first: totalRows,
          last: undefined,
          after: undefined,
          before: undefined,
          field: field,
          direction: direction
        }).then((res) => {
          if (res.data) {
            setPaginationControl(res.data)
            prodDispatch({ type: 'CHANGE_SEARCH_INPUT', payload: value })
          }
        })
      }
    },
    [refetch, filterText, totalRows, prodDispatch]
  )

  const onFilterActive = useCallback(
    async (value) => {
      disablePaginationControl()
      await refetch({
        enabled: value === 'yes' ? true : value === 'no' ? false : undefined,
        first: totalRows,
        last: undefined,
        after: undefined,
        before: undefined,
        field: field,
        direction: direction
      }).then((res) => {
        if (res.data) {
          setPaginationControl(res.data)
          prodDispatch({ type: 'ON_FILTER_ACTIVE', payload: value })
        }
      })
    },
    [refetch, totalRows, prodDispatch]
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
          {!signedUrlParams && <ProdFilterMenu onFilter={onFilterActive} />}
        </Stack>

        <Stack direction={'row'} spacing={2} alignItems={'center'}>
          {/* ADD PRODUCT */}
          <Tooltip label='Add Product'>
            <IconButton
              icon={<AddIcon />}
              colorScheme='blue'
              variant='solid'
              hidden={signedUrlParams}
              onClick={onOpenProduct}
              isDisabled={!canAddProduct}
            />
          </Tooltip>
          {/* REFRESH */}
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
    searchInput,
    signedUrlParams,
    handleSearch,
    handleClear,
    handleRefresh,
    onFilterActive,
    onSearchInputChange
  ])

  // COLUMNS
  const columns = useMemo(
    () => [
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
              isDisabled={signedUrlParams}
              onChange={() => {
                setActiveRow(row)
                onWarningOpen()
              }}
            />
          )
        },
        width: '150px',
        sortable: true
      },
      // PRODUCT
      {
        id: 'PROJECT_GROUPS_NAME',
        name: 'PRODUCT',
        selector: (row) => {
          const { id, name, projects, defaultProject } = row
          const product = { id: id, name: name, groupId: id }
          const handleClick = () => {
            setClearSelect(true)
            setSelectedSbom([])
            const env = projects?.find((item) => item.name === environment)
            prodDispatch({
              type: 'SET_CURRENT_PRODUCT',
              payload: { id: env?.id || defaultProject?.id }
            })
            localStorage.setItem(
              signedUrlParams ? 'publicEnv' : 'activeEnv',
              env?.id || defaultProject?.id
            )
            localStorage.setItem('product', JSON.stringify(product))
            localStorage.setItem('activeProdTab', 0)
            setActiveSbomTab(0)
          }

          return (
            <Link to={`/${path}/products/${name}?id=${id}`} onClick={handleClick}>
              <Text color={'blue.500'} minWidth='100%' my={3}>
                {name?.length > 20 ? `${name?.substring(0,20)}...` : name}
              </Text>
            </Link>
          )
        },
        wrap: true,
        sortable: true
      },
      // DESCRIPTION
      {
        id: 'PROJECT_GROUPS_DESCRIPTION',
        name: 'DESCRIPTION',
        selector: (row) => {
          const { description } = row
          return (
            <Text>
              {description?.length > 50
                ? description.substring(0, 50) + '....'
                : description}
            </Text>
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
          const { id, name, projects } = row
          const product = { id: id, name: name, groupId: id }

          const handleClick = (value) => {
            const env = projects?.find((item) => item.name === value)
            localStorage.setItem('product', JSON.stringify(product))
            localStorage.setItem('environment', env?.name)
            localStorage.setItem(
              signedUrlParams ? 'publicEnv' : 'activeEnv',
              env?.id
            )
            localStorage.setItem('activeProdTab', 0)
            prodDispatch({
              type: 'SET_CURRENT_PRODUCT',
              payload: { id: env?.id }
            })
            setEnvName(env?.name)
            setActiveSbomTab(0)
          }

          return (
            <Stack direction={'row'} spacing={2} alignItems={'center'}>
              <Tooltip label='Default'>
                <Link
                  to={`/${path}/products/${name}?id=${id}`}
                  onClick={() => handleClick('default')}
                >
                  <IconButton size='sm' colorScheme='blue' icon={<FaInbox />} />
                </Link>
              </Tooltip>
              <Tooltip label='Development'>
                <Link
                  to={`/${path}/products/${name}?id=${id}`}
                  onClick={() => handleClick('development')}
                >
                  <IconButton size='sm' colorScheme='blue' icon={<FaCode />} />
                </Link>
              </Tooltip>
              <Tooltip label='Production'>
                <Link
                  to={`/${path}/products/${name}?id=${id}`}
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
        wrap: true
      },
      // VERSION
      {
        id: 'VERSIONS',
        name: 'VERSIONS',
        selector: (row) => {
          const { projects } = row
          const totalSbom = projects?.reduce(
            (count, project) => count + project?.sboms?.length || 0,
            0
          )
          return <Text>{totalSbom || 0}</Text>
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
              {timeSince(updatedAt)}
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
        id: 'actions',
        name: 'ACTIONS',
        selector: (row) => {
          const { enabled, defaultProject } = row

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
                    isDisabled={!enabled}
                  >
                    Edit Product
                  </MenuItem>
                  <Divider />
                  {/* UPLOAD SBOM */}
                  <MenuItem
                    onClick={() => {
                      localStorage.setItem('activeEnv', defaultProject?.id)
                      setActiveRow(row)
                      onOpenUpload()
                    }}
                    isDisabled={!enabled || !canUpdateProduct}
                  >
                    Upload SBOM
                  </MenuItem>
                  {/* BUILD SBOM */}
                  <MenuItem
                    onClick={() => handleOpenSbom(row)}
                    isDisabled={!enabled}
                  >
                    Build Version
                  </MenuItem>
                  {/* VIEW SHARELYNK */}
                  <MenuItem
                    isDisabled={!enabled}
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
        right: 'true',
        omit: signedUrlParams
      }
    ],
    [setActiveRow, onWarningOpen, canArchiveProduct]
  )

  const handleSort = useCallback(
    async (column, sortDirection) => {
      disablePaginationControl()
      await refetch({
        first: totalRows,
        search: undefined,
        field: column.id,
        direction: sortDirection === 'asc' ? 'ASC' : 'DESC'
      }).then((res) => {
        if (res.data) {
          setPaginationControl(res.data)
          prodDispatch({
            type: 'SET_SORT_ORDER',
            payload: {
              field: column.id,
              direction: sortDirection === 'asc' ? 'ASC' : 'DESC'
            }
          })
        }
      })
    },
    [refetch, totalRows, prodDispatch]
  )

  const handlePreviousPage = useCallback(async () => {
    disablePaginationControl()
    await refetch({
      first: undefined,
      last: totalRows,
      after: undefined,
      before: data.pageInfo.startCursor,
      field,
      direction
    }).then((res) => {
      if (res.data) {
        prodDispatch({
          type: 'DECREMENT_PAGE',
          payload: data.pageInfo.startCursor
        })
      }
    })
  }, [refetch, totalRows, data, prodDispatch])

  const handleNextPage = useCallback(async () => {
    disablePaginationControl()
    await refetch({
      first: totalRows,
      last: undefined,
      after: data.pageInfo.endCursor,
      before: undefined,
      field,
      direction
    }).then((res) => {
      console.log(res.data)
      if (res.data) {
        prodDispatch({
          type: 'INCREMENT_PAGE',
          payload: {
            total: data.totalCount,
            after: data.pageInfo.endCursor
          }
        })
      }
    })
  }, [refetch, totalRows, data, prodDispatch])

  const handleSetRow = useCallback(
    async (e) => {
      const newTotalRows = Number(e.target.value)
      setTotalRows(newTotalRows)
      disablePaginationControl()
      await refetch({
        first: newTotalRows,
        last: undefined,
        after: undefined,
        before: undefined,
        field,
        direction
      }).then((res) => {
        if (res.data) {
          setPaginationControl(res.data)
          prodDispatch({ type: 'FETCH_DATA_SUCCESS' })
        }
      })
    },
    [refetch, setTotalRows, prodDispatch]
  )

  const dataTableProps = {
    columns: columns,
    data: data?.nodes,
    onSort: handleSort,
    customStyles: customStyles,
    defaultSortFieldId: field,
    defaultSortAsc: false,
    subHeader: true,
    subHeaderComponent: subHeaderComponent,
    progressPending: !data,
    progressComponent: <CustomLoader />,
    responsive: true,
    persistTableHead: true
  }

  return (
    <>
      <Card>
        <Flex flexDir={'column'} width={'100%'}>
          <DataTable {...dataTableProps} />
          {data?.pageInfo && (
            <Pagination
              paginationSizes={paginationSizes}
              pageIndex={pageIndex}
              totalRows={totalRows}
              totalCount={data?.totalCount}
              onPreviousPage={handlePreviousPage}
              onNextPage={handleNextPage}
              onSetRow={handleSetRow}
              hasNextPage={isNextActive}
              hasPreviousPage={isPrevActive}
            />
          )}
        </Flex>
      </Card>

      {/* UPLOAD SBOM */}
      {isOpenUpload && (
        <UploadModal
          data={activeRow}
          isOpen={isOpenUpload}
          onClose={onCloseUpload}
          activeEnv={activeEnv}
        />
      )}

      {/* CREATE PRODUCT */}
      {isOpenProduct && (
        <ProductModal
          isOpen={isOpenProduct}
          refetch={refetch}
          totalRows={totalRows}
          onClose={onCloseProduct}
          id={null}
          product={null}
          description={null}
          allProjects={null}
        />
      )}

      {/* UPDATE PRODUCT */}
      {isOpen && data && (
        <ProductModal
          id={activeRow.id}
          isOpen={isOpen}
          onClose={onClose}
          product={activeRow.name}
          refetch={refetch}
          description={activeRow.description}
          allProjects={data.nodes}
          activeEnv={activeEnv}
        />
      )}

      {/* PROD SBOM DRAWER */}
      {isSbomOpen && (
        <ProductSbomDrawer
          isOpen={isSbomOpen}
          onClose={onSbomClose}
          data={activeRow}
          refetch={refetch}
          productId={activeRow?.id}
        />
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
          grouId={productId}
          refetch={refetch}
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
