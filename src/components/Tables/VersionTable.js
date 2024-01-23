import { useMutation } from '@apollo/client'
import { RepeatIcon } from '@chakra-ui/icons'
import {
  Flex,
  IconButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Portal,
  Stack,
  Text,
  Tooltip,
  Tag,
  useDisclosure,
  UnorderedList,
  Button,
  ListItem,
  Spinner,
  Box,
  TagLabel
} from '@chakra-ui/react'
import CustomLoader from 'components/CustomLoader'
import ProductSbomDrawer from 'components/Drawer/ProductSbomDrawer'
import VulnBadge from 'components/Misc/VulnBadge'
import { sbomDelete } from 'graphQL/Mutation'
import { useGlobalState } from 'hooks/useGlobalState'
import { useEffect, useMemo, useState } from 'react'
import DataTable from 'react-data-table-component'
import { FaEllipsisV } from 'react-icons/fa'
import { FaScrewdriverWrench } from 'react-icons/fa6'
import { Link, useParams } from 'react-router-dom'
import {
  timeSince,
  getFullDateAndTime,
  customStyles,
  removeDuplicates,
  normalizeSBOMVersion
} from 'utils'
import SbomList from 'views/Dashboard/Products/components/SbomList'
import RowLimit from 'views/Sbom/components/RowLimit'

