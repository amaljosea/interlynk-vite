import { useMemo } from 'react'
import { getFullDate, truncatedValue } from 'utils'

import {
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

import { useThemeColor } from 'hooks/useThemeColors'

const SecurityTokenColumns = ({ action }) => {
  const { primaryTextColor } = useThemeColor(['primaryTextColor'])

  return useMemo(() => {
    const columns = [
      {
        id: 'name',
        name: 'TOKEN NAME',
        wrap: true,
        selector: (row) => (
          <Tooltip label={row?.tokenName} placement='top'>
            <Text color={primaryTextColor} my={2}>
              {truncatedValue(row?.tokenName, 30)}
            </Text>
          </Tooltip>
        )
      },
      {
        id: 'tokenMask',
        name: 'TOKEN MASK',
        selector: (row) => (
          <Text color={primaryTextColor} my={2}>
            {row.tokenMask}
          </Text>
        ),
        wrap: true
      },
      {
        id: 'created',
        name: 'CREATED',
        selector: (row) => (
          <Text color={primaryTextColor}>{getFullDate(row.createdAt)}</Text>
        ),
        sortable: true,
        sortFunction: (a, b) => {
          const dateA = new Date(a.createdAt)
          const dateB = new Date(b.createdAt)
          return dateA - dateB
        },
        wrap: true,
        right: 'true'
      },
      {
        id: 'updated',
        name: 'UPDATED',
        selector: (row) => (
          <Text color={primaryTextColor}>{getFullDate(row.updatedAt)}</Text>
        ),
        sortable: true,
        sortFunction: (a, b) => {
          const dateA = new Date(a.updatedAt)
          const dateB = new Date(b.updatedAt)
          return dateA - dateB
        },
        wrap: true,
        right: 'true'
      },
      {
        id: 'expires',
        name: 'EXPIRES',
        selector: (row) => (
          <Text color={primaryTextColor}>
            {row.expiresAt ? getFullDate(row.expiresAt) : 'No Expiration'}
          </Text>
        ),
        wrap: true,
        right: 'true'
      },
      {
        id: 'status',
        name: 'STATUS',
        selector: (row) => {
          const { revoked, expired } = row

          const color = () => {
            if (!revoked && !expired) {
              return 'green'
            } else if (revoked) {
              return 'blue'
            } else {
              return 'red'
            }
          }

          const label =
            !revoked && !expired ? 'Active' : revoked ? 'Revoked' : 'Expired'

          return (
            <Tag
              size='md'
              key='md'
              variant='subtle'
              colorScheme={color()}
              textTransform={'capitalize'}
              width={'100%'}
              borderRadius={'6px'}
              alignItems={'center'}
              justifyContent={'center'}
            >
              <TagLabel px={1}>{label}</TagLabel>
            </Tag>
          )
        },
        right: 'true'
      },
      // ACTIONS
      {
        id: 'actions',
        name: 'ACTIONS',
        selector: (row, index) => {
          const { revoked } = row
          return (
            <Menu>
              <LynkAction data-testid={`token_actions_${index}`} />
              <Portal>
                <MenuList fontSize={'sm'}>
                  <MenuItem
                    hidden={row?.revoked === true}
                    data-testid={`token_revoke_${index}`}
                    onClick={() => action('revoke_token', row)}
                  >
                    Revoke Token
                  </MenuItem>
                  <MenuItem
                    isDisabled={revoked}
                    data-testid={`token_edit_${index}`}
                    onClick={() => action('update_token', row)}
                  >
                    Edit Expiration
                  </MenuItem>
                  <MenuItem
                    data-testid={`token_delete_${index}`}
                    onClick={() => action('delete_token', row)}
                  >
                    Delete
                  </MenuItem>
                </MenuList>
              </Portal>
            </Menu>
          )
        },
        right: 'true',
        width: '120px'
      }
    ]

    return columns
  }, [action, primaryTextColor])
}

export default SecurityTokenColumns
