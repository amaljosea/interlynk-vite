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
import { useContext, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { FaEllipsisV } from 'react-icons/fa'
import { getFullDateAndTime, timeSince } from 'utils'
import CustomLoader from 'components/CustomLoader'
import DataTable from 'react-data-table-component'
import { AddIcon, RepeatIcon } from '@chakra-ui/icons'
import { useMutation } from '@apollo/client'
import { UpdateProject, DeleteProject } from 'graphQL/Mutation'
import ProductModal from 'views/Dashboard/Products/components/ProductModal'
import UploadModal from 'views/Dashboard/Products/components/UploadModal'
import ProductSbomDrawer from 'components/Drawer/ProductSbomDrawer'
import { useHistory } from 'react-router-dom'
import GlobalContext from 'context/GlobalContext'

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

const ProductTable = ({ data, refetch }) => {
  const toast = useToast()
  const history = useHistory()
  const [pageIndex, setPageIndex] = useState(1)
  const [activeRow, setActiveRow] = useState(null)
  const { isOpen, onOpen, onClose } = useDisclosure()

  const { totalRows, setTotalRows, setCurrentProduct, setActiveProdTab } =
    useContext(GlobalContext)

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

  // REMOVE DUPLICATE PRODUCTS
  const removeDuplicatesAndLatest = (arr) => {
    const uniqueVersions = {}

    for (const item of arr) {
      if (
        !uniqueVersions[item.version] ||
        item.updatedAt > uniqueVersions[item.version].updatedAt
      ) {
        uniqueVersions[item.version] = item
      }
    }

    return Object.values(uniqueVersions)
  }

  const [projectDelete] = useMutation(DeleteProject, {
    onCompleted: () =>
      refetch({
        first: totalRows
      })
  })
  const [projectUpdate] = useMutation(UpdateProject, {
    onCompleted: () =>
      refetch({
        first: totalRows
      })
  })

  // COLUMNS
  const columns = [
    // ACTIVE
    {
      id: 'active',
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
      width: '100px'
    },
    // PRODUCT
    {
      id: 'product',
      name: 'PRODUCT',
      selector: (row) => {
        const { enabled, sboms, name, id } = row
        const uniqVersions = []
        sboms &&
          sboms.map((project) => {
            if (project.primaryComponent) {
              uniqVersions.push({
                version: project.primaryComponent.version,
                id: project.id,
                updatedAt: project.updatedAt
              })
            }
          })

        const filteredData = uniqVersions
          ? removeDuplicatesAndLatest(uniqVersions)
          : []

        return (
          <>
            {sboms.length > 0 && enabled && (
              <Link
                to={`/vendor/products?&p=${id}&sbom=${
                  filteredData.length > 0 ? filteredData[0].id : sboms[0].id
                }`}
                onClick={() => {
                  window.localStorage.setItem('product', name)
                  window.localStorage.setItem(
                    'productVersion',
                    sboms[0].primaryComponent?.version
                  )
                  setCurrentProduct({
                    id: id,
                    sbomId:
                      filteredData.length > 0 ? filteredData[0].id : sboms[0].id
                  })
                  setActiveProdTab(0)
                }}
              >
                <Text color={'blue.500'} minWidth='100%'>
                  {name}
                </Text>
              </Link>
            )}

            {sboms.length === 0 && enabled && (
              <Text
                minWidth='100%'
                color={'blue.500'}
                cursor='pointer'
                onClick={() => {
                  toast({
                    title: 'SBOM Not Found',
                    description: 'Please upload any SBOM file',
                    status: 'info',
                    duration: 2000,
                    position: 'top'
                  })
                }}
              >
                {name}
              </Text>
            )}

            {!enabled && <Text>{name}</Text>}
          </>
        )
      },
      wrap: true
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
                version: project.primaryComponent.version,
                id: project.id,
                updatedAt: project.updatedAt
              })
            }
          })

        const filteredData = uniqVersions
          ? removeDuplicatesAndLatest(uniqVersions)
          : []

        return <Text>{filteredData?.length}</Text>
      },
      wrap: true
    },
    // DESCRIPTION
    {
      id: 'description',
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
      wrap: true
    },
    // UPDATEDAT
    {
      id: 'updatedAt',
      name: 'UPDATEDAT',
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
        return dateB - dateA
      },
      wrap: true
    },
    // ACTIONS
    {
      id: 'actions',
      name: 'ACTIONS',
      selector: (row) => {
        const { enabled, id, name } = row
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
                    history.push(`/vendor/autofix?id=${id}`)
                  }}
                >
                  Edit Automation
                </MenuItem>
                <MenuItem
                  isDisabled={!enabled}
                  onClick={() => {
                    window.localStorage.setItem('activeProduct', name)
                    history.push(`/vendor/changelog?id=${id}`)
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
                  onClick={() => {
                    setActiveRow(row)
                    onSbomOpen()
                  }}
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
    try {
      await projectDelete({
        variables: {
          id
        }
      }).then((res) => res.data && onDeleteClose())
    } catch (error) {
      console.error('Mutation error:', error)
    }
  }

  // REFRESH PRODUCTS
  const handleRefresh = async () => {
    await refetch({
      first: totalRows
    })
  }

  // TOGGLE STATUS
  const toggleStatus = async () => {
    try {
      await projectUpdate({
        variables: {
          id: activeRow.id,
          enabled: activeRow.enabled === true ? false : true
        }
      })
        .then((res) => res.data && refetch({ first: totalRows }))
        .finally(() => onWarningClose())
    } catch (error) {
      console.error('Mutation error:', error)
    }
  }

  const subHeaderComponent = useMemo(() => {
    return (
      <Flex
        width={'100%'}
        direction={'row'}
        gap={2}
        alignItems={'center'}
        justifyContent={'flex-end'}
      >
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
      </Flex>
    )
  }, [handleRefresh])

  // PREV PAGE
  const handlePreviousPage = () => {
    setPageIndex((prev) => pageIndex !== 0 && prev - 1)
    refetch({
      first: undefined,
      last: totalRows,
      after: undefined,
      before: data.pageInfo.startCursor
    })
  }

  // NEXT PAGE
  const handleNextPage = () => {
    setPageIndex((prev) => prev < Math.ceil(data.totalCount) && prev + 1)
    refetch({
      first: totalRows,
      last: undefined,
      after: data.pageInfo.endCursor,
      before: undefined
    })
  }

  // SET ROW LENGTH
  const handleSetRow = (e) => {
    setTotalRows(Number(e.target.value))
    refetch({
      first: Number(e.target.value),
      last: undefined,
      after: undefined,
      before: undefined
    })
    setPageIndex(1)
  }

  return (
    <>
      <Flex flexDir={'column'} width={'100%'}>
        <DataTable
          columns={columns}
          data={data && data.nodes}
          customStyles={customStyles}
          defaultSortAsc={true}
          defaultSortFieldId={'updatedAt'}
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
          projectId={activeRow.id}
          name={activeRow.name}
          refetch={refetch}
          sbomData={null}
          type={activeRow.sboms.length > 0 && activeRow.sboms[0].format}
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
