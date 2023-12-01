import { useMutation } from '@apollo/client'
import { AddIcon } from '@chakra-ui/icons'
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
  Button,
  Tooltip
} from '@chakra-ui/react'
import { deleteOrgUser } from 'graphQL/Mutation'
import React, { useMemo, useState } from 'react'
import DataTable from 'react-data-table-component'
import { FaEllipsisV } from 'react-icons/fa'
import { getFullDateAndTime, displayPic } from 'utils'
import TeamModal from 'views/Dashboard/Profile/components/TeamModal'
import SearchFilter from 'views/Sbom/components/SearchFilter'

const customStyles = {
  headCells: {
    style: {
      width: '100%',
      fontWeight: 'bold',
      color: '#2D3748',
      fontSize: '12px',
      letterSpacing: '1px'
    }
  },
  subHeader: {
    style: {
      padding: 0,
      margin: 0
    }
  }
}
const TeamTable = ({ data, refetch }) => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const {
    isOpen: isTeamOpen,
    onOpen: onTeamOpen,
    onClose: onTeamClose
  } = useDisclosure()
  const [activeRow, setActiveRow] = useState(null)
  const [teamSearchInput, setTeamSearchInput] = useState('')

  const [deleteUser] = useMutation(deleteOrgUser)

  // COLUMNS
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
        return dateA - dateB // Sort in descending order
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

  // SEARCH COMPONENT
  const handleSearch = () => console.log('hello')

  // CLEAR SERACH
  const handleClear = () => setTeamSearchInput('')

  // HEADER SECTION
  const subHeaderComponent = useMemo(() => {
    return (
      <Flex
        width={'100%'}
        alignItems={'center'}
        justifyContent={'space-between'}
      >
        {/* SEARCH COMPONENTS */}
        <SearchFilter
          id='team'
          filterText={teamSearchInput}
          setFilterText={setTeamSearchInput}
          onFilter={handleSearch}
          onClear={handleClear}
        />

        {/* ADD MEMBER */}
        <Tooltip label='Add Member' placement='top'>
          <IconButton
            onClick={onTeamOpen}
            icon={<AddIcon />}
            colorScheme='blue'
            variant='solid'
            fontWeight='normal'
            fontSize={'sm'}
          />
        </Tooltip>
      </Flex>
    )
  }, [teamSearchInput, handleSearch, handleClear])

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
            defaultSortAsc={false}
            defaultSortFieldId={'joinedDate'}
            subHeader
            subHeaderComponent={subHeaderComponent}
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

      {/* ADD / UPDATE MEMBER */}
      {isTeamOpen && (
        <TeamModal
          refetch={refetch}
          isOpen={isTeamOpen}
          onClose={onTeamClose}
        />
      )}

      {/* REMOVE MEMBER */}
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
