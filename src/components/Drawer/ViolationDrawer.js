import DataTable from 'react-data-table-component'
import { customStyles } from 'utils'

import {
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Text
} from '@chakra-ui/react'

import CustomLoader from 'components/CustomLoader'

const ViolationDrawer = ({ data, isOpen, onClose }) => {
  console.log(data)
  // COLUMNS
  const columns = [
    {
      id: 'SUBJECT',
      name: 'SUBJECT',
      selector: (row) => <Text>{row?.policyRule?.subject || ''}</Text>,
      wrap: true
    },
    {
      id: 'OPERATOR',
      name: 'OPERATOR',
      selector: (row) => <Text>{row?.policyRule?.operator || ''}</Text>,
      wrap: true
    },
    {
      id: 'VALUE',
      name: 'VALUE',
      selector: (row) => <Text>{row?.policyRule?.value || ''}</Text>,
      wrap: true
    },
    {
      id: 'VIOLATION_TYPE',
      name: 'VIOLATION TYPE',
      selector: (row) => <Text>{row?.violationType || ''}</Text>,
      wrap: true
    }
  ]

  return (
    <Drawer size='xl' isOpen={isOpen} placement='right' onClose={onClose}>
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader>Violations List</DrawerHeader>
        <DrawerBody>
          <DataTable
            columns={columns}
            data={data?.nodes || []}
            customStyles={customStyles}
            progressPending={data ? false : true}
            progressComponent={<CustomLoader />}
            persistTableHead
            responsive={true}
          />
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  )
}

export default ViolationDrawer
