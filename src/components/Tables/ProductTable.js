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
  useToast,
  Stack,
  Select
} from '@chakra-ui/react'
import { useContext, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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
import { UpdateProject, DeleteProject } from 'graphQL/Mutation'
import ProductModal from 'views/Dashboard/Products/components/ProductModal'
import UploadModal from 'views/Dashboard/Products/components/UploadModal'
import ProductSbomDrawer from 'components/Drawer/ProductSbomDrawer'
import GlobalContext from 'context/GlobalContext'
import SearchFilter from 'views/Sbom/components/SearchFilter'
import ProdFilterMenu from 'views/Dashboard/Products/components/ProdFilterMenu'
import { useGlobalState } from 'hooks/useGlobalState'
import ProdSearchFilter from 'views/Sbom/components/ProdSearchFilter'

const ProductTable = ({ data, refetch }) => {
  const { totalRows, setTotalRows, prodState, dispatch } = useGlobalState()
  const { field, direction, searchInput, pageIndex } = prodState
  const { prodDispatch } = dispatch

  const toast = useToast()
  const navigate = useNavigate()
  const [activeRow, setActiveRow] = useState(null)
  const [activeProd, setActiveProd] = useState('yes')

  const { isOpen, onOpen, onClose } = useDisclosure()

  const {
    setCurrentProduct,
    setActiveProdTab,
    setLicenseType,
    setSpdxList,
    setSpdxLicense,
    setLicenseExp
  } = useContext(GlobalContext)

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

  const [projectDelete] = useMutation(DeleteProject, {
    onCompleted: () =>
      refetch({
        first: totalRows,
        field: field,
        direction: direction
      })
  })

  const [projectUpdate] = useMutation(UpdateProject, {
    onCompleted: () =>
      refetch({
        first: totalRows,
        field: field,
        direction: direction
      })
  })

  const handleOpenSbom = (row) => {
    setActiveRow(row)
    setLicenseType('license_spdx')
    setSpdxList([])
    setSpdxLicense([])
    setLicenseExp([])
    onSbomOpen()
  }

  // COLUMNS
  const columns = [
    // ACTIVE
    {
      id: 'PROJECTS_ENABLED',
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
      id: 'PROJECTS_NAME',
      name: 'PRODUCT',
      selector: (row) => {
        const { enabled, sboms, name, id } = row
        const uniqVersions = []
        sboms &&
          sboms.map((project) => {
            if (project.primaryComponent) {
              uniqVersions.push({
                label: project.primaryComponent.version,
                value: project.id,
                creationAt: project.creationAt
              })
            }
          })

        const filteredData = uniqVersions ? removeDuplicates(uniqVersions) : []

        const product = {
          id: id,
          name: name,
          version:
            filteredData.length > 0
              ? filteredData[0].label
              : sboms.length > 0
              ? sboms[0].primaryComponent?.version
              : '',
          sbomId:
            filteredData.length > 0
              ? filteredData[0].value
              : sboms.length > 0
              ? sboms[0].id
              : ''
        }

        const handleClick = () => {
          if (sboms.length > 0) {
            window.localStorage.setItem('product', JSON.stringify(product))
            setCurrentProduct({
              id: id,
              sbomId:
                filteredData.length > 0 ? filteredData[0].value : sboms[0].id
            })
          }
          setActiveProdTab(0)
        }

        return (
          <Link to={`/vendor/products/${name}?id=${id}`} onClick={handleClick}>
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
        const { sboms } = row
        const uniqVersions = []
        sboms &&
          sboms.map((project) => {
            if (project.primaryComponent) {
              uniqVersions.push({
                label: project.primaryComponent.version,
                value: project.id,
                creationAt: project.creationAt
              })
            }
          })

        const filteredData = uniqVersions ? removeDuplicates(uniqVersions) : []

        return <Text>{sboms.length}</Text>
      },
      wrap: true
    },
    // DESCRIPTION
    {
      id: 'PROJECTS_DESCRIPTION',
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
      id: 'PROJECTS_UPDATED_AT',
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
        const { enabled, id, name, sboms } = row
        const uniqVersions = []
        sboms &&
          sboms.map((project) => {
            if (project.primaryComponent) {
              uniqVersions.push({
                label: project.primaryComponent.version,
                value: project.id,
                creationAt: project.creationAt
              })
            }
          })

        const filteredData = uniqVersions ? removeDuplicates(uniqVersions) : []

        const product = {
          id: id,
          name: name,
          version:
            filteredData.length > 0
              ? filteredData[0].label
              : sboms.length > 0
              ? sboms[0].primaryComponent?.version
              : '',
          sbomId:
            filteredData.length > 0
              ? filteredData[0].value
              : sboms.length > 0
              ? sboms[0].id
              : ''
        }

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
                <MenuItem
                  onClick={() => {
                    setActiveRow(row)
                    onOpen()
                  }}
                  isDisabled={!enabled}
                >
                  Edit Product
                </MenuItem>
                <MenuItem
                  isDisabled={!enabled}
                  onClick={() => {
                    window.localStorage.setItem('activeProduct', name)
                    window.localStorage.setItem(
                      'product',
                      JSON.stringify(product)
                    )
                    window.localStorage.setItem(
                      'activeSBOM',
                      filteredData.length > 0
                        ? filteredData[0].value
                        : sboms[0].id
                    )
                    navigate(`/vendor/autofix?id=${id}`)
                  }}
                >
                  Settings
                </MenuItem>
                <MenuItem
                  display={'none'}
                  isDisabled={!enabled}
                  onClick={() => {
                    window.localStorage.setItem('activeProduct', name)
                    window.localStorage.setItem(
                      'activeSBOM',
                      sboms.length > 0 && filteredData.length > 0
                        ? filteredData[0].value
                        : null
                    )
                    navigate(`/vendor/changelog?id=${id}`)
                  }}
                >
                  View Change Log
                </MenuItem>
                <Divider />
                <MenuItem
                  onClick={() => {
                    setActiveRow(row)
                    onOpenUpload()
                  }}
                  isDisabled={!enabled}
                >
                  Upload SBOM
                </MenuItem>
                <MenuItem
                  onClick={() => handleOpenSbom(row)}
                  isDisabled={!enabled}
                >
                  Build SBOM
                </MenuItem>
                <Divider />
                <MenuItem
                  color='red'
                  onClick={() => {
                    setActiveRow(row)
                    onDeleteOpen()
                  }}
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

  // DELETE PRODUCT
  const onProductDelete = async () => {
    await projectDelete({
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
    await projectUpdate({
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

  // ON SEARCH INPUT CHANGE
  const onSearchInputChange = (e) => {
    prodDispatch({ type: 'CHANGE_SEARCH_INPUT', payload: e.target.value })
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
            onFilter={handleSearch}
            onClear={handleClear}
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
          <Tooltip label='Add Product'>
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
    activeProd,
    handleClear,
    handleSearch,
    handleRefresh,
    onFilterActive,
    onSearchInputChange
  ])

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
    }).then((res) => res.data && prodDispatch({ type: 'DECREMENT_PAGE' }))
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
        prodDispatch({ type: 'INCREMENT_PAGE', payload: data.totalCount })
    )
  }

  // SET ROW LENGTH
  const handleSetRow = async (e) => {
    await refetch({
      first: Number(e.target.value),
      last: undefined,
      after: undefined,
      before: undefined
    }).then((res) => {
      if (res.data) {
        setTotalRows(Number(e.target.value))
        prodDispatch({ type: 'FETCH_DATA_SUCCESS' })
      }
    })
  }

  return (
    <>
      <Flex flexDir={'column'} width={'100%'}>
        <DataTable
          columns={columns}
          onSort={handleSort}
          data={data && data.nodes}
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

      {/* UPLOAD SBOM */}
      {isOpenUpload && (
        <UploadModal
          id={activeRow.id}
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
          type={null}
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
          type={activeRow.sboms.length > 0 && activeRow.sboms[0].format}
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
