import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { getFullDate, timeSince } from 'utils'
import { getSupportStatusColor } from 'utils/styleUtils'

import {
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
import LynkSwitch from 'components/Misc/LynkSwitch'

import { useHasPermission } from 'hooks/useHasPermission'
import { useThemeColor } from 'hooks/useThemeColors'

import { LuCircleCheck } from 'react-icons/lu'

const GlobalSupportColumns = ({ action }) => {
  const params = useParams()
  const sbomId = params.sbomid

  const { primaryTextColor, primaryErrorColor } = useThemeColor([
    'primaryTextColor',
    'primaryErrorColor'
  ])

  const editSup = useHasPermission({
    parentKey: 'view_support',
    childKey: 'edit_support'
  })

  const archiveSup = useHasPermission({
    parentKey: 'view_support',
    childKey: 'delete_support'
  })

  return useMemo(() => {
    const columns = [
      {
        id: 'COMPONENT_SUPPORT_OVERRIDES_ENABLED',
        name: 'ACTIVE',
        selector: (row) => {
          const { enabled } = row
          return (
            <LynkSwitch
              size='md'
              name={`support active ${row?.productName}`}
              isDisabled={!editSup}
              isChecked={enabled}
              onChange={() => action('update_status', row)}
            />
          )
        },
        width: '8%',
        omit: sbomId ? true : false,
        sortable: true
      },
      {
        id: 'COMPONENT_SUPPORT_OVERRIDES_PRODUCT_NAME',
        name: 'PRODUCT',
        selector: (row) => {
          return (
            <Stack my={4}>
              <Text fontSize={14} color={primaryTextColor}>
                {row?.productName}
              </Text>
              <Text color={primaryTextColor}>{row?.productVersion}</Text>
            </Stack>
          )
        },
        wrap: true,
        width: '12%',
        sortable: true
      },
      {
        id: 'IDS',
        name: 'IDS',
        selector: (row) => (
          <Text
            my={4}
            fontSize={14}
            color={primaryTextColor}
            cursor={'pointer'}
            onChange={() => action('view_id', row)}
          >
            {row?.idUri}
          </Text>
        ),
        wrap: true,
        width: '16%'
      },
      {
        id: 'COMPONENT_SUPPORT_OVERRIDES_PRODUCT_VERSION',
        name: 'VERSION',
        selector: (row) => (
          <Text fontSize={14} color={primaryTextColor}>
            {row?.productVersion}
          </Text>
        ),
        width: '10%',
        wrap: true,
        sortable: true,
        omit: true
      },
      {
        id: 'DEPRECATED',
        name: 'DEPRECATED',
        selector: (row) =>
          row?.deprecated ? <LuCircleCheck size={20} color={primaryErrorColor} /> : '',
        width: '10%',
        wrap: true
      },
      {
        id: 'OUTDATED',
        name: 'OUTDATED',
        selector: (row) =>
          row?.outdated ? <LuCircleCheck size={20} color={primaryErrorColor} /> : '',
        width: '9%',
        wrap: true
      },
      {
        id: 'EOL_INFOS_EOL_DATE',
        name: 'END-OF-LIFE',
        selector: (row) => {
          const { eol } = row
          return (
            <Tag
              variant='solid'
              colorScheme={getSupportStatusColor(eol, 6)}
              hidden={!eol}
            >
              {eol}
            </Tag>
          )
        },
        width: '12%',
        wrap: true
      },
      {
        id: 'EOL_INFOS_EOL_SUPPORT',
        name: 'END-OF-SERVICE',
        selector: (row) => {
          const { eos } = row
          return (
            <Tag
              variant='solid'
              colorScheme={getSupportStatusColor(eos, 6)}
              hidden={!eos}
            >
              {eos}
            </Tag>
          )
        },
        width: '12%',
        wrap: true
      },
      // UPDATED AT
      {
        id: 'COMPONENT_SUPPORT_OVERRIDES_UPDATED_AT',
        name: 'UPDATED',
        selector: (row) => (
          <Tooltip label={getFullDate(row.updatedAt)} placement={'top'}>
            <Text fontSize={14} color={primaryTextColor}>
              {timeSince(row.updatedAt)}
            </Text>
          </Tooltip>
        ),
        right: 'true',
        wrap: true,
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
        selector: (row) => {
          return (
            <Menu>
              <LynkAction aria-label={`support action ${row?.productName}`} />
              <Portal>
                <MenuList fontSize={'sm'}>
                  {/* EDIT SUPPORT */}
                  <MenuItem
                    isDisabled={!editSup}
                    onClick={() => action('update_support', row)}
                    aria-label={`support edit ${row?.productName}`}
                  >
                    Edit Support
                  </MenuItem>
                  {/* DELETE SUPPORT  */}
                  <MenuItem
                    isDisabled={!archiveSup}
                    color={primaryErrorColor}
                    onClick={() => action('delete_support', row)}
                    aria-label={`support delete ${row?.productName}`}
                  >
                    Delete Support
                  </MenuItem>
                </MenuList>
              </Portal>
            </Menu>
          )
        },
        right: 'true',
        omit: sbomId ? true : false
      }
    ]

    return columns
  }, [action, archiveSup, editSup, primaryErrorColor, primaryTextColor, sbomId])
}

export default GlobalSupportColumns