const VersionTable = ({ data, project, productId, refetch, getVulnData }) => {
  const {
    userPermissions,
    totalRows,
    setTotalRows,
    setActiveSbomTab,
    prodVulnState,
    dispatch
  } = useGlobalState()
  const { field, direction } = prodVulnState
  const { prodVulnDispatch, prodCompDispatch } = dispatch

  const sbom = userPermissions?.find((item) => item.key === 'view_sbom')
  const createSbom = sbom?.supersededBy?.some(
    (permission) =>
      permission.key === 'create_sbom' && permission.value === true
  )
  const archiveSbom = sbom?.supersededBy?.some(
    (permission) =>
      permission.key === 'archive_sbom' && permission.value === true
  )

  const params = useParams()
  const [isLoading, setIsLoading] = useState(false)
  const [activeRow, setActiveRow] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)

  const sboms = project ? removeDuplicates(project.sboms) : []

  const totalPages = sboms.length > 0 ? Math.ceil(sboms.length / totalRows) : 1

  const filteredData = sboms
    ? sboms.slice((currentPage - 1) * totalRows, currentPage * totalRows)
    : []

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage)
    }
  }

  const [deleteSbom] = useMutation(sbomDelete)

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

  const onFilterSev = async (id, version, value) => {
    await getVulnData({
      projectId: productId,
      sbomId: id,
      severity: value,
      first: totalRows,
      last: undefined,
      after: undefined,
      before: undefined,
      field: field,
      direction: direction
    }).then((res) => {
      if (res.data) {
        localStorage.setItem(
          'currentSBOM',
          JSON.stringify({ version: version, id: id })
        )
        localStorage.setItem('activeSbomTab', 3)
        prodVulnDispatch({ type: 'FILTER_SEVERITY', payload: value })
      }
    })
  }

  // COLUMNS
  const columns = [
    {
      id: 'VERSION',
      name: 'VERSION',
      selector: (row) => {
        const { primaryComponent, id, createdAt, creationAt } = row
        return (
          <Link
            to={`/vendor/products/${data?.name}?id=${productId}&sbom=${id}`}
            onClick={() => {
              localStorage.setItem(
                'currentSBOM',
                JSON.stringify({
                  version: primaryComponent ? primaryComponent?.version : `Uploaded at ${getFullDateAndTime(creationAt)}`,
                  id: id
                })
              )
              localStorage.setItem('activeSbomTab', 0)
              setActiveSbomTab(0)
            }}
          >
            <Text color={'blue.500'} minWidth='100%' my={3} fontSize={14}>
              {normalizeSBOMVersion(row)}
            </Text>
          </Link>
        )
      },
      wrap: true,
      width: '250px'
    },
    {
      id: 'COMPONENTS',
      name: 'COMPONENTS',
      selector: (row) => {
        const { stats, id, primaryComponent } = row
        return (
          <Link
            to={`/vendor/products/${params.name}?id=${productId}&sbom=${id}`}
          >
            <Tag
              size='md'
              variant='subtle'
              width={16}
              colorScheme={'blue'}
              onClick={() => {
                localStorage.setItem(
                  'currentSBOM',
                  JSON.stringify({
                    version: version,
                    id: id
                  })
                )
                localStorage.setItem('activeSbomTab', 2)
              }}
            >
              <TagLabel mx={'auto'}>{stats?.compCount}</TagLabel>
            </Tag>
          </Link>
        )
      },
      width: '150px'
    },
    {
      id: 'LICENSES',
      name: 'LICENSES',
      selector: (row) => {
        const { stats } = row
        return (
          <Tag size='md' variant='subtle' width={16} colorScheme={'blue'}>
            <TagLabel mx={'auto'}>{stats?.compLicenseCount}</TagLabel>
          </Tag>
        )
      },
      width: '150px'
    },
    {
      id: 'VULNERABILITIES',
      name: 'VULNERABILITIES',
      selector: (row) => {
        const { stats, id, primaryComponent } = row
        const link = `/vendor/products/${params.name}?id=${productId}&sbom=${id}`
        const version = normalizeSBOMVersion(row)

        return (
          <Stack fontWeight={'medium'} direction={'row'}>
            <Link
              to={link}
              onClick={() => onFilterSev(id, version, ['critical'])}
            >
              <VulnBadge color='red' label='Critical'>
                {stats?.vulnStats?.critical ? stats.vulnStats.critical : 0}
              </VulnBadge>
            </Link>
            <Link
              to={link}
              onClick={() => onFilterSev(id, version, ['high'])}
            >
              <VulnBadge color='orange' label='High'>
                {stats?.vulnStats?.high ? stats.vulnStats.high : 0}
              </VulnBadge>
            </Link>
            <Link
              to={link}
              onClick={() => onFilterSev(id, version, ['medium'])}
            >
              <VulnBadge color='yellow' label='Medium'>
                {stats?.vulnStats?.medium ? stats.vulnStats.medium : 0}
              </VulnBadge>
            </Link>
            <Link
              to={link}
              onClick={() => onFilterSev(id, version, ['low'])}
            >
              <VulnBadge color='green' label='Low'>
                {stats?.vulnStats?.low ? stats.vulnStats.low : 0}
              </VulnBadge>
            </Link>
          </Stack>
        )
      },
      width: '300px'
    },
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
      }
    },
    {
      id: 'CREATEDAT',
      name: 'CREATED',
      selector: (row) => {
        const { creationAt } = row

        return (
          <Tooltip label={getFullDateAndTime(creationAt)} placement='top'>
            <Text>{timeSince(creationAt)}</Text>
          </Tooltip>
        )
      },
      right: 'false'
    },
    {
      id: 'UPDATEDAT',
      name: 'UPDATED',
      selector: (row) => {
        const { updatedAt } = row

        return (
          <Tooltip label={getFullDateAndTime(updatedAt)} placement='top'>
            <Text>{timeSince(updatedAt)}</Text>
          </Tooltip>
        )
      },
      right: 'false'
    },
    {
      id: 'ACTION',
      name: 'ACTION',
      selector: (row) => {
        return (
          <Menu>
            <MenuButton
              as={IconButton}
              icon={<FaEllipsisV />}
              variant='none'
              color='gray.400'
            />
            <Portal>
              <MenuList fontSize={16}>
                <MenuItem
                  onClick={() => {
                    setActiveRow(row)
                    onListOpen()
                  }}
                >
                  List SBOM
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    setActiveRow(row)
                    onDeleteOpen()
                  }}
                  isDisabled={!archiveSbom}
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

  const handleDelete = async () => {
    setIsLoading(true)
    await deleteSbom({
      variables: {
        id: activeRow.id
      }
    }).then((res) => {
      if (res.data.sbomDelete?.errors?.length === 0) {
        setTimeout(() => {
          setIsLoading(false)
          refetch({ id: productId })
          onDeleteClose()
        }, 4000)
      }
    })
  }

  // REFRESH PRODUCTS
  const handleRefresh = async () => {
    await refetch({
      id: productId
    })
  }

  const onBuildSbom = () => {
    prodCompDispatch({ type: 'CLEAR_LICENSES' })
    onSbomOpen()
  }

  const subHeaderComponent = useMemo(() => {
    return (
      <Flex width={'100%'} alignItems={'center'} justifyContent={'flex-end'}>
        <Stack direction={'row'} spacing={2} alignItems={'center'}>
          {/* BUILD SBOM */}
          <Tooltip label='Build Version'>
            <IconButton
              isDisabled={!data?.enabled || !createSbom}
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
  }, [handleRefresh])

  useEffect(() => {
    setCurrentPage(1)
  }, [project])

  return (
    <>
      <Flex flexDir={'column'} width={'100%'}>
        <DataTable
          subHeader
          persistTableHead
          responsive={true}
          columns={columns}
          customStyles={customStyles}
          data={filteredData && filteredData}
          progressComponent={<CustomLoader />}
          progressPending={project ? false : true}
          subHeaderComponent={subHeaderComponent}
        />
      </Flex>

      {/* PAGINATION */}
      {project && (
        <Flex
          width={'100%'}
          flexDir={'row'}
          gap={4}
          alignItems={'center'}
          justifyContent={'space-between'}
          mt={6}
        >
          <Stack alignItems={'center'} direction={'row'} spacing={4}>
            <Button
              colorScheme='blue'
              onClick={() => handlePageChange(currentPage - 1)}
              isDisabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button
              colorScheme='blue'
              onClick={() => handlePageChange(currentPage + 1)}
              isDisabled={currentPage === totalPages}
            >
              Next
            </Button>
            <Box>
              Page {currentPage} of {totalPages}
            </Box>
          </Stack>

          {/* ROW LIMIT */}
          <RowLimit
            onChange={(e) => {
              setTotalRows(e.target.value)
              setCurrentPage(1)
            }}
            name='componentRow'
          />
        </Flex>
      )}

      {/* DELETE VERSION */}
      {isDeleteOpen && (
        <Modal isOpen={isDeleteOpen} onClose={onDeleteClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Delete Version</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
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
      {isListOpen && project && (
        <SbomList
          data={activeRow}
          sboms={project?.sboms}
          isOpen={isListOpen}
          onClose={onListClose}
        />
      )}

      {/* BUILD SBOM */}
      {isSbomOpen && data && (
        <ProductSbomDrawer
          isOpen={isSbomOpen}
          onClose={onSbomClose}
          data={data?.projects}
          refetch={refetch}
          productId={productId}
        />
      )}
    </>
  )
}

export default VersionTable
