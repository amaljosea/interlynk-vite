import { useMemo, useState } from 'react'
import DataTable from 'react-data-table-component'
import { customStyles, getFullDateAndTime, timeSince } from 'utils'

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

import { FaUserLock } from 'react-icons/fa6'

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
          <IconButton colorScheme='blue' icon={<AddIcon />} />
        </Tooltip>
      </Flex>
    )
  }, [])

  return (
    <>
      <Flex flexDir={'column'} width={'100%'}>
        <DataTable
          subHeader
          responsive={true}
          columns={columns}
          data={data || []}
          subHeaderComponent={subHeader}
          progressComponent={<CustomLoader />}
          progressPending={data ? false : true}
          customStyles={customStyles(headColor)}
        />
      </Flex>

      {isOpen && (
        <PermissionDrawer
          userRole={role}
          isOpen={isOpen}
          onClose={onClose}
          selectedRole={selectedRole}
        />
      )}
    </>
  )
}

export default RoleTable
