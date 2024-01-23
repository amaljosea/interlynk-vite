import { AddIcon, DeleteIcon } from '@chakra-ui/icons'
import {
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Button,
  Text,
  Flex,
  Tooltip,
  IconButton,
  Stack,
  useDisclosure
} from '@chakra-ui/react'
import { timeSince, customStyles, getFullDateAndTime } from 'utils'
import CustomLoader from 'components/CustomLoader'
import DataTable from 'react-data-table-component'
import { useMemo } from 'react'
import EnvModal from 'views/Dashboard/Products/components/EnvModal'
import { useMutation } from '@apollo/client'
import { EnvDelete } from 'graphQL/Mutation'
import { isDefaultEnv, removeDuplicates } from 'utils'

const EnvironmentDrawer = ({ data, isOpen, onClose, refetch, activeEnv }) => {
  const {
    isOpen: isProdOpen,
    onOpen: onProdOpen,
    onClose: onProdClose
  } = useDisclosure()

  const [projectDelete] = useMutation(EnvDelete)

  const handleDelete = async (id) => {
    await projectDelete({
      variables: {
        id
      }
    }).then(
      (res) =>
        res.data &&
        refetch({
          id: data?.projectGroup?.id
        })
    )
  }

  // TABLE HEADER
  const Header = useMemo(() => {
    return (
      <Flex width={'100%'} alignItems={'center'} justifyContent={'flex-end'}>
        <Stack direction={'row'} spacing={2} alignItems={'center'}>
          {/* ADD ENV */}
          <Tooltip label='Add Environment' placement='left'>
            <IconButton
              icon={<AddIcon />}
              colorScheme='blue'
              variant='solid'
              isDisabled={!data?.projectGroup?.enabled}
              onClick={() => {
                onProdOpen()
              }}
            />
          </Tooltip>
        </Stack>
      </Flex>
    )
  }, [])

  // COLUMNS
  const columns = [
    // NAME
    {
      id: 'NAME',
      name: 'NAME',
      selector: (row) => {
        const { name } = row
        return (
          <Text textTransform={isDefaultEnv(name) ? 'capitalize' : 'none'}>
            {name}
          </Text>
        )
      },
      wrap: true,
      sortable: true,
      sortFunction: (a, b) => a.name.localeCompare(b.name)
    },
    // VERSION
    {
      id: 'VERSIONS',
      name: 'VERSIONS',
      selector: (row) => <Text>{removeDuplicates(row?.sboms)?.length}</Text>,
      wrap: true
    },
    // CREATED AT
    {
      id: 'CREATEDAT',
      name: 'CREATED AT',
      selector: (row) => (
        <Tooltip label={getFullDateAndTime(row?.updatedAt)}>
          <Text>{timeSince(row?.updatedAt)}</Text>
        </Tooltip>
      ),
      wrap: true
    },
    // ACTIONS
    {
      id: 'ACTIONS',
      name: 'ACTIONS',
      selector: (row) => {
        const { name, id } = row
        return (
          <IconButton
            size='xs'
            icon={<DeleteIcon />}
            colorScheme='red'
            variant='solid'
            isDisabled={isDefaultEnv(name) || id === activeEnv}
            onClick={() => handleDelete(id)}
          />
        )
      },
      wrap: true
    }
  ]

  return (
    <>
      <Drawer isOpen={isOpen} placement='right' size='lg' onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Environments</DrawerHeader>

          <DrawerBody>
            <Flex flexDir={'column'} width={'100%'}>
              <DataTable
                columns={columns}
                data={data?.projectGroup?.projects || []}
                customStyles={customStyles}
                defaultSortAsc
                defaultSortFieldId={'NAME'}
                progressPending={data?.projectGroup ? false : true}
                progressComponent={<CustomLoader />}
                subHeader
                subHeaderComponent={Header}
                persistTableHead
                responsive={true}
              />
            </Flex>
          </DrawerBody>

          <DrawerFooter display={'none'}>
            <Button mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme='blue'>Save</Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {/* ADD PROJECT */}
      {isProdOpen && (
        <EnvModal
          isOpen={isProdOpen}
          onClose={onProdClose}
          groupId={data?.projectGroup?.id}
          refetch={refetch}
        />
      )}
    </>
  )
}

export default EnvironmentDrawer
