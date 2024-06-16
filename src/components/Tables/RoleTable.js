import { useState } from 'react'
import DataTable from 'react-data-table-component'
import { customStyles, getFullDateAndTime, timeSince } from 'utils'

import {
  Button,
  Flex,
  Text,
  Tooltip,
  useColorModeValue,
  useDisclosure
} from '@chakra-ui/react'

import CustomLoader from 'components/CustomLoader'
import PermissionDrawer from 'components/Drawer/PermissionDrawer'

const RoleTable = ({ data, role }) => {
  const [selectedRole, setSelectedRole] = useState(null)
  const { isOpen, onOpen, onClose } = useDisclosure()
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
      width: '14%'
    }
  ]

  return (
    <>
      <Flex flexDir={'column'} width={'100%'}>
        <DataTable
          columns={columns}
          data={data || []}
          customStyles={customStyles(headColor)}
          progressPending={data ? false : true}
          progressComponent={<CustomLoader />}
          responsive={true}
        />
      </Flex>

      {isOpen && (
        <PermissionDrawer
          isOpen={isOpen}
          onClose={onClose}
          selectedRole={selectedRole}
          userRole={role}
        />
      )}
    </>
  )
}

export default RoleTable
