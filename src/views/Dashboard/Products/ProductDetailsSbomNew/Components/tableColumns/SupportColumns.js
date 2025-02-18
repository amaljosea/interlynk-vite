import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { getFullDate, timeSince } from 'utils'
import { getEolStatusColor } from 'utils/styleUtils'

import { CheckIcon } from '@chakra-ui/icons'
import { Portal, Stack, Tag, Text, Tooltip } from '@chakra-ui/react'
import { Menu, MenuItem, MenuList } from '@chakra-ui/react'

import LynkAction from 'components/Misc/LynkAction'
import LynkSwitch from 'components/Misc/LynkSwitch'

import { useThemeColor } from 'hooks/useThemeColors'

const SupportColumns = (
  setActiveRow,
  onCardOpen,
  onOpen,
  onActiveOpen,
  onDeleteOpen,
  isArchived
) => {
  const params = useParams()
  const { primaryTextColor, primaryErrorColor } = useThemeColor([
    'primaryTextColor',
    'primaryErrorColor'
  ])

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
              isChecked={enabled}
              onChange={() => {
                setActiveRow(row)
                onActiveOpen()
              }}
            />
          )
        },
        width: '8%',
        omit: params?.sbomid ? true : false,
        sortable: true
      },
      {
        id: 'COMPONENT_SUPPORT_OVERRIDES_PRODUCT_NAME',
        name: 'PRODUCT',
        selector: (row) => {
          return (
            <Stack my={4}>
              <Text color={primaryTextColor}>
                {row?.productName || row?.name}
              </Text>
              <Text color={primaryTextColor}>
                {row?.productVersion || row?.version}
              </Text>
            </Stack>
          )
        },
        wrap: true,
        width: '20%',
        sortable: true
      },
      {
        id: 'IDS',
        name: 'IDS',
        selector: (row) => (
          <Text
            my={4}
            color={primaryTextColor}
            cursor={'pointer'}
            onClick={() => {
              setActiveRow(row)
              onCardOpen()
            }}
          >
            {row?.idUri}
          </Text>
        ),
        wrap: true,
        width: '20%'
      },
      {
        id: 'COMPONENT_SUPPORT_OVERRIDES_PRODUCT_VERSION',
        name: 'VERSION',
        selector: (row) => (
          <Text color={primaryTextColor}>{row?.productVersion}</Text>
        ),
        width: '12%',
        wrap: true,
        sortable: true,
        omit: true
      },
      {
        id: 'DEPRECATED',
        name: 'DEPRECATED',
        selector: (row) =>
          row?.deprecated ? <CheckIcon color={primaryErrorColor} /> : '',
        width: '12%',
        wrap: true
      },
      {
        id: 'OUTDATED',
        name: 'OUTDATED',
        selector: (row) =>
          row?.outdated ? <CheckIcon color={primaryErrorColor} /> : '',
        width: '12%',
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
              colorScheme={getEolStatusColor(eol)}
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
              colorScheme={getEolStatusColor(eos)}
              hidden={!eos}
            >
              {eos}
            </Tag>
          )
        },
        width: '12%',
        wrap: true
      },
      {
        id: 'COMPONENT_SUPPORT_OVERRIDES_UPDATED_AT',
        name: 'UPDATED',
        selector: (row) => (
          <Tooltip label={getFullDate(row?.updatedAt)} placement={'top'}>
            <Text color={primaryTextColor}>
              {row?.updatedAt ? timeSince(row?.updatedAt) : ''}
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
              <LynkAction />
              <Portal>
                <MenuList fontSize={'sm'}>
                  {/* EDIT SUPPORT */}
                  <MenuItem
                    onClick={() => {
                      setActiveRow(row)
                      onOpen()
                    }}
                  >
                    Edit Support Status
                  </MenuItem>
                  {/* DELETE SUPPORT  */}
                  <MenuItem
                    color='red'
                    onClick={() => {
                      setActiveRow(row)
                      onDeleteOpen()
                    }}
                  >
                    Delete Support
                  </MenuItem>
                </MenuList>
              </Portal>
            </Menu>
          )
        },
        width: '8%',
        right: 'true',
        omit: params.sbomid || isArchived ? true : false
      }
    ]

    return columns
  }, [
    params.sbomid,
    isArchived,
    setActiveRow,
    onActiveOpen,
    primaryTextColor,
    onCardOpen,
    primaryErrorColor,
    onOpen,
    onDeleteOpen
  ])
}

export default SupportColumns
