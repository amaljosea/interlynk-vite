import { Button, Flex, Text, Tooltip, useDisclosure } from '@chakra-ui/react'
import { timeSince, customStyles, getFullDateAndTime } from 'utils'
import PermissionDrawer from 'components/Drawer/PermissionDrawer'
import DataTable from 'react-data-table-component'
import { useState } from 'react'

const RoleTable = ({ data, refetch }) => {
  const [activeRow, setActiveRow] = useState(null)
  const { isOpen, onOpen, onClose } = useDisclosure()

  const columns = [
    // NAME
    {
      id: 'name',
      name: 'NAME',
      selector: (row) => <Text textTransform={'capitalize'} my={2}>{row?.name}</Text>,
      wrap: true
    },
    // CREATED AT
    {
      id: 'createdAt',
      name: 'CREATED AT',
      selector: (row) => (
        <Tooltip label={getFullDateAndTime(row?.createdAt)} placement='top'>
          <Text textTransform={'lowercase'}>{timeSince(row?.createdAt)}</Text>
        </Tooltip>
      )
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
            setActiveRow(row)
            onOpen()
          }}
        >
          Permissions
        </Button>
      )
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
        <PermissionDrawer isOpen={isOpen} onClose={onClose} data={activeRow} refetch={refetch} />
      )}
    </>
  )
}

export default RoleTable
