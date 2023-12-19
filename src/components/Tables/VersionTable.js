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
  Badge,
  useDisclosure,
  UnorderedList,
  Button,
  ListItem,
  Spinner,
  Box
} from '@chakra-ui/react'
import CustomLoader from 'components/CustomLoader'
import GlobalContext from 'context/GlobalContext'
import { sbomDelete } from 'graphQL/Mutation'
import { useContext, useMemo, useState } from 'react'
import DataTable from 'react-data-table-component'
import { FaEllipsisV } from 'react-icons/fa'
import { Link, useNavigate } from 'react-router-dom'
import { timeSince } from 'utils'
import { getFullDateAndTime } from 'utils'
import { customStyles } from 'utils'

const VersionTable = ({ name, project, productId, refetch }) => {
  const navigate = useNavigate()
  const { setActiveProdTab } = useContext(GlobalContext)
  const [isLoading, setIsLoading] = useState(false)
  const [activeRow, setActiveRow] = useState(null)

  const [deleteSbom] = useMutation(sbomDelete)

  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose
  } = useDisclosure()

  // COLUMNS
  const columns = [
    {
      id: 'VERSION',
      name: 'VERSION',
      selector: (row) => {
        const { primaryComponent, id, creationAt } = row
        return (
          <Link
            to={`/vendor/products/${name}?id=${productId}&sbom=${id}`}
            onClick={() => {
              localStorage.setItem(
                'currentSBOM',
                JSON.stringify({
                  version: primaryComponent?.version,
                  id: id
                })
              )
              setActiveProdTab(0)
            }}
          >
            <Text color={'blue.500'} minWidth='100%' my={3}>
              {primaryComponent
                ? primaryComponent.version
                : `Uploaded ${getFullDateAndTime(creationAt)}`}
            </Text>
          </Link>
        )
      },
      wrap: true,
      width: '200px'
    },
    {
      id: 'COMPONENTS',
      name: 'COMPONENTS',
      selector: (row) => {
        const { stats } = row
        return (
          <Badge
            width={10}
            textAlign={'center'}
            variant='subtle'
            borderRadius='sm'
            colorScheme='blue'
            fontSize={'sm'}
            fontWeight={'medium'}
          >
            {stats?.compCount}
          </Badge>
        )
      }
    },
    {
      id: 'LICENSES',
      name: 'LICENSES',
      selector: (row) => {
        const { stats } = row
        return (
          <Badge
            width={10}
            textAlign={'center'}
            variant='subtle'
            borderRadius='sm'
            colorScheme='blue'
            fontSize={'sm'}
            fontWeight={'medium'}
          >
            {stats?.compLicenseCount}
          </Badge>
        )
      }
    },
    {
      id: 'VULNERABILITIES',
      name: 'VULNERABILITIES',
      selector: (row) => {
        const { stats } = row
        return (
          <Stack fontWeight={'medium'} direction={'row'}>
            <Tooltip label='Critical' placement='top'>
              <Badge
                width={10}
                textAlign='center'
                fontSize={'sm'}
                fontWeight={'medium'}
                variant='subtle'
                colorScheme='red'
                borderRadius='sm'
                cursor={'pointer'}
              >
                {stats?.vulnStats?.critical ? stats.vulnStats.critical : 0}
              </Badge>
            </Tooltip>
            <Tooltip label='High' placement='top'>
              <Badge
                width={10}
                textAlign='center'
                fontSize={'sm'}
                fontWeight={'medium'}
                variant='subtle'
                colorScheme='orange'
                borderRadius='sm'
                cursor={'pointer'}
              >
                {stats?.vulnStats?.high ? stats.vulnStats.high : 0}
              </Badge>
            </Tooltip>
            <Tooltip label='Medium' placement='top'>
              <Badge
                width={10}
                textAlign='center'
                fontSize={'sm'}
                fontWeight={'medium'}
                variant='subtle'
                colorScheme='yellow'
                borderRadius='sm'
                cursor={'pointer'}
              >
                {stats?.vulnStats?.medium ? stats.vulnStats.medium : 0}
              </Badge>
            </Tooltip>
            <Tooltip label='Low' placement='top'>
              <Badge
                width={10}
                textAlign='center'
                fontSize={'sm'}
                fontWeight={'medium'}
                variant='subtle'
                colorScheme='green'
                borderRadius='sm'
                cursor={'pointer'}
              >
                {stats?.vulnStats?.low ? stats.vulnStats.low : 0}
              </Badge>
            </Tooltip>
          </Stack>
        )
      },
      width: '200px'
    },
    {
      id: 'STATUS',
      name: 'STATUS',
      selector: (row) => {
        const { lifecycle } = row

        return (
          <Tag size='sm' colorScheme='cyan' textTransform={'capitalize'}>
            {lifecycle}
          </Tag>
        )
      }
    },
    {
      id: 'UPDATEDAT',
      name: 'UPDATED AT',
      selector: (row) => {
        const { updatedAt } = row

        return (
          <Tooltip label={getFullDateAndTime(updatedAt)} placement='top'>
            <Text>{timeSince(updatedAt)}</Text>
          </Tooltip>
        )
      }
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
              <MenuList fontSize={'sm'}>
                <MenuItem
                  onClick={() => {
                    setActiveRow(row)
                    onDeleteOpen()
                  }}
                >
                  Delete Version
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
        setIsLoading(false)
        navigate(`/vendor/products`)
      }
    })
  }

  // REFRESH PRODUCTS
  const handleRefresh = async () => {
    await refetch({
      id: productId
    })
  }

  const subHeaderComponent = useMemo(() => {
    return (
      <Flex width={'100%'} alignItems={'center'} justifyContent={'flex-end'}>
        <Stack direction={'row'} spacing={2} alignItems={'center'}>
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

  return (
    <>
      <Flex flexDir={'column'} width={'100%'}>
        <DataTable
          subHeader
          persistTableHead
          responsive={true}
          columns={columns}
          customStyles={customStyles}
          data={project && project.sboms}
          progressComponent={<CustomLoader />}
          progressPending={project ? false : true}
          subHeaderComponent={subHeaderComponent}
        />
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
    </>
  )
}

export default VersionTable
