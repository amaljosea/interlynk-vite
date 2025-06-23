import { useQuery } from '@apollo/client'
import { useMemo, useState } from 'react'
import { getFullDate, timeSince } from 'utils'
import CreateRole from 'views/Dashboard/Profile/components/CreateRole'
import DeleteRole from 'views/Dashboard/Profile/components/DeleteRole'

import {
  Flex,
  Menu,
  MenuItem,
  MenuList,
  Portal,
  Text,
  Tooltip,
  useDisclosure
} from '@chakra-ui/react'

import PermissionDrawer from 'components/Drawer/PermissionDrawer'
import AddButton from 'components/Icons/AddButton'
import LynkTable from 'components/LynkTable'
import LynkAction from 'components/Misc/LynkAction'

import { useGlobalQueryContext } from 'hooks/useGlobalQueryContext'
import { useHasPermission } from 'hooks/useHasPermission'
import useQueryParam from 'hooks/useQueryParam'
import { useThemeColor } from 'hooks/useThemeColors'

import { GetRoles } from 'graphQL/Queries'

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
    skip: !orgView || activetab !== 'roles'
  })

  const roles = data?.organization?.organizationRoles || []

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
  const { primaryTextColor, primaryErrorColor } = useThemeColor([
    'primaryTextColor',
    'primaryErrorColor'
  ])

  const columns = useMemo(
    () => [
      // NAME
      {
        id: 'name',
        name: 'NAME',
        selector: (row) => (
          <Text
            fontSize={14}
            color={primaryTextColor}
            textTransform='capitalize'
          >
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
          <Tooltip label={getFullDate(row?.createdAt)} placement='top'>
            <Text
              fontSize={14}
              color={primaryTextColor}
              textTransform='lowercase'
            >
              {timeSince(row?.createdAt)}
            </Text>
          </Tooltip>
        ),
        right: 'true',
        sortable: true,
        sortFunction: (a, b) => new Date(a.createdAt) - new Date(b.createdAt) // Sort in descending order
      },
      // PERMISSIONS
      {
        id: 'action',
        name: 'ACTION',
        selector: (row) => (
          <Menu>
            <LynkAction />
            <Portal>
              <MenuList fontSize={'sm'}>
                <MenuItem
                  onClick={() => {
                    setSelectedRole(row.name)
                    onOpen()
                  }}
                >
                  View Permissions
                </MenuItem>
                <MenuItem
                  color={primaryErrorColor}
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
        ),
        width: '10%',
        right: 'true'
      }
    ],
    [primaryTextColor, primaryErrorColor, editUserRole, onOpen, onDelOpen]
  )

  // HEADER SECTION
  const subHeader = useMemo(
    () => (
      <Flex
        width={'100%'}
        alignItems={'center'}
        justifyContent={'space-between'}
      >
        <Flex flexDirection={'column'}>
          <Text
            fontSize='lg'
            color={primaryTextColor}
            fontWeight='bold'
            textAlign={'start'}
          >
            Roles Management
          </Text>
          <Text fontSize={'sm'}>
            Manage user roles, assign permissions, and control access within
            your system.
          </Text>
        </Flex>
        <AddButton
          label='Add Role'
          onClick={onRoleOpen}
          isDisabled={!updateOrgs}
          data-testid='add_role'
        />
      </Flex>
    ),
    [primaryTextColor, updateOrgs, onRoleOpen]
  )

  return (
    <>
      <Flex flexDir={'column'} width={'100%'}>
        <LynkTable
          columns={columns}
          data={roles}
          subHeader
          subHeaderComponent={subHeader}
          progressPending={loading}
          defaultSortFieldId='createdAt'
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
