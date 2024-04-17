import { useMutation } from '@apollo/client'
import React, { useMemo, useState } from 'react'
import DataTable from 'react-data-table-component'
import { customStyles } from 'utils'
import { getFullDateAndTime } from 'utils'
import { timeSince } from 'utils'
import LegalModal from 'views/Dashboard/Profile/components/LegalModal'

import {
  Flex,
  IconButton,
  List,
  ListIcon,
  ListItem,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Portal,
  Text,
  Tooltip,
  useDisclosure,
  useToast
} from '@chakra-ui/react'

import CustomLoader from 'components/CustomLoader'

import { useGlobalState } from 'hooks/useGlobalState'

import { OrganizationManufacturerDelete } from 'graphQL/Mutation'

import { FaEllipsisVertical, FaPlus } from 'react-icons/fa6'
import { MdCheckCircle } from 'react-icons/md'

const LegalTable = ({ data, refetch }) => {
  const toast = useToast()
  const { totalRows } = useGlobalState()
  const [activeRow, setActiveRow] = useState(null)
  const { isOpen, onOpen, onClose } = useDisclosure()

  const [deleteMfc] = useMutation(OrganizationManufacturerDelete)

  const handleDelete = async (id) => {
    await deleteMfc({
      variables: {
        id
      }
    }).then((res) => {
      const errors = res?.data?.organizationManufacturerDelete?.errors
      if (errors?.length > 0) {
        toast({
          description: errors[0],
          status: 'error',
          duration: 2000,
          position: 'top'
        })
      } else {
        refetch({ first: totalRows })
      }
    })
  }

  // SUB HEADER
  const subHeader = useMemo(() => {
    return (
      <Flex width={'100%'} alignItems={'center'} justifyContent={'flex-end'}>
        <Tooltip label='Add Manufacturer'>
          <IconButton
            size='sm'
            colorScheme='blue'
            onClick={() => {
              setActiveRow(null)
              onOpen()
            }}
            icon={<FaPlus size={20} />}
          />
        </Tooltip>
      </Flex>
    )
  }, [onOpen])

  // COLUMNS
  const columns = [
    // ORGANIZATION NAME
    {
      id: 'ORG_NAME',
      name: 'ORGANIZATION NAME',
      selector: (row) => (
        <Text textTransform={'capitalize'}>{row?.organizationName}</Text>
      ),
      width: '400px',
      wrap: true
    },
    // URL
    {
      id: 'URL',
      name: 'URL',
      selector: (row) => <Text>{row?.url}</Text>,
      width: '250px',
      wrap: true
    },
    // CONTACTS
    {
      id: 'CONTACTS',
      name: 'CONTACTS',
      selector: (row) => {
        const { organizationContacts } = row
        const totalContacts =
          organizationContacts?.length > 1 && organizationContacts.slice(1)
        return (
          <List my={4}>
            {organizationContacts?.map((item) => (
              <Tooltip
                key={item?.id}
                placement='top'
                label={`${item?.email ? `[${item?.email}]` : ''} ${item?.phone ? `-[${item?.phone}]` : ''}`}
              >
                <ListItem py={1} as={Flex} alignItems='center' cursor='pointer'>
                  <ListIcon as={MdCheckCircle} color='blue.500' />
                  <Text>{item?.name}</Text>
                </ListItem>
              </Tooltip>
            ))}
          </List>
        )
      },
      wrap: true
    },
    // CREATED AT
    {
      id: 'CREATED_AT',
      name: 'CREATED',
      selector: (row) => {
        const { createdAt } = row
        return (
          <Tooltip label={getFullDateAndTime(createdAt)} placement='top'>
            <Text>{timeSince(createdAt)}</Text>
          </Tooltip>
        )
      },
      right: 'false',
      sortable: false,
      sortFunction: (a, b) => {
        const dateA = new Date(a.createdAt)
        const dateB = new Date(b.createdAt)
        return dateA - dateB
      }
    },
    // UPDATED AT
    {
      id: 'UPDATED_AT',
      name: 'UPDATED',
      selector: (row) => {
        const { updatedAt } = row
        return (
          <Tooltip label={getFullDateAndTime(updatedAt)} placement='top'>
            <Text>{timeSince(updatedAt)}</Text>
          </Tooltip>
        )
      },
      sortable: true,
      sortFunction: (a, b) => {
        const dateA = new Date(a.updatedAt)
        const dateB = new Date(b.updatedAt)
        return dateA - dateB
      },
      right: 'true'
    },
    // ACTIONS
    {
      id: 'ACTION',
      name: 'ACTION',
      selector: (row) => {
        return (
          <Menu>
            <MenuButton
              as={IconButton}
              icon={<FaEllipsisVertical />}
              variant='none'
              color='gray.400'
            />
            <Portal>
              <MenuList fontSize={'sm'}>
                <MenuItem
                  onClick={() => {
                    setActiveRow(row)
                    onOpen()
                  }}
                >
                  Update Manufacturer
                </MenuItem>
                <MenuItem
                  color={'red.500'}
                  onClick={() => handleDelete(row?.id)}
                >
                  Archive Manufacturer
                </MenuItem>
              </MenuList>
            </Portal>
          </Menu>
        )
      },
      right: 'true'
    }
  ]

  return (
    <>
      <Flex flexDir={'column'} width={'100%'}>
        <DataTable
          columns={columns}
          data={data?.nodes || []}
          customStyles={customStyles}
          progressPending={data ? false : true}
          progressComponent={<CustomLoader />}
          subHeader
          subHeaderComponent={subHeader}
          persistTableHead
          responsive={true}
        />
      </Flex>

      {isOpen && (
        <LegalModal
          data={activeRow}
          isOpen={isOpen}
          onClose={onClose}
          refetch={refetch}
        />
      )}
    </>
  )
}

export default LegalTable
