import { useMutation, useQuery } from '@apollo/client'
import React, { useCallback, useMemo, useState } from 'react'
import DataTable from 'react-data-table-component'
import { getFullDate, timeSince } from 'utils'
import { customStyles } from 'utils/styleUtils'
import { FREE_TIER_USER_LIMIT } from 'variables/general'
import ExportCsv from 'views/Dashboard/Products/components/ExportCsv'
import RoleModal from 'views/Dashboard/Profile/components/RoleModal'
import TeamModal from 'views/Dashboard/Profile/components/TeamModal'
import SearchFilter from 'views/Sbom/components/SearchFilter'

import {
  Avatar,
  Badge,
  Box,
  Flex,
  Menu,
  MenuItem,
  MenuList,
  Portal,
  Stack,
  Tag,
  TagLabel,
  Text,
  Tooltip,
  useDisclosure
} from '@chakra-ui/react'

import CustomLoader from 'components/CustomLoader'
import AddButton from 'components/Icons/AddButton'
import RefreshBtn from 'components/Icons/RefreshBtn'
import LynkModal from 'components/LynkModal'
import LynkAction from 'components/Misc/LynkAction'

import useCustomToast from 'hooks/useCustomToast'
import { useGlobalState } from 'hooks/useGlobalState'
import { useHasPermission } from 'hooks/useHasPermission'
import useQueryParam from 'hooks/useQueryParam'
import { useRouteFlags } from 'hooks/useRouteFlags'
import { useThemeColor } from 'hooks/useThemeColors'

import { InviteUser, deleteOrgUser } from 'graphQL/Mutation'
import { GetUsers } from 'graphQL/Queries'

import { BiTrash } from 'react-icons/bi'

function userTimeStart(row) {
  let timeStart
  if (row.invitationStatus === 'accepted') {
    timeStart = row.invitationAcceptedAt
      ? row.invitationAcceptedAt
      : row.createdAt
  }
  return timeStart
}

