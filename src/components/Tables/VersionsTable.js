import {useMutation, useQuery} from '@apollo/client'
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
import {useCallback, useEffect, useMemo, useState} from 'react'
import DataTable from 'react-data-table-component'
import { FaEllipsisV } from 'react-icons/fa'
import { FaScrewdriverWrench } from 'react-icons/fa6'
import { Link, useParams } from 'react-router-dom'
import { timeSince, getFullDateAndTime, customStyles } from 'utils'
import SbomList from 'views/Dashboard/Products/components/SbomList'
import Pagination from "../Pagination";
import {GetVersionsTable} from "../../graphQL/Queries";

const VersionsTable = ({ projectGroup, productId, getVulnData }) => {

  const { data, refetch } = useQuery(
      GetVersionsTable,
      {
        fetchPolicy: 'network-only',
        variables: {
          id: productId
        }
      }
  )
  const versions = data?.project?.sbomVersions

  //This part is needed for the pagination to work. (Modify with caution)
  const paginationSizes = [25, 50, 100]
  const [totalRows, setTotalRows] = useState(paginationSizes[0])

  const [isPrevActive, setIsPrevActive] = useState(false)
  const [isNextActive, setIsNextActive] = useState(false)

  useEffect(() => {
    if (versions) {
      setIsPrevActive(versions.pageInfo?.hasPreviousPage)
      setIsNextActive(versions.pageInfo?.hasNextPage)
    }
  }, [versions])

  const setPaginationControl = (data) => {
    setIsPrevActive(data.project?.sbomVersions?.pageInfo?.hasPreviousPage)
    setIsNextActive(data.project?.sbomVersions?.pageInfo?.hasNextPage)
  }

  const disablePaginationControl = () => {
    setIsPrevActive(false)
    setIsNextActive(false)
  }
  //end

  const handleNextPage = useCallback(async () => {
    disablePaginationControl()
    setCurrentPage(currentPage + 1)

    await refetch({
      first: totalRows,
      last: undefined,
      after: versions.pageInfo.endCursor,
      before: undefined
    }).then((res) => {
      if (res.data) {
        setPaginationControl(res.data);
      }
    });
  }, [refetch, totalRows, versions, currentPage]);

  const handlePreviousPage = useCallback(async () => {
    disablePaginationControl()
    setCurrentPage(currentPage - 1)

    await refetch({
      first: undefined,
      last: totalRows,
      after: undefined,
      before: versions.pageInfo.startCursor
    }).then((res) => {
      if (res.data) {
        setPaginationControl(res.data);
      }
    });
  }, [refetch, totalRows, versions, currentPage]);

  const handleSetRow = useCallback(
      async (e) => {
        const newTotalRows = Number(e.target.value)
        setCurrentPage(1)
        setTotalRows(newTotalRows)
        disablePaginationControl()
        await refetch({
          first: newTotalRows,
          last: undefined,
          after: undefined,
          before: undefined
        }).then((res) => {
          if (res.data) {
            setPaginationControl(res.data)
          }
        })
      },
      [refetch, setTotalRows]
  )

  const {
    userPermissions,
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
        const { id, projectVersion } = row
        return (
          <Link
            to={`/vendor/products/${projectGroup?.name}?id=${productId}&sbom=${id}`}
            onClick={() => {
              localStorage.setItem(
                'currentSBOM',
                JSON.stringify({
                  version: projectVersion,
                  id: id
                })
              )
              localStorage.setItem('activeSbomTab', 0)
              prodCompDispatch({ type: 'CLEAR_PROD_COMP' })
              setActiveSbomTab(0)
            }}
          >
            <Text color={'blue.500'} minWidth='100%' my={3} fontSize={14}>
              {projectVersion}
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
        const { stats, id, projectVersion } = row
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
                  JSON.stringify({ version: projectVersion, id: id })
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
        const { stats, id, projectVersion } = row
        const link = `/vendor/products/${params.name}?id=${productId}&sbom=${id}`
        return (
          <Stack fontWeight={'medium'} direction={'row'}>
            <Link
              to={link}
              onClick={() => onFilterSev(id, projectVersion, ['critical'])}
            >
              <VulnBadge color='red' label='Critical'>
                {stats?.vulnStats?.critical || 0}
              </VulnBadge>
            </Link>
            <Link
              to={link}
              onClick={() => onFilterSev(id, projectVersion, ['high'])}
            >
              <VulnBadge color='orange' label='High'>
                {stats?.vulnStats?.high || 0}
              </VulnBadge>
            </Link>
            <Link
              to={link}
              onClick={() => onFilterSev(id, projectVersion, ['medium'])}
            >
              <VulnBadge color='yellow' label='Medium'>
                {stats?.vulnStats?.medium || 0}
              </VulnBadge>
            </Link>
            <Link
              to={link}
              onClick={() => onFilterSev(id, projectVersion, ['low'])}
            >
              <VulnBadge color='green' label='Low'>
                {stats?.vulnStats?.low || 0}
              </VulnBadge>
            </Link>
            <Link
              to={link}
              onClick={() => onFilterSev(id, version, ['unknown'])}
            >
              <VulnBadge color='gray' label='Unknown'>
                {stats?.vulnStats?.unknown || 0}
              </VulnBadge>
            </Link>
          </Stack>
        )
      },
      width: '360px'
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
      id: 'UPDATED_AT',
      name: 'UPDATED',
      width: '200px',
      selector: (row) => {
        const { updatedAt } = row

        return (
          <Tooltip label={getFullDateAndTime(updatedAt)} placement='top'>
            <Text>{timeSince(updatedAt)}</Text>
          </Tooltip>
        )
      },
      sortable: true,
      sortFunction: (a, b) => {
        const dateA = new Date(a.updatedAt)
        const dateB = new Date(b.updatedAt)
        return dateA - dateB
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
    disablePaginationControl()
    setCurrentPage(1)
    await refetch({
      id: productId,
      first: totalRows,
      after: undefined,
      before: undefined,
      last: undefined
    }).then((res) => {
      if (res.data) {
        setPaginationControl(res.data)
      }
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
              isDisabled={!projectGroup?.enabled || !createSbom}
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

  const dataTableProps = {
    columns: columns,
    data: data?.project?.sbomVersions?.nodes || [],
    customStyles: customStyles,
    defaultSortFieldId: 'UPDATED_AT',
    defaultSortAsc: false,
    subHeader: true,
    subHeaderComponent: subHeaderComponent,
    progressPending: !data?.project?.sbomVersions,
    progressComponent: <CustomLoader />,
    responsive: true,
    persistTableHead: true
  }


  return (
    <>
      <Flex flexDir={'column'} width={'100%'}>
        <DataTable {...dataTableProps}/>
        {versions && (
          <Pagination
            paginationSizes={paginationSizes}
            pageIndex={currentPage}
            totalRows={totalRows}
            totalCount={versions.totalCount}
            onPreviousPage={handlePreviousPage}
            onNextPage={handleNextPage}
            onSetRow={handleSetRow}
            hasNextPage={isNextActive}
            hasPreviousPage={isPrevActive}
          />
        )}
      </Flex>

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
      {isListOpen && versions && (
        <SbomList
          data={activeRow}
          sboms={versions}
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
    </>
  )
}

export default VersionsTable
