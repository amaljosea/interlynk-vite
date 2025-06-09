import { useMemo } from 'react'
import { getFullDate, timeSince, truncatedValue } from 'utils'

import {
  Avatar,
  Badge,
  Flex,
  Menu,
  MenuItem,
  MenuList,
  Portal,
  Tag,
  TagLabel,
  Text,
  Tooltip
} from '@chakra-ui/react'

import LynkAction from 'components/Misc/LynkAction'

import { useGlobalState } from 'hooks/useGlobalState'
import { useHasPermission } from 'hooks/useHasPermission'
import { useThemeColor } from 'hooks/useThemeColors'

const TeamColumns = ({ action }) => {
  const { organization } = useGlobalState()
  const { primaryTextColor } = useThemeColor(['primaryTextColor'])

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
    childKey: 'delete_user'
  })

  return useMemo(() => {
    const SERVER_URL = process.env.REACT_APP_SERVER
    const { currentUser } = organization || {}
    const { email } = currentUser || {}

    const userTimeStart = (row) => {
      let timeStart
      if (row.invitationStatus === 'accepted') {
        timeStart = row.invitationAcceptedAt
          ? row.invitationAcceptedAt
          : row.createdAt
      }
      return timeStart
    }

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
              sx={{
                w: '100%',
                px: 0,
                py: '.8rem',
                gap: 2,
                alignItems: 'center'
              }}
            >
              <Avatar
                size={'sm'}
                name={row?.name || 'User'}
                src={profileImage && `${SERVER_URL}/${profileImage?.url}`}
              />
              <Text fontSize={14} color={primaryTextColor} my={2}>
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
              sx={{ fontSize: 14, w: 'fit-content' }}
            >
              {row.name ? truncatedValue(row.name, 20) : 'N/A'}
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
          <Text
            fontSize={14}
            color={primaryTextColor}
            textTransform={'capitalize'}
          >
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
              <Text
                fontSize={14}
                color={primaryTextColor}
                textTransform={'capitalize'}
              >
                {timeStart ? timeSince(timeStart) : ''}
              </Text>
            </Tooltip>
          )
        },
        center: 'true',
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
                    onClick={() => action('change_role', row)}
                  >
                    Change Role
                  </MenuItem>
                  <MenuItem
                    isDisabled={row.email === email || !removeUser}
                    onClick={() => action('revoke_invitation', row)}
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
                      onClick={() => action('resend_invite', row)}
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

    return columns
  }, [
    action,
    editUserRole,
    inviteUser,
    organization,
    primaryTextColor,
    removeUser
  ])
}

export default TeamColumns
