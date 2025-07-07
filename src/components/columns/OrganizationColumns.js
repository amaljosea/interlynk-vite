import { useMemo } from 'react'
import { getFullDate, timeSince, truncatedValue } from 'utils'

import {
  Badge,
  Flex,
  Menu,
  MenuItem,
  MenuList,
  Portal,
  Stack,
  Tag,
  Text,
  Tooltip
} from '@chakra-ui/react'

import LynkAction from 'components/Misc/LynkAction'

import { useGlobalState } from 'hooks/useGlobalState'
import { useThemeColor } from 'hooks/useThemeColors'

const OrganizationColumns = ({ action }) => {
  const { organization } = useGlobalState()
  const { primaryTextColor, secondaryTextColor } = useThemeColor([
    'primaryTextColor',
    'secondaryTextColor'
  ])

  return useMemo(() => {
    const columns = [
      {
        id: 'ORGANIZATIONS_NAME',
        name: 'NAME',
        sortable: true,
        width: '30%',
        selector: (row) => {
          const { id, name, email } = row
          return (
            <Stack my={4} spacing={1}>
              <Flex flexWrap={'wrap'} gap={2} alignItems={'center'}>
                <Text fontSize={14} color={primaryTextColor}>
                  {truncatedValue(name, 25)}
                </Text>
                {organization?.id === id && (
                  <Badge w={'fit-content'} variant='outline' colorScheme='blue'>
                    Active
                  </Badge>
                )}
              </Flex>
              <Text
                fontSize={14}
                hidden={email === ''}
                color={secondaryTextColor}
              >
                {email}
              </Text>
            </Stack>
          )
        }
      },
      {
        id: 'URL',
        name: 'URL',
        width: '25%',
        selector: (row) => {
          const { url } = row
          return (
            <Text fontSize={14} color={primaryTextColor}>
              {url ? truncatedValue(url, 20) : 'N/A'}
            </Text>
          )
        }
      },
      {
        id: 'TIER',
        name: 'TIER',
        width: '10%',
        selector: (row) => {
          const { tier } = row
          return (
            <Text
              fontSize={14}
              color={primaryTextColor}
              textTransform={'capitalize'}
            >
              {tier}
            </Text>
          )
        }
      },
      {
        id: 'STATUS',
        name: 'STATUS',
        width: '10%',
        selector: (row) => {
          const { status } = row
          const isApproved = status === 'approved'
          return (
            <Tag
              w={'fit-content'}
              // variant={'solid'}
              textTransform={'capitalize'}
              colorScheme={isApproved ? 'green' : 'red'}
            >
              {status}
            </Tag>
          )
        }
      },
      {
        id: 'ORGANIZATIONS_CREATED_AT',
        name: 'CREATED',
        selector: (row) => {
          const { updatedAt } = row
          return (
            <Tooltip label={getFullDate(row?.updatedAt)}>
              <Text fontSize={14} color={primaryTextColor}>
                {timeSince(updatedAt)}
              </Text>
            </Tooltip>
          )
        },
        right: 'true',
        sortable: true,
        sortFunction: (a, b) => {
          const dateA = new Date(a.updatedAt)
          const dateB = new Date(b.updatedAt)
          return dateA - dateB
        }
      },
      {
        id: 'ACTION',
        name: 'ACTION',
        selector: (row, index) => {
          return (
            <Menu>
              <LynkAction data-testid={`org_actions_${index}`} />
              <Portal>
                <MenuList fontSize={'sm'}>
                  <MenuItem
                    data-testid={`org_switch_${index}`}
                    onClick={() => action('switch_organization', row)}
                  >
                    Switch Organization
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
  }, [action, organization?.id, primaryTextColor, secondaryTextColor])
}

export default OrganizationColumns
