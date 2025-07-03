import { useMemo } from 'react'
import { getFullDate, timeSince } from 'utils'

import {
  Box,
  Flex,
  Menu,
  MenuItem,
  MenuList,
  Portal,
  Text,
  Tooltip
} from '@chakra-ui/react'

import ExternalNavIcon from 'components/Icons/ExternalNavIcon'
import LynkAction from 'components/Misc/LynkAction'

import { useHasPermission } from 'hooks/useHasPermission'
import { useThemeColor } from 'hooks/useThemeColors'

import { LuMail, LuPhone } from 'react-icons/lu'

const ManufacturerColumns = ({ handleUpdate, handleArchive }) => {
  const { primaryBlueText, primaryErrorColor, primaryTextColor } =
    useThemeColor(['primaryBlueText', 'primaryErrorColor', 'primaryTextColor'])

  const updateOrg = useHasPermission({
    parentKey: 'view_organization',
    childKey: 'update_organization'
  })

  return useMemo(() => {
    const columns = [
      // ORGANIZATION NAME
      {
        id: 'ORG_NAME',
        name: 'ORGANIZATION NAME',
        selector: (row) => (
          <Text
            fontSize={14}
            color={primaryTextColor}
            textTransform={'capitalize'}
          >
            {row?.organizationName}
          </Text>
        ),
        wrap: true
      },
      // URL
      {
        id: 'URL',
        name: 'URL',
        selector: (row) => {
          if (!row?.url) {
            return (
              <Text fontSize={14} color={primaryTextColor}>
                N/A
              </Text>
            )
          }

          return (
            <Flex direction='row' alignItems={'center'} gap={2} my={3}>
              <ExternalNavIcon
                href={
                  row?.url.startsWith('http') ? row.url : `https://${row.url}`
                }
              />
              <Text fontSize={14} color={primaryTextColor}>
                {row?.url.startsWith('http') ? row.url : `https://${row.url}`}
              </Text>
            </Flex>
          )
        },
        wrap: true
      },
      // CONTACTS
      {
        id: 'CONTACTS',
        name: 'CONTACTS',
        selector: (row) => {
          const { organizationContacts } = row

          if (organizationContacts?.length === 0) {
            return (
              <Text fontSize={14} color={primaryTextColor}>
                N/A
              </Text>
            )
          }

          return (
            <Flex
              flexDirection={'column'}
              alignItems={'flex-start'}
              gap={3}
              my={4}
            >
              {organizationContacts?.map((item, index) => (
                <Flex key={index} alignItems={'center'} gap={4}>
                  {item?.email && (
                    <Tooltip placement='top' label={item?.email}>
                      <Box>
                        <LuMail size={16} color={primaryBlueText} />
                      </Box>
                    </Tooltip>
                  )}
                  {item?.phone && (
                    <Tooltip placement='top' label={item?.phone}>
                      <Box>
                        <LuPhone size={16} color={primaryBlueText} />
                      </Box>
                    </Tooltip>
                  )}
                  <Text fontSize={14} color={primaryTextColor}>
                    {item?.name || 'N/A'}
                  </Text>
                </Flex>
              ))}
            </Flex>
          )
        },
        width: '16%',
        wrap: true
      },
      // CREATED AT
      {
        id: 'CREATED_AT',
        name: 'CREATED',
        selector: (row) => {
          const { createdAt } = row
          return (
            <Tooltip label={getFullDate(createdAt)} placement='top'>
              <Text fontSize={14} color={primaryTextColor}>
                {timeSince(createdAt)}
              </Text>
            </Tooltip>
          )
        },
        right: 'true',
        sortable: false,
        sortFunction: (a, b) => {
          const dateA = new Date(a.createdAt)
          const dateB = new Date(b.createdAt)
          return dateA - dateB
        }
      },
      // UPDATED AT
      {
        id: 'UPDATED_AT',
        name: 'UPDATED',
        selector: (row) => {
          const { updatedAt } = row
          return (
            <Tooltip label={getFullDate(updatedAt)} placement='top'>
              <Text fontSize={14} color={primaryTextColor}>
                {timeSince(updatedAt)}
              </Text>
            </Tooltip>
          )
        },
        sortable: true,
        sortFunction: (a, b) => {
          const dateA = new Date(a.updatedAt)
          const dateB = new Date(b.updatedAt)
          return dateA - dateB
        },
        right: 'true'
      },
      // ACTIONS
      {
        id: 'ACTION',
        name: 'ACTION',
        selector: (row) => {
          return (
            <Menu>
              <LynkAction />
              <Portal>
                <MenuList fontSize={'sm'}>
                  <MenuItem
                    isDisabled={!updateOrg}
                    onClick={() => handleUpdate(row)}
                  >
                    Update Manufacturer
                  </MenuItem>
                  <MenuItem
                    isDisabled={!updateOrg}
                    color={primaryErrorColor}
                    onClick={() => handleArchive(row)}
                  >
                    Archive Manufacturer
                  </MenuItem>
                </MenuList>
              </Portal>
            </Menu>
          )
        },
        width: '10%',
        right: 'true'
      }
    ]

    return columns
  }, [
    handleArchive,
    handleUpdate,
    primaryBlueText,
    primaryErrorColor,
    primaryTextColor,
    updateOrg
  ])
}

export default ManufacturerColumns
