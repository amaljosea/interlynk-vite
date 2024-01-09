import { useMutation } from '@apollo/client'
import { AddIcon } from '@chakra-ui/icons'
import {
  Avatar,
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
  Tooltip,
  Tag,
  useToast,
  TagLabel,
  Badge
} from '@chakra-ui/react'
import { InviteUser, deleteOrgUser } from 'graphQL/Mutation'
import React, { useMemo, useState } from 'react'
import DataTable from 'react-data-table-component'
import { FaEllipsisV } from 'react-icons/fa'
import { getFullDateAndTime, timeSince, customStyles } from 'utils'
import TeamModal from 'views/Dashboard/Profile/components/TeamModal'
import SearchFilter from 'views/Sbom/components/SearchFilter'

function userTimeStart(row) {
  let timeStart
  if (row.invitationStatus === 'accepted') {
    timeStart = row.invitationAcceptedAt
      ? row.invitationAcceptedAt
      : row.createdAt
  }
  return timeStart
}

const TeamTable = ({ data, refetch }) => {
  const toast = useToast()
  const SERVER_URL = process.env.REACT_APP_SERVER
  const { isOpen, onOpen, onClose } = useDisclosure()
  const {
    isOpen: isTeamOpen,
    onOpen: onTeamOpen,
    onClose: onTeamClose
  } = useDisclosure()
  const [activeRow, setActiveRow] = useState(null)
  const [searchInput, setSearchInput] = useState('')

  const [deleteUser] = useMutation(deleteOrgUser)

  const [inviteUsers] = useMutation(InviteUser, {
    onCompleted: () => refetch()
  })

  // COLUMNS
  const columns = [
    // NAME
    {
      id: 'name',
      name: 'NAME',
      selector: (row) => {
        const { name, profileImage } = row
        return (
          <Flex
            width={'100%'}
            px={0}
            py='.8rem'
            direction={'row'}
            alignItems={'center'}
            justifyContent={'center'}
            gap={2}
          >
            <Avatar
              src={profileImage && `${SERVER_URL}/${profileImage?.url}`}
              w='30px'
              h='30px'
            />
            <Stack
              spacing={name !== '' ? 2 : 0}
              direction={'row'}
              alignItems={'center'}
            >
              <Text width={'fit-content'} fontSize={'14px'}>
                {name}
              </Text>
              {row.email === data.currentUser.email && (
                <Badge
                  variant='outline'
                  colorScheme='blue'
                  py={1}
                  px={2}
                  borderRadius={4}
                >
                  You
                </Badge>
              )}
            </Stack>
          </Flex>
        )
      },
      width: '300px',
      wrap: true
    },
    // AUTH
    {
      id: 'email',
      name: 'EMAIL',
      selector: (row) => <Text my={2}>{row?.email}</Text>,
      wrap: true
    },
    // ROLE
    {
      id: 'role',
      name: 'ROLE',
      selector: (row) => (
        <Text textTransform={'lowercase'}>{row?.role?.name}</Text>
      )
    },
    // STATUS
    {
      id: 'status',
      name: 'STATUS',
      selector: (row) => {
        const { invitationStatus } = row
        return (
          <Tag
            width='100px'
            variant='subtle'
            colorScheme={
              invitationStatus === 'invited'
                ? 'orange'
                : invitationStatus === 'accepted'
                  ? 'green'
                  : invitationStatus === 'declined'
                    ? 'red'
                    : 'blue'
            }
            textTransform={'capitalize'}
          >
            <TagLabel mx='auto'>{invitationStatus}</TagLabel>
          </Tag>
        )
      }
    },
    // JOINED DATE
    {
      id: 'joinedDate',
      name: 'DATE JOINED',
      selector: (row) => {
        const { invitationStatus } = row
        const { invitationAcceptedAt } = row
        const { createdAt } = row
        const timeStart = userTimeStart(row)
        return (
          <Tooltip label={getFullDateAndTime(timeStart)} placement={'top'}>
            <Text textTransform={'capitalize'}>
              {timeStart ? timeSince(timeStart) : ''}
            </Text>
          </Tooltip>
        )
      },
      sortable: true,
      sortFunction: (a, b) => {
        const aUserStart = userTimeStart(a)
        const bUserStart = userTimeStart(b)
        if (!aUserStart && !bUserStart) return 0
        if (!aUserStart) return 1
        if (!bUserStart) return -1
        const dateA = new Date(aUserStart)
        const dateB = new Date(bUserStart)
        return dateA - dateB // Sort in descending order
      }
    },
    // ACTION
    {
      id: 'action',
      name: 'ACTION',
      selector: (row) => {
        const { invitationStatus } = row
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
                  {invitationStatus === 'declined' ||
                  invitationStatus === 'invited'
                    ? 'Revoke Invitation'
                    : 'Remove User'}
                </MenuItem>
                {(invitationStatus === 'declined' ||
                  invitationStatus === 'invited') && (
                  <MenuItem onClick={() => onResendInvite(row)}>
                    Resend Invite
                  </MenuItem>
                )}
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
  const handleClear = () => setSearchInput('')

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
          filterText={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onFilter={handleSearch}
          onClear={handleClear}
        />

        {/* ADD USER */}
        <Tooltip label='Invite User' placement='top'>
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
  }, [searchInput, handleSearch, handleClear])

  const handleRemove = async () => {
    try {
      await deleteUser({
        variables: {
          userId: activeRow.id
        }
      })
        .then((res) => res.data && refetch())
        .finally(() => onClose())
    } catch (error) {
      console.log(`Error`, error)
    }
  }

  const onResendInvite = async (row) => {
    await inviteUsers({
      variables: {
        email: row?.email.toLowerCase()
      }
    }).then((res) => {
      if (res.data.organizationUserInvite.errors.length > 0) {
        toast({
          description: res.data.organizationUserInvite.errors[0],
          status: 'error',
          position: 'top',
          duration: 2000
        })
      } else {
        toast({
          description: 'Invitation sent successfully',
          status: 'success',
          position: 'top',
          duration: 2000
        })
      }
    })
  }

  return (
    <>
      {data ? (
        <Flex flexDir={'column'} width={'100%'}>
          <DataTable
            columns={columns}
            data={data.users || []}
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

      {/* ADD / UPDATE User */}
      {isTeamOpen && (
        <TeamModal
          refetch={refetch}
          isOpen={isTeamOpen}
          onClose={onTeamClose}
        />
      )}
      {/* REMOVE User */}
      {isOpen && activeRow && (
        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Remove User</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Stack direction={'column'} spacing={2} alignItems={'flex-start'}>
                <Text>
                  Are you sure you want to remove the following user from the
                  organization ?
                </Text>
                <Text fontWeight={'semibold'} wordBreak={'break-all'}>
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
