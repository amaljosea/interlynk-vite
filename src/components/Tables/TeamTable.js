import { useMutation } from '@apollo/client'
import {
  Avatar,
  Box,
  Flex,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Portal,
  Stack,
  Text,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Button
} from '@chakra-ui/react'
import { deleteOrgUser } from 'graphQL/Mutation'
import React, { useState } from 'react'
import DataTable from 'react-data-table-component'
import { FaEllipsisV } from 'react-icons/fa'
import { getFullDateAndTime } from 'utils'
import { displayPic } from 'utils'

const customStyles = {
  headCells: {
    style: {
      fontWeight: 'bold',
      color: '#2D3748',
      fontSize: '12px',
      letterSpacing: '1px'
    }
  }
}

const TeamTable = ({ data, refetch }) => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [activeRow, setActiveRow] = useState(null)

  const [deleteUser] = useMutation(deleteOrgUser)

  const columns = [
    // NAME
    {
      id: 'name',
      name: 'NAME',
      selector: (row) => {
        const { name, email } = row
        return (
          <Stack
            width={'100%'}
            px={0}
            py='.8rem'
            direction={'row'}
            alignItems={'flex-center'}
          >
            <Box width={'30px'}>
              <Avatar
                me={{ md: '22px' }}
                src={displayPic(email)}
                w='30px'
                h='30px'
              />
            </Box>
            <Box
              display={'flex'}
              flexWrap={'wrap'}
              flexDirection={'column'}
              gap={1}
            >
              <Text fontSize={'14px'}>{name}</Text>
              <Text color={'#666'}>{email}</Text>
            </Box>
          </Stack>
        )
      },
      width: '300px'
    },
    // AUTH
    {
      id: 'email',
      name: 'EMAIL',
      selector: (row) => row.email
    },
    // ROLE
    {
      id: 'role',
      name: 'ROLE',
      selector: (row) => row.role
    },
    // JOINED DATE
    {
      id: 'joinedDate',
      name: 'DATE JOINED',
      selector: (row) => {
        const { createdAt } = row
        return (
          <Text textTransform={'capitalize'}>
            {getFullDateAndTime(createdAt)}
          </Text>
        )
      },
      sortable: true,
      sortFunction: (a, b) => {
        const dateA = new Date(a.createdAt)
        const dateB = new Date(b.createdAt)
        return dateB - dateA // Sort in descending order
      }
    },
    // ACTION
    {
      id: 'action',
      name: 'ACTION',
      selector: (row) => {
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
                  isDisabled={row.email === data.currentUser.email}
                  onClick={() => {
                    console.log(row)
                    setActiveRow(row)
                    onOpen()
                  }}
                >
                  Remove Member
                </MenuItem>
              </MenuList>
            </Portal>
          </Menu>
        )
      },
      right: 'true'
    }
  ]

  const handleRemove = async () => {
    try {
      await deleteUser({
        variables: {
          id: activeRow.id
        }
      })
        .then((res) => res.data && refetch())
        .finally(() => onClose())
    } catch (error) {
      console.log(`Error`, error)
    }
  }

  return (
    <>
      {data && data.users.length > 0 ? (
        <Flex flexDir={'column'} width={'100%'}>
          <DataTable
            columns={columns}
            data={data.users}
            defaultSortAsc={true}
            defaultSortFieldId={'joinedDate'}
            customStyles={customStyles}
            progressPending={data ? false : true}
            responsive={true}
          />
        </Flex>
      ) : (
        <Flex
          width={'100%'}
          mt={4}
          alignItems={'center'}
          justifyContent={'center'}
        >
          <Text>No team data found</Text>
        </Flex>
      )}

      {isOpen && activeRow && (
        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Remove Member</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Stack direction={'column'} spacing={2} alignItems={'flex-start'}>
                <Text>
                  Are you sure you want to remove the following user from the
                  organization ?
                </Text>
                <Text fontWeight={'semibold'}>
                  {activeRow.name} {`(${activeRow.email})`}
                </Text>
              </Stack>
            </ModalBody>
            <ModalFooter>
              <Button mr={3} onClick={onClose}>
                Cancel
              </Button>
              <Button variant='solid' colorScheme='red' onClick={handleRemove}>
                Remove
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </>
  )
}

export default TeamTable
