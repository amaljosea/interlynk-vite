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
  Stack,
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
  const { primaryTextColor, secondaryTextColor } = useThemeColor([
    'primaryTextColor',
    'secondaryTextColor'
  ])

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
    const SERVER_URL = import.meta.env.VITE_SERVER
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
        id: 'user',
        name: 'USER',
        selector: (row) => {
          const { profileImage } = row
          return (
            <Flex gap={3} my={4} alignItems={'center'}>
              <Avatar
                size={'sm'}
                name={row?.name || 'User'}
                src={profileImage && `${SERVER_URL}/${profileImage?.url}`}
              />
              <Stack spacing={1}>
                <Flex
                  gap={row?.name !== '' ? 2 : 0}
                  sx={{ alignItems: 'center' }}
                >
                  <Text
                    color={primaryTextColor}
                    sx={{ fontSize: 14, w: 'fit-content' }}
                  >
                    {row.name ? truncatedValue(row.name, 20) : 'N/A'}
                  </Text>
                  {row.email === email && (
                    <Badge variant='outline' colorScheme='blue'>
                      You
                    </Badge>
                  )}
                </Flex>
                <Text fontSize={14} color={secondaryTextColor}>
                  {row?.email}
                </Text>
              </Stack>
            </Flex>
          )
        },
        width: '40%',
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
        width: '10%'
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
        width: '13%'
      },
      {
        id: 'joinedDate',
        name: 'JOINED',
        selector: (row) => {
          const timeStart = userTimeStart(row)
          return (
            <Tooltip label={getFullDate(timeStart)} placement={'top'}>
              <Text fontSize={14} color={primaryTextColor}>
                {timeStart ? timeSince(timeStart) : 'N/A'}
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
        },
        right: 'true',
        width: '16%'
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
    removeUser,
    secondaryTextColor
  ])
}

export default TeamColumns
