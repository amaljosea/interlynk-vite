import { gql, useMutation, useQuery } from '@apollo/client'
import React, { useCallback, useMemo, useState } from 'react'
import DataTable from 'react-data-table-component'
import { customStyles, getFullDateAndTime, timeSince } from 'utils'
import RoleModal from 'views/Dashboard/Profile/components/RoleModal'
import TeamModal from 'views/Dashboard/Profile/components/TeamModal'
import SearchFilter from 'views/Sbom/components/SearchFilter'

import { AddIcon, RepeatIcon } from '@chakra-ui/icons'
import {
  Avatar,
  Badge,
  Button,
  Flex,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Portal,
  Stack,
  Tag,
  TagLabel,
  Text,
  Tooltip,
  useColorModeValue,
  useDisclosure,
  useToast
} from '@chakra-ui/react'

import CustomLoader from 'components/CustomLoader'
import ViewAlert from 'components/Misc/ViewAlert'

import { useGlobalState } from 'hooks/useGlobalState'
import { useHasPermission } from 'hooks/useHasPermission'
import useQueryParam from 'hooks/useQueryParam'

import { InviteUser, deleteOrgUser } from 'graphQL/Mutation'
import { GetUsers } from 'graphQL/Queries'

import { FaEllipsisV } from 'react-icons/fa'

function userTimeStart(row) {
  let timeStart
  if (row.invitationStatus === 'accepted') {
    timeStart = row.invitationAcceptedAt
      ? row.invitationAcceptedAt
      : row.createdAt
  }
  return timeStart
}

const GetCurrentUser = gql`
  query GetCurrentUser {
    organization {
      currentUser {
        email
      }
    }
  }
`

