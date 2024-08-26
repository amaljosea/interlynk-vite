import { gql, useMutation, useQuery } from '@apollo/client'
import React, { useCallback, useMemo, useState } from 'react'
import DataTable from 'react-data-table-component'
import { customStyles, getFullDateAndTime, timeSince } from 'utils'
import RoleModal from 'views/Dashboard/Profile/components/RoleModal'
import TeamModal from 'views/Dashboard/Profile/components/TeamModal'
import SearchFilter from 'views/Sbom/components/SearchFilter'

import { AddIcon } from '@chakra-ui/icons'
import {
  Avatar,
  Badge,
  Box,
  Flex,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Portal,
  Stack,
  Tag,
  TagLabel,
  Text,
  Tooltip,
  useColorModeValue,
  useDisclosure
} from '@chakra-ui/react'

import CustomLoader from 'components/CustomLoader'
import RefreshBtn from 'components/Icons/RefreshBtn'
import LynkModal from 'components/LynkModal'

import useCustomToast from 'hooks/useCustomToast'
import { useGlobalQueryContext } from 'hooks/useGlobalQueryContext'
import { useHasPermission } from 'hooks/useHasPermission'
import useQueryParam from 'hooks/useQueryParam'

import { InviteUser, deleteOrgUser } from 'graphQL/Mutation'
import { GetUsers } from 'graphQL/Queries'

import { BiTrash } from 'react-icons/bi'
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
        role {
          id
        }
      }
    }
  }
`

const TeamTable = () => {
  const activetab = useQueryParam('tab')
  const { orgView, isFreeTier } = useGlobalQueryContext()

  const headColor = useColorModeValue('#4A5568', '#CBD5E0')
  const textColor = useColorModeValue('#1A202C', '#F7FAFC')

  const { data: orgData } = useQuery(GetCurrentUser, {
    skip: !orgView ? true : activetab === 'users' ? false : true
  })

  const { currentUser } = orgData?.organization || ''
  const { email } = currentUser || ''

  const { data: userData, loading } = useQuery(GetUsers, {
    skip: !orgView ? true : activetab === 'users' ? false : true,
    variables: { search: filterText === '' ? undefined : filterText }
  })

  console.log(userData?.organization?.users)
  console.log(isFreeTier)
  const numberOfUsers = userData?.organization?.users.length

  const { users } = userData?.organization || ''

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

  const { showToast } = useCustomToast()
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

  const [inviteUsers] = useMutation(InviteUser)

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
          <Box position='relative'>
            <Tooltip
              label={
                isFreeTier && numberOfUsers === 5
                  ? 'Limit reached for free tier'
                  : 'Invite User'
              }
              placement='bottom'
              isDisabled={false} // Ensure the tooltip is never disabled
            >
              <Box>
                <IconButton
                  onClick={onTeamOpen}
                  icon={<AddIcon />}
                  colorScheme='blue'
                  variant='solid'
                  fontWeight='normal'
                  fontSize={'sm'}
                  isDisabled={
                    !inviteUser || (isFreeTier && numberOfUsers === 5)
                  }
                />
              </Box>
            </Tooltip>
          </Box>
          <RefreshBtn />
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
    isFreeTier,
    numberOfUsers
  ])

  const handleRemove = async () => {
    await deleteUser({
      variables: {
        userId: activeRow.id
      }
    })
      .then((res) => res.data)
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
        showToast({
          description: res.data.organizationUserInvite.errors[0],
          status: 'error'
        })
      } else {
        showToast({
          description: 'Invitation sent successfully',
          status: 'success'
        })
      }
    })
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
          data={currentUser}
          isOpen={isTeamOpen}
          onClose={onTeamClose}
          changeRole={editUserRole}
        />
      )}

      {/* UPDATE User ROLE */}
      {isRoleOpen && (
        <RoleModal data={activeRow} isOpen={isRoleOpen} onClose={onRoleClose} />
      )}

      {/* REMOVE User */}
      {isOpen && activeRow && (
        <LynkModal
          isOpen={isOpen}
          onClose={onClose}
          onSubmit={handleRemove}
          title={'Remove User'}
          Icon={BiTrash}
          buttonText='Remove'
          buttonColor='red'
        >
          <Stack
            direction={'column'}
            gap={2}
            spacing={2}
            alignItems={'flex-start'}
          >
            <Text fontWeight={300} fontSize={16} lineHeight={'30px'}>
              Are you sure you want to remove the following user from the
              organization ?
            </Text>
            <Text
              fontWeight={500}
              fontSize={16}
              lineHeight={'30px'}
              wordBreak={'break-all'}
            >
              {activeRow.name} {`(${activeRow.email})`}
            </Text>
          </Stack>
        </LynkModal>
      )}
    </>
  )
}

export default TeamTable
