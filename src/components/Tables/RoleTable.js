import { useQuery } from '@apollo/client'
import { useMemo, useState } from 'react'
import DataTable from 'react-data-table-component'
import { getFullDate, timeSince } from 'utils'
import { customStyles } from 'utils/styleUtils'
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

import CustomLoader from 'components/CustomLoader'
import PermissionDrawer from 'components/Drawer/PermissionDrawer'
import AddButton from 'components/Icons/AddButton'
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
  const { headingTextColor, primaryTextColor, primaryErrorColor } =
    useThemeColor(['headingTextColor', 'primaryTextColor', 'primaryErrorColor'])
  const paddingCell = 0
  const paddingHeadCell = 0

  const columns = [
    // NAME
    {
      id: 'name',
      name: 'NAME',
      selector: (row) => (
        <Text color={primaryTextColor} textTransform={'capitalize'} my={2}>
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
          <Text color={primaryTextColor} textTransform={'lowercase'}>
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
            <LynkAction />
            <Portal>
              <MenuList fontSize={'sm'}>
                <MenuItem
                  onClick={() => {
                    setSelectedRole(name)
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
        )
      },
      width: '10%',
      right: 'true'
    }
  ]

  // HEADER SECTION
  const subHeader = useMemo(() => {
    return (
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
    )
  }, [updateOrgs, onRoleOpen, primaryTextColor])

  return (
    <>
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
          customStyles={customStyles(
            headingTextColor,
            null,
            paddingCell,
            paddingHeadCell
          )}
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
