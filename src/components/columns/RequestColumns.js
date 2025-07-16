import { useMemo } from 'react'
import { getFullDate, timeSince } from 'utils'
import { getStatusColor } from 'utils/styleUtils'

import {
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

import { useHasPermission } from 'hooks/useHasPermission'
import { useThemeColor } from 'hooks/useThemeColors'

const RequestColumns = ({ action }) => {
  const addReq = useHasPermission({
    parentKey: 'view_requests',
    childKey: 'edit_requests'
  })

  const { primaryErrorColor, primaryTextColor } = useThemeColor([
    'primaryErrorColor',
    'primaryTextColor'
  ])

  return useMemo(() => {
    const columns = [
      {
        id: 'EMAIL',
        name: 'EMAIL',
        selector: (row) => (
          <Text fontSize={14} color={primaryTextColor} data-testid='request_id'>
            {row?.email}
          </Text>
        ),
        wrap: true
      },
      {
        id: 'PRODUCT',
        name: 'PRODUCT',
        selector: (row) => {
          return (
            <Stack my={4}>
              <Text fontSize={14} color={primaryTextColor}>
                {row?.productName}
              </Text>
              <Text color={primaryTextColor}>
                {row?.productVersion || 'N/A'}
              </Text>
            </Stack>
          )
        },
        wrap: true
      },
      {
        id: 'REQUESTED',
        name: 'REQUESTED',
        selector: (row) => (
          <Tooltip label={getFullDate(row?.requestedAt)} placement={'top'}>
            <Text fontSize={14} color={primaryTextColor}>
              {timeSince(row?.requestedAt)}
            </Text>
          </Tooltip>
        ),
        wrap: true
      },
      {
        id: 'RESPONDED',
        name: 'RESPONDED',
        selector: (row) => {
          const { uploadedAt } = row
          if (!uploadedAt)
            return (
              <Text fontSize={14} color={primaryTextColor}>
                N/A
              </Text>
            )
          return (
            <Tooltip placement={'top'} label={getFullDate(uploadedAt)}>
              <Text fontSize={14} color={primaryTextColor}>
                {timeSince(uploadedAt)}
              </Text>
            </Tooltip>
          )
        },
        wrap: true
      },
      {
        id: 'STATUS',
        name: 'STATUS',
        selector: (row) => (
          <Tag colorScheme={getStatusColor(row?.status)} width={'100px'}>
            <TagLabel mx={'auto'}>{row?.status}</TagLabel>
          </Tag>
        ),
        width: '10%',
        wrap: true
      },
      {
        id: 'ACTION',
        name: 'ACTION',
        selector: (row) => {
          const { email, blob, status } = row
          const disabled =
            !addReq || blob || status === 'Canceled' || status === 'Declined'
          return (
            <Menu>
              <LynkAction aria-label={`req action for ${row?.email}`} />
              <Portal>
                <MenuList fontSize={'sm'}>
                  <MenuItem
                    hidden={status === 'Accepted'}
                    isDisabled={!blob || !addReq}
                    onClick={() => action('accept', row)}
                  >
                    Accept
                  </MenuItem>
                  <MenuItem
                    isDisabled={!addReq}
                    aria-label={`resend req ${email}`}
                    onClick={() => action('resend', row)}
                  >
                    Resend
                  </MenuItem>
                  <MenuItem
                    isDisabled={disabled}
                    color={primaryErrorColor}
                    aria-label={`cancel req ${email}`}
                    onClick={() => action('cancel', row)}
                  >
                    Cancel
                  </MenuItem>
                </MenuList>
              </Portal>
            </Menu>
          )
        },
        right: 'true'
      }
    ]

    return columns
  }, [action, addReq, primaryErrorColor, primaryTextColor])
}

export default RequestColumns