const TeamTable = () => {
  const activetab = useQueryParam('tab')
  const org = localStorage.getItem('organization')
  const { userPermissions } = useGlobalState()

  const headColor = useColorModeValue('#4A5568', '#CBD5E0')
  const textColor = useColorModeValue('#1A202C', '#F7FAFC')

  const { data: orgData } = useQuery(GetCurrentUser, {
    skip: org === 'undefined' ? true : activetab === 'users' ? false : true
  })

  const { currentUser } = orgData?.organization || ''
  const { email } = currentUser || ''

  const {
    data: userData,
    loading,
    refetch
  } = useQuery(GetUsers, {
    skip: org === 'undefined' ? true : activetab === 'users' ? false : true,
    variables: { search: filterText === '' ? undefined : filterText }
  })

  const { users } = userData?.organization || ''

  const viewUsers = useHasPermission({
    parentKey: 'view_users'
  })

  const inviteUser = useHasPermission({
    parentKey: 'view_users',
    childKey: 'invite_users'
  })

  const editUserRole = useHasPermission({
    parentKey: 'view_users',
    childKey: 'edit_user_role'
  })

  const removeUser = useHasPermission({
    parentKey: 'view_users',
    childKey: 'remove_user'
  })

  const toast = useToast()
  const SERVER_URL = process.env.REACT_APP_SERVER
  const { isOpen, onOpen, onClose } = useDisclosure()
  const {
    isOpen: isTeamOpen,
    onOpen: onTeamOpen,
    onClose: onTeamClose
  } = useDisclosure()
  const {
    isOpen: isRoleOpen,
    onOpen: onRoleOpen,
    onClose: onRoleClose
  } = useDisclosure()
  const [activeRow, setActiveRow] = useState(null)
  const [searchInput, setSearchInput] = useState('')
  const [filterText, setFilterText] = useState('')
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
              <Text color={textColor} width={'fit-content'} fontSize={'14px'}>
                {name}
              </Text>
              {row.email === email && (
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
      width: '20%',
      wrap: true
    },
    // AUTH
    {
      id: 'email',
      name: 'EMAIL',
      selector: (row) => (
        <Text color={textColor} my={2}>
          {row?.email}
        </Text>
      ),
      wrap: true,
      width: '20%'
    },
    // ROLE
    {
      id: 'role',
      name: 'ROLE',
      selector: (row) => (
        <Text color={textColor} textTransform={'capitalize'}>
          {row?.role?.name || ''}
        </Text>
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
            width='fit-content'
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
            <TagLabel mx='auto'>
              {invitationStatus?.replace(/_/g, ' ')}
            </TagLabel>
          </Tag>
        )
      }
    },
    // JOINED DATE
    {
      id: 'joinedDate',
      name: 'JOINED',
      selector: (row) => {
        const timeStart = userTimeStart(row)
        return (
          <Tooltip label={getFullDateAndTime(timeStart)} placement={'top'}>
            <Text color={textColor} textTransform={'capitalize'}>
              {timeStart ? timeSince(timeStart) : ''}
            </Text>
          </Tooltip>
        )
      },
      right: 'true',
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
                  isDisabled={row.email === email || !editUserRole}
                  onClick={() => {
                    setActiveRow(row)
                    onRoleOpen()
                  }}
                >
                  Change Role
                </MenuItem>
                <MenuItem
                  isDisabled={row.email === email || !removeUser}
                  onClick={() => {
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
                  invitationStatus === 'invited' ||
                  invitationStatus === 'pending_registration') && (
                  <MenuItem
                    onClick={() => onResendInvite(row)}
                    isDisabled={!inviteUser}
                  >
                    Resend Invite
                  </MenuItem>
                )}
              </MenuList>
            </Portal>
          </Menu>
        )
      },
      right: 'true',
      width: '10%'
    }
  ]

  // CLEAR SERACH
  const handleClear = useCallback(async () => {
    setSearchInput('')
    setFilterText('')
  }, [])

  // ON SEARCH INPUT CHANGE
  const onSearchInputChange = useCallback(
    (e) => {
      const { value } = e.target
      if (value === '') {
        handleClear()
      } else {
        setSearchInput(value)
      }
    },
    [handleClear]
  )

  // SEARCH COMPONENT
  const handleSearch = useCallback(async (event) => {
    const { value } = event.target
    if (event.key === 'Enter') {
      setFilterText(value)
    }
  }, [])

  // HEADER SECTION
  const subHeaderComponent = useMemo(() => {
    return (
      <Flex
        width={'100%'}
        alignItems={'center'}
        justifyContent={'space-between'}
      >
        {/* SEARCH COMPONENTS */}
        <Stack
          width={'100%'}
          direction={'row'}
          spacing={4}
          alignItems={'flex-start'}
        >
          <SearchFilter
            id='team'
            filterText={searchInput}
            onChange={onSearchInputChange}
            onFilter={handleSearch}
            onClear={handleClear}
          />
        </Stack>

        <Stack
          width={'100%'}
          direction={'row'}
          spacing={2}
          justifyContent={'flex-end'}
        >
          {/* INVITE USER */}
          <Tooltip label='Invite User' placement='top'>
            <IconButton
              onClick={onTeamOpen}
              icon={<AddIcon />}
              colorScheme='blue'
              variant='solid'
              fontWeight='normal'
              fontSize={'sm'}
              isDisabled={!inviteUser}
            />
          </Tooltip>

          <Tooltip label='Refresh'>
            <IconButton
              onClick={() => refetch()}
              colorScheme='blue'
              icon={<RepeatIcon />}
            ></IconButton>
          </Tooltip>
        </Stack>
      </Flex>
    )
  }, [
    searchInput,
    onSearchInputChange,
    handleSearch,
    handleClear,
    onTeamOpen,
    inviteUser,
    refetch
  ])

  const handleRemove = async () => {
    await deleteUser({
      variables: {
        userId: activeRow.id
      }
    })
      .then((res) => res.data && refetch())
      .finally(() => onClose())
  }

  const onResendInvite = async (row) => {
    await inviteUsers({
      variables: {
        email: row?.email.toLowerCase(),
        roleId: row?.role?.id
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

  if (viewUsers === false) {
    return <ViewAlert category='user list' />
  }

  return (
    <>
      <Flex flexDir={'column'} width={'100%'}>
        <DataTable
          subHeader
          responsive={true}
          columns={columns}
          data={users || []}
          defaultSortAsc={false}
          progressPending={loading}
          defaultSortFieldId={'joinedDate'}
          progressComponent={<CustomLoader />}
          customStyles={customStyles(headColor)}
          subHeaderComponent={subHeaderComponent}
        />
      </Flex>

      {/* ADD / UPDATE User */}
      {isTeamOpen && (
        <TeamModal
          refetch={refetch}
          isOpen={isTeamOpen}
          onClose={onTeamClose}
          data={currentUser}
        />
      )}

      {/* UPDATE User ROLE */}
      {isRoleOpen && (
        <RoleModal
          data={activeRow}
          refetch={refetch}
          isOpen={isRoleOpen}
          onClose={onRoleClose}
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
