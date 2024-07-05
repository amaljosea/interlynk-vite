import { useQuery } from '@apollo/client'
import { useMemo, useState } from 'react'
import DataTable from 'react-data-table-component'
import { customStyles, getFullDateAndTime, timeSince } from 'utils'
import CreateRole from 'views/Dashboard/Profile/components/CreateRole'

import { AddIcon } from '@chakra-ui/icons'
import {
  Flex,
  IconButton,
  Text,
  Tooltip,
  useColorModeValue,
  useDisclosure
} from '@chakra-ui/react'

import CustomLoader from 'components/CustomLoader'
import PermissionDrawer from 'components/Drawer/PermissionDrawer'

import { useGlobalState } from 'hooks/useGlobalState'
import { useHasPermission } from 'hooks/useHasPermission'
import useQueryParam from 'hooks/useQueryParam'

import { GetRoles } from 'graphQL/Queries'

import { FaUserLock } from 'react-icons/fa6'

const RoleTable = () => {
  const activetab = useQueryParam('tab')
  const org = localStorage.getItem('organization')

  const { userPermissions } = useGlobalState()
  const updateOrgs = useHasPermission({
    parentKey: 'view_organization',
    childKey: 'update_organization'
  })

  const { data, loading, refetch } = useQuery(GetRoles, {
    skip: org === 'undefined' ? true : activetab === 'roles' ? false : true
  })

  const { currentUser, organizationRoles } = data?.organization || ''
  const { role } = currentUser || ''

  const [selectedRole, setSelectedRole] = useState(null)
  const { isOpen, onOpen, onClose } = useDisclosure()
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
      selector: (row) => (
        <IconButton
          size='sm'
          variant='solid'
          colorScheme='blue'
          icon={<FaUserLock />}
          onClick={() => {
            setSelectedRole(row?.name)
            onOpen()
          }}
        />
      ),
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

      {isRoleOpen && (
        <CreateRole
          refetch={refetch}
          isOpen={isRoleOpen}
          onClose={onRoleClose}
        />
      )}
    </>
  )
}

export default RoleTable