const TeamTable = () => {
  const activetab = useQueryParam('tab')
  const { isCustomerView } = useRouteFlags()
  const { showToast } = useCustomToast()
  const { organization } = useGlobalState()
  const SERVER_URL = process.env.REACT_APP_SERVER

  const { headingTextColor, primaryTextColor } = useThemeColor([
    'headingTextColor',
    'primaryTextColor'
  ])
  const paddingCell = 0
  const paddingHeadCell = 0

  const { tier, currentUser } = organization || ''
  const { email } = currentUser || ''
  const isFreeTier = tier === 'free'

  const USER = useDisclosure()
  const TEAM = useDisclosure()
  const ROLE = useDisclosure()

  const [activeRow, setActiveRow] = useState(null)
  const [searchInput, setSearchInput] = useState('')
  const [filterText, setFilterText] = useState('')
  const [deleteUser] = useMutation(deleteOrgUser)

  const [inviteUsers] = useMutation(InviteUser)

  const { data: userData, loading } = useQuery(GetUsers, {
    skip: !organization ? true : activetab === 'users' ? false : true,
    variables: { search: filterText === '' ? undefined : filterText }
  })

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

  // COLUMNS
  const columns = [
    {
      id: 'email',
      name: 'EMAIL',
      selector: (row) => {
        const { profileImage } = row
        return (
          <Flex
            justifyContent={'center'}
            sx={{ w: '100%', px: 0, py: '.8rem', gap: 2, alignItems: 'center' }}
          >
            <Avatar
              sx={{ w: '30px', h: '30px' }}
              src={profileImage && `${SERVER_URL}/${profileImage?.url}`}
            />
            <Text color={primaryTextColor} my={2}>
              {row?.email}
            </Text>
          </Flex>
        )
      },
      width: '32%',
      wrap: true
    },
    {
      id: 'name',
      name: 'NAME',
      selector: (row) => (
        <Flex gap={row.name !== '' ? 2 : 0} sx={{ alignItems: 'center' }}>
          <Text
            color={primaryTextColor}
            sx={{ fontSize: '14px', w: 'fit-content' }}
          >
            {row.name}
          </Text>
          {row.email === email && (
            <Badge
              variant='outline'
              colorScheme='blue'
              sx={{ py: 1, px: 2, borderRadius: 4 }}
            >
              You
            </Badge>
          )}
        </Flex>
      ),
      width: '21%',
      wrap: true
    },
    {
      id: 'role',
      name: 'ROLE',
      selector: (row) => (
        <Text color={primaryTextColor} textTransform={'capitalize'}>
          {row?.role?.name || ''}
        </Text>
      ),
      width: '8%'
    },
    {
      id: 'joinedDate',
      name: 'JOINED',
      selector: (row) => {
        const timeStart = userTimeStart(row)
        return (
          <Tooltip label={getFullDate(timeStart)} placement={'top'}>
            <Text color={primaryTextColor} textTransform={'capitalize'}>
              {timeStart ? timeSince(timeStart) : ''}
            </Text>
          </Tooltip>
        )
      },
      center: true,
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
      },
      width: '16%'
    },
    {
      id: 'status',
      name: 'STATUS',
      selector: (row) => {
        const { invitationStatus } = row
        return (
          <Tag
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
            sx={{ w: 'fit-content', textTransform: 'capitalize' }}
          >
            <TagLabel mx='auto'>
              {invitationStatus?.replace(/_/g, ' ')}
            </TagLabel>
          </Tag>
        )
      },
      center: true,
      width: '13%'
    },
    {
      id: 'action',
      name: 'ACTION',
      selector: (row) => {
        const { invitationStatus } = row
        return (
          <Menu>
            <LynkAction />
            <Portal>
              <MenuList fontSize={'sm'}>
                <MenuItem
                  isDisabled={row.email === email || !editUserRole}
                  onClick={() => {
                    setActiveRow(row)
                    ROLE.onOpen()
                  }}
                >
                  Change Role
                </MenuItem>
                <MenuItem
                  isDisabled={row.email === email || !removeUser}
                  onClick={() => {
                    setActiveRow(row)
                    USER.onOpen()
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
      right: 'true'
    }
  ]

  // CLEAR SEARCH
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
      <Flex w={'100%'} alignItems={'center'} justifyContent={'space-between'}>
        {/* SEARCH COMPONENTS */}
        <SearchFilter
          id='team'
          onClear={handleClear}
          onFilter={handleSearch}
          filterText={searchInput}
          onChange={onSearchInputChange}
        />

        <Flex sx={{ gap: 2, justifyContent: 'flex-end' }}>
          {/* EXPORT CSV */}
          {!isCustomerView && (
            <ExportCsv
              tableType='Users'
              filters={{
                search: searchInput !== '' ? searchInput : undefined
              }}
            />
          )}
          {/* INVITE USER */}
          <Box position='relative'>
            <Tooltip
              label={
                isFreeTier && numberOfUsers >= FREE_TIER_USER_LIMIT
                  ? 'Limit reached for free tier'
                  : 'Invite User'
              }
              placement='bottom'
              isDisabled={false} // Ensure the tooltip is never disabled
            >
              <Box>
                <AddButton
                  onClick={TEAM.onOpen}
                  isDisabled={
                    !inviteUser ||
                    (isFreeTier && numberOfUsers >= FREE_TIER_USER_LIMIT)
                  }
                />
              </Box>
            </Tooltip>
          </Box>
          <RefreshBtn />
        </Flex>
      </Flex>
    )
  }, [
    handleClear,
    handleSearch,
    searchInput,
    onSearchInputChange,
    isFreeTier,
    numberOfUsers,
    TEAM.onOpen,
    inviteUser,
    isCustomerView
  ])

  const handleRemove = async () => {
    await deleteUser({
      variables: {
        userId: activeRow.id
      }
    })
      .then((res) => res.data)
      .finally(() => USER.onClose())
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
      <DataTable
        subHeader
        responsive={true}
        columns={columns}
        data={users || []}
        defaultSortAsc={false}
        progressPending={loading}
        defaultSortFieldId={'joinedDate'}
        progressComponent={<CustomLoader />}
        customStyles={customStyles(
          headingTextColor,
          null,
          paddingCell,
          paddingHeadCell
        )}
        subHeaderComponent={subHeaderComponent}
      />

      {/* ADD / UPDATE User */}
      {TEAM.isOpen && (
        <TeamModal
          data={currentUser}
          isOpen={TEAM.isOpen}
          onClose={TEAM.onClose}
          changeRole={editUserRole}
        />
      )}

      {/* UPDATE User ROLE */}
      {ROLE.isOpen && (
        <RoleModal
          data={activeRow}
          isOpen={ROLE.isOpen}
          onClose={ROLE.onClose}
        />
      )}

      {/* REMOVE User */}
      {USER.isOpen && activeRow && (
        <LynkModal
          isOpen={USER.isOpen}
          onClose={USER.onClose}
          onSubmit={handleRemove}
          title={'Remove User'}
          Icon={BiTrash}
          buttonText='Remove'
          buttonColor='red'
        >
          <Stack
            spacing={2}
            sx={{ gap: 2, direction: 'column', alignItems: 'flex-start' }}
          >
            <Text fontWeight={300} fontSize={16} lineHeight={'30px'}>
              Are you sure you want to remove the following user from the
              organization ?
            </Text>
            <Text
              sx={{
                fontSize: 16,
                fontWeight: 500,
                lineHeight: '30px',
                wordBreak: 'break-all'
              }}
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
