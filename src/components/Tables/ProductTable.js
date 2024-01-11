import {
  Box,
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
  Stack,
  Select
} from '@chakra-ui/react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { FaEllipsisV } from 'react-icons/fa'
import {
  getFullDateAndTime,
  timeSince,
  customStyles,
  removeDuplicates
} from 'utils'
import CustomLoader from 'components/CustomLoader'
import DataTable from 'react-data-table-component'
import { AddIcon, RepeatIcon } from '@chakra-ui/icons'
import { useMutation } from '@apollo/client'
import { UpdateProjectGroup, DeleteProjectGroup } from 'graphQL/Mutation'
import ProductModal from 'views/Dashboard/Products/components/ProductModal'
import UploadModal from 'views/Dashboard/Products/components/UploadModal'
import ProductSbomDrawer from 'components/Drawer/ProductSbomDrawer'
import ProdFilterMenu from 'views/Dashboard/Products/components/ProdFilterMenu'
import { useGlobalState } from 'hooks/useGlobalState'
import ProdSearchFilter from 'views/Sbom/components/ProdSearchFilter'
import Card from 'components/Card/Card'

const ProductTable = ({ data, refetch, org }) => {
  const {
    userPermissons,
    totalRows,
    setTotalRows,
    setActiveSbomTab,
    prodState,
    dispatch
  } = useGlobalState()
  const { field, direction, searchInput, pageIndex } = prodState
  const { prodDispatch, sbomDispatch } = dispatch

  const product = userPermissons?.find((item) => item.key === 'view_product')
  const archiveProduct = product?.supersededBy?.some(
    (permission) =>
      permission.key === 'archive_product' && permission.value === true
  )

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
    isOpen: isWarning,
    onOpen: onWarningOpen,
    onClose: onWarningClose
  } = useDisclosure()

  const [projectGroupDelete] = useMutation(DeleteProjectGroup, {
    onCompleted: () =>
      refetch({
        first: totalRows,
        field: field,
        direction: direction
      })
  })

  const [projectGroupUpdate] = useMutation(UpdateProjectGroup, {
    onCompleted: () =>
      refetch({
        first: totalRows,
        field: field,
        direction: direction
      })
  })

  const handleOpenSbom = (row) => {
    sbomDispatch({ type: 'CLEAR_LICENSES' })
    setActiveRow(row)
    onSbomOpen()
  }

  // DELETE PRODUCT
  const onProductDelete = async () => {
    await projectGroupDelete({
      variables: {
        id: activeRow.id
      }
    }).then((res) => res.data && onDeleteClose())
  }

  // REFRESH PRODUCTS
  const handleRefresh = async () => {
    await refetch({
      first: totalRows,
      field: field,
      direction: direction
    })
  }

  // TOGGLE STATUS
  const toggleStatus = async () => {
    await projectGroupUpdate({
      variables: {
        id: activeRow.id,
        enabled: activeRow.enabled === true ? false : true
      }
    })
      .then(
        (res) =>
          res.data &&
          refetch({
            first: totalRows,
            field: field,
            direction: direction
          })
      )
      .finally(() => onWarningClose())
  }

  // CLEAR SERACH
  const handleClear = async () => {
    await refetch({
      search: undefined,
      first: totalRows,
      last: undefined,
      after: undefined,
      before: undefined,
      field: field,
      direction: direction
    }).then((res) => res.data && prodDispatch({ type: 'CLEAR_SEARCH_INPUT' }))
  }

  // ON SEARCH INPUT CHANGE
  const onSearchInputChange = (e) => {
    const { value } = e.target
    if (value === '') {
      handleClear()
    } else {
      prodDispatch({ type: 'CHANGE_SEARCH_INPUT', payload: value })
    }
  }

  // SEARCH COMPONENT
  const handleSearch = (event) => {
    if (event.key === 'Enter' && searchInput !== '') {
      refetch({
        search: searchInput,
        first: totalRows,
        last: undefined,
        after: undefined,
        before: undefined,
        field: field,
        direction: direction
      }).then((res) => res.data && prodDispatch({ type: 'FETCH_DATA_SUCCESS' }))
    }
  }

  // FILTER PRODUCT
  const onFilterActive = async (value) => {
    await refetch({
      enabled: value === 'all' ? undefined : value === 'yes' ? true : false,
      first: totalRows,
      last: undefined,
      after: undefined,
      before: undefined,
      field: field,
      direction: direction
    }).then(
      (res) =>
        res.data && prodDispatch({ type: 'ON_FILTER_ACTIVE', payload: value })
    )
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
          <ProdSearchFilter
            id='product'
            filterText={searchInput}
            onChange={onSearchInputChange}
            onClear={handleClear}
            onFilter={handleSearch}
          />
          {/* FILTER PRODUCTS */}
          <ProdFilterMenu onFilter={onFilterActive} />
        </Stack>

        <Stack direction={'row'} spacing={2} alignItems={'center'}>
          {/* REFRESH */}
          <Tooltip label='Refresh'>
            <IconButton
              onClick={handleRefresh}
              colorScheme='blue'
              icon={<RepeatIcon />}
            ></IconButton>
          </Tooltip>
          {/* ADD PRODUCT */}
          <Tooltip label='Add Group'>
            <IconButton
              icon={<AddIcon />}
              colorScheme='blue'
              variant='solid'
              onClick={onOpenProduct}
            />
          </Tooltip>
        </Stack>
      </Flex>
    )
  }, [
    searchInput,
    handleSearch,
    handleClear,
    handleRefresh,
    onFilterActive,
    onSearchInputChange
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
        const { id, name, defaultProject } = row
        const data = defaultProject
          ? removeDuplicates(defaultProject?.sboms)
          : []

        const product = {
          id: defaultProject?.id || '',
          name: defaultProject?.name || '',
          version:
            data?.length > 0
              ? defaultProject?.primaryComponent?.version
              : defaultProject?.sboms?.length > 0
                ? defaultProject?.sboms[0].primaryComponent?.version
                : '',
          sbomId: defaultProject
            ? defaultProject?.primaryComponent?.version
            : defaultProject?.sboms?.length > 0
              ? defaultProject?.sboms[0].id
              : '',
          groupId: id
        }

        const handleClick = () => {
          if (defaultProject?.sboms?.length > 0) {
            localStorage.setItem('product', JSON.stringify(product))
            localStorage.setItem('activeProdTab', 0)
            prodDispatch({
              type: 'SET_CURRENT_PRODUCT',
              payload: {
                id: defaultProject?.id,
                sbomId:
                  defaultProject?.length > 0
                    ? defaultProject?.primaryComponent?.version
                    : defaultProject?.sboms[0].id || ''
              }
            })
          }
          setActiveSbomTab(0)
        }

        return (
          <Link
            to={`/vendor/products/${defaultProject?.name}?id=${defaultProject?.id}`}
            onClick={handleClick}
          >
            <Text color={'blue.500'} minWidth='100%'>
              {name}
            </Text>
          </Link>
        )
      },
      wrap: true,
      sortable: true
    },
    // VERSION
    {
      id: 'versions',
      name: 'VERSION',
      selector: (row) => {
        const { projects } = row
        return <Text>{projects?.length}</Text>
      },
      wrap: true
    },
    // DESCRIPTION
    {
      id: 'PROJECT_GROUPS_DESCRIPTION',
      name: 'DESCRIPTION',
      selector: (row) => {
        const { description } = row
        return (
          <Text>
            {description.length > 50
              ? description.substring(0, 50) + '....'
              : description}
          </Text>
        )
      },
      wrap: true,
      sortable: true
    },
    // UPDATEDAT
    {
      id: 'PROJECT_GROUPS_UPDATED_AT',
      name: 'UPDATED AT',
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
      wrap: true
    },
    // ACTIONS
    {
      id: 'actions',
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
                  isDisabled={!enabled}
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
                  isDisabled={!enabled}
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
                <Divider />
                {/* ARCHIVE PRODUCT GROUP */}
                <MenuItem
                  color='red'
                  onClick={() => {
                    setActiveRow(row)
                    onDeleteOpen()
                  }}
                  isDisabled={!archiveProduct}
                >
                  Archive Product
                </MenuItem>
              </MenuList>
            </Portal>
          </Menu>
        )
      },
      right: 'true'
    }
  ]

  // SORTING
  const handleSort = async (column, sortDirection) => {
    await refetch({
      first: totalRows,
      search: undefined,
      field: column.id,
      direction: sortDirection === 'asc' ? 'ASC' : 'DESC',
      field: field,
      direction: direction
    }).then(
      (res) =>
        res.data &&
        prodDispatch({
          type: 'SET_SORT_ORDER',
          payload: {
            field: column.id,
            direction: sortDirection === 'asc' ? 'ASC' : 'DESC'
          }
        })
    )
  }

  // PREV PAGE
  const handlePreviousPage = async () => {
    await refetch({
      first: undefined,
      last: totalRows,
      after: undefined,
      before: data.pageInfo.startCursor
    }).then(
      (res) =>
        res.data &&
        prodDispatch({
          type: 'DECREMENT_PAGE',
          payload: data.pageInfo.startCursor
        })
    )
  }

  // NEXT PAGE
  const handleNextPage = async () => {
    await refetch({
      first: totalRows,
      last: undefined,
      after: data.pageInfo.endCursor,
      before: undefined
    }).then(
      (res) =>
        res.data &&
        prodDispatch({
          type: 'INCREMENT_PAGE',
          payload: {
            total: data.totalCount,
            after: data.pageInfo.endCursor
          }
        })
    )
  }

  // SET ROW LENGTH
  const handleSetRow = async (e) => {
    setTotalRows(Number(e.target.value))
    await refetch({
      first: Number(e.target.value),
      last: undefined,
      after: undefined,
      before: undefined
    }).then((res) => {
      if (res.data) {
        prodDispatch({ type: 'FETCH_DATA_SUCCESS' })
      }
    })
  }

  return (
    <>
      <Card>
        <Flex flexDir={'column'} width={'100%'}>
          <DataTable
            columns={columns}
            onSort={handleSort}
            data={data?.nodes}
            customStyles={customStyles}
            defaultSortAsc={false}
            defaultSortFieldId={field}
            subHeader
            subHeaderComponent={subHeaderComponent}
            progressPending={data ? false : true}
            progressComponent={<CustomLoader />}
            responsive={true}
            persistTableHead
          />

          {data && (
            <Flex
              width={'100%'}
              flexDir={'row'}
              gap={4}
              alignItems={'center'}
              mt={6}
              justifyContent={'space-between'}
              flexWrap={'wrap'}
            >
              <Stack alignItems={'center'} direction={'row'} spacing={4}>
                <Button
                  colorScheme='blue'
                  onClick={handlePreviousPage}
                  isDisabled={!data.pageInfo.hasPreviousPage}
                >
                  Prev
                </Button>
                <Button
                  colorScheme='blue'
                  onClick={handleNextPage}
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
                <Select
                  width={20}
                  value={totalRows}
                  onChange={handleSetRow}
                  id='rowlimit'
                  name='rowlimit'
                >
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </Select>
              </Stack>
            </Flex>
          )}
        </Flex>
      </Card>

      {/* UPLOAD SBOM */}
      {isOpenUpload && (
        <UploadModal
          id={activeRow?.defaultProject?.id}
          isOpen={isOpenUpload}
          onClose={onCloseUpload}
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
        />
      )}

      {/* PROD SBOM DRAWER */}
      {isSbomOpen && (
        <ProductSbomDrawer
          isOpen={isSbomOpen}
          onClose={onSbomClose}
          data={activeRow}
          refetch={refetch}
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
      {isWarning && (
        <Modal isOpen={isWarning} onClose={onWarningClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>
              {activeRow.enabled ? 'Disable' : 'Enable'} Product
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Text>
                {activeRow.enabled ? 'Disable' : 'Enable'} this product will:{' '}
              </Text>
              <UnorderedList>
                <Flex flexDir={'column'} gap={1} mt={4}>
                  {[
                    `${
                      activeRow.enabled ? 'Disable' : 'Enable'
                    } this product, its versions and SBOMs`,
                    `${
                      activeRow.enabled ? 'Disable' : 'Enable'
                    } access to the product for all users`,
                    `${
                      activeRow.enabled ? 'Disable' : 'Enable'
                    } uploads of SBOMs to this product`
                  ].map((item, index) => (
                    <ListItem key={index}>{item}</ListItem>
                  ))}
                </Flex>
              </UnorderedList>
              <Text mt={10}>Are you sure you wish to continue?</Text>
            </ModalBody>
            <ModalFooter>
              <Button mr={3} onClick={onWarningClose}>
                No
              </Button>
              <Button
                colorScheme={activeRow.enabled ? 'red' : 'green'}
                onClick={toggleStatus}
              >
                Yes
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </>
  )
}

export default ProductTable
