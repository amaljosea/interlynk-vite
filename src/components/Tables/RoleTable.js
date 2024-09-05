import { useQuery } from '@apollo/client'
import { useMemo, useState } from 'react'
import DataTable from 'react-data-table-component'
import { customStyles, getFullDateAndTime, timeSince } from 'utils'
import CreateRole from 'views/Dashboard/Profile/components/CreateRole'
import DeleteRole from 'views/Dashboard/Profile/components/DeleteRole'

import { AddIcon } from '@chakra-ui/icons'
import {
  Flex,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Portal,
  Text,
  Tooltip,
  useColorModeValue,
  useDisclosure
} from '@chakra-ui/react'

import Card from 'components/Card/Card'
import CardHeader from 'components/Card/CardHeader'
import CustomLoader from 'components/CustomLoader'
import PermissionDrawer from 'components/Drawer/PermissionDrawer'

import { useGlobalQueryContext } from 'hooks/useGlobalQueryContext'
import { useHasPermission } from 'hooks/useHasPermission'
import useQueryParam from 'hooks/useQueryParam'

import { GetRoles } from 'graphQL/Queries'

import { FaEllipsisV } from 'react-icons/fa'

const RoleTable = () => {
  const activetab = useQueryParam('tab')
  const { orgView } = useGlobalQueryContext()

  const updateOrgs = useHasPermission({
    parentKey: 'view_organization',
    childKey: 'update_organization'
  })

  const editUserRole = useHasPermission({
    parentKey: 'view_users',
    childKey: 'edit_user_role'
  })

  const { data, loading } = useQuery(GetRoles, {
    skip: !orgView ? true : activetab === 'roles' ? false : true
  })

  const { organizationRoles } = data?.organization || ''

  const [selectedRole, setSelectedRole] = useState(null)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const {
    isOpen: isDelOpen,
    onOpen: onDelOpen,
    onClose: onDelClose
  } = useDisclosure()
  const {
    isOpen: isRoleOpen,
    onOpen: onRoleOpen,
    onClose: onRoleClose
  } = useDisclosure()
  const headColor = useColorModeValue('#4A5568', '#CBD5E0')
  const textColor = useColorModeValue('#1A202C', '#F7FAFC')

  const columns = [
    // NAME
    {
      id: 'name',
      name: 'NAME',
      selector: (row) => (
        <Text color={textColor} textTransform={'capitalize'} my={2}>
          {row?.name}
        </Text>
      ),
      wrap: true
    },
    // CREATED AT
    {
      id: 'createdAt',
      name: 'CREATED',
      selector: (row) => (
        <Tooltip label={getFullDateAndTime(row?.createdAt)} placement='top'>
          <Text color={textColor} textTransform={'lowercase'}>
            {timeSince(row?.createdAt)}
          </Text>
        </Tooltip>
      ),
      right: 'true',
      sortable: true,
      sortFunction: (a, b) => {
        const dateA = new Date(a.createdAt)
        const dateB = new Date(b.createdAt)
        return dateA - dateB // Sort in descending order
      }
    },
    // PERMISSIONS
    {
      id: 'action',
      name: 'ACTION',
      selector: (row) => {
        const { name } = row
        return (
          <Menu>
            <MenuButton
              as={IconButton}
              icon={<FaEllipsisV />}
              variant='none'
              color='gray.400'
            />
            <Portal>
              <MenuList size='sm'>
                <MenuItem
                  onClick={() => {
                    setSelectedRole(name)
                    onOpen()
                  }}
                >
                  View Permissions
                </MenuItem>
                <MenuItem
                  color={'red.500'}
                  isDisabled={!editUserRole}
                  onClick={() => {
                    setSelectedRole(row)
                    onDelOpen()
                  }}
                >
                  Delete Role
                </MenuItem>
              </MenuList>
            </Portal>
          </Menu>
        )
      },
      width: '10%',
      right: 'true'
    }
  ]

  // HEADER SECTION
  const subHeader = useMemo(() => {
    return (
      <Flex width={'100%'} alignItems={'center'} justifyContent={'flex-end'}>
        <Tooltip label='Add Role'>
          <IconButton
            icon={<AddIcon />}
            colorScheme='blue'
            onClick={onRoleOpen}
            isDisabled={!updateOrgs}
          />
        </Tooltip>
      </Flex>
    )
  }, [updateOrgs, onRoleOpen])

  return (
    <>
      <Card boxShadow={'none'} p={0}>
        <CardHeader p='12px 0' display={'flex'} flexDirection={'column'}>
          <Text fontSize='lg' color={textColor} fontWeight='bold'>
            Roles Management
          </Text>
          <Text fontSize={'sm'}>
            Manage user roles, assign permissions, and control access within
            your system.
          </Text>
        </CardHeader>
      </Card>
      <Flex flexDir={'column'} width={'100%'}>
        <DataTable
          subHeader
          responsive={true}
          columns={columns}
          defaultSortAsc={false}
          progressPending={loading}
          defaultSortFieldId={'createdAt'}
          data={organizationRoles || []}
          subHeaderComponent={subHeader}
          progressComponent={<CustomLoader />}
          customStyles={customStyles(headColor)}
        />
      </Flex>

      {isOpen && (
        <PermissionDrawer
          isOpen={isOpen}
          onClose={onClose}
          selectedRole={selectedRole}
        />
      )}

      {isRoleOpen && <CreateRole isOpen={isRoleOpen} onClose={onRoleClose} />}

      {isDelOpen && (
        <DeleteRole
          isOpen={isDelOpen}
          onClose={onDelClose}
          activeRole={selectedRole}
        />
      )}
    </>
  )
}

export default RoleTable
