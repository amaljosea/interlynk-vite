import { useState } from 'react'
import DataTable from 'react-data-table-component'
import { customStyles, getFullDateAndTime, timeSince } from 'utils'

import { Button, Flex, Text, Tooltip, useDisclosure } from '@chakra-ui/react'

import PermissionDrawer from 'components/Drawer/PermissionDrawer'

const RoleTable = ({ data, role, tabIndex }) => {
  const [selectedRole, setSelectedRole] = useState(null)
  const { isOpen, onOpen, onClose } = useDisclosure()

  const columns = [
    // NAME
    {
      id: 'name',
      name: 'NAME',
      selector: (row) => (
        <Text textTransform={'capitalize'} my={2}>
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
          <Text textTransform={'lowercase'}>{timeSince(row?.createdAt)}</Text>
        </Tooltip>
      ),
      right: 'true'
    },
    // PERMISSIONS
    {
      id: 'action',
      name: 'ACTION',
      selector: (row) => (
        <Button
          variant='solid'
          colorScheme='blue'
          size='sm'
          onClick={() => {
            setSelectedRole(row?.name)
            onOpen()
          }}
        >
          Permissions
        </Button>
      ),
      right: 'true',
      width: '200px'
    }
  ]

  return (
    <>
      <Flex flexDir={'column'} width={'100%'}>
        <DataTable
          columns={columns}
          data={data || []}
          customStyles={customStyles}
          progressPending={data ? false : true}
          responsive={true}
        />
      </Flex>

      {isOpen && (
        <PermissionDrawer
          isOpen={isOpen}
          onClose={onClose}
          selectedRole={selectedRole}
          tabIndex={tabIndex}
          userRole={role}
        />
      )}
    </>
  )
}

export default RoleTable
