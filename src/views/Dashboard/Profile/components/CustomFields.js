import { useQuery } from '@apollo/client'
import { useMemo, useState } from 'react'
import { getFullDate, timeSince } from 'utils'

import { Flex, Portal, Tag, Text, Tooltip } from '@chakra-ui/react'
import { Menu, MenuItem, MenuList } from '@chakra-ui/react'
import { useDisclosure } from '@chakra-ui/react'

import AddButton from 'components/Icons/AddButton'
import LynkTable from 'components/LynkTable'
import LynkAction from 'components/Misc/LynkAction'

import { useGlobalQueryContext } from 'hooks/useGlobalQueryContext'
import { useGlobalState } from 'hooks/useGlobalState'
import useQueryParam from 'hooks/useQueryParam'
import { useThemeColor } from 'hooks/useThemeColors'

import { GetCustomFields } from 'graphQL/Queries'

import FieldModal from './FieldModal'
import FieldWarning from './FieldWarning'

const CustomFields = () => {
  const activetab = useQueryParam('tab')
  const { organization } = useGlobalState()
  const { isFreeTier } = useGlobalQueryContext()

  const { data, loading } = useQuery(GetCustomFields, {
    skip: !organization ? true : activetab === 'custom-fields' ? false : true
  })
  const isSuperAdmin = organization?.currentUser?.superAdmin

  const { componentVulnCustomFieldDefinitions } = data || ''
  const { nodes } = componentVulnCustomFieldDefinitions || ''

  const { primaryTextColor, primaryErrorColor } = useThemeColor([
    'primaryTextColor',
    'primaryErrorColor'
  ])

  const [activeRow, setActiveRow] = useState(null)

  const textStyle = {
    fontSize: 14,
    color: primaryTextColor,
    textTransform: 'capitalize'
  }

  const FIELD = useDisclosure()
  const WARNING = useDisclosure()

  const onUpdate = (row) => {
    setActiveRow(row)
    FIELD.onOpen()
  }

  const onDelete = (row) => {
    setActiveRow(row)
    WARNING.onOpen()
  }

  const columns = [
    {
      id: 'DISPLAY_NAME',
      name: 'DISPLAY NAME',
      selector: (row) => (
        <Text fontSize={14} color={primaryTextColor}>
          {row?.displayName}
        </Text>
      ),
      wrap: true
    },
    {
      id: 'INTERNAL_NAME',
      name: 'INTERNAL NAME',
      selector: (row) => (
        <Text fontSize={14} color={primaryTextColor}>
          {row?.internalName}
        </Text>
      ),
      wrap: true
    },
    {
      id: 'FIELD_TYPE',
      name: 'FIELD TYPE',
      selector: (row) => <Text sx={textStyle}>{row?.fieldType}</Text>,
      wrap: true
    },
    {
      id: 'VALUE',
      name: 'VALUE',
      selector: (row) => {
        const { minValue, maxValue } = row || ''
        if (minValue === null || maxValue === null) {
          return <Text sx={textStyle}>N/A</Text>
        }
        return (
          <Flex sx={textStyle} gap={2}>
            <Tooltip label='Min'>
              <Tag colorScheme='blue'>{row?.minValue}</Tag>
            </Tooltip>
            <Tooltip label='Max'>
              <Tag colorScheme='blue'>{row?.maxValue}</Tag>
            </Tooltip>
          </Flex>
        )
      },
      wrap: true
    },
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
    {
      id: 'ACTION',
      name: 'ACTION',
      selector: (row) => {
        return (
          <Menu>
            <LynkAction />
            <Portal>
              <MenuList fontSize={'sm'}>
                <MenuItem onClick={() => onUpdate(row)}>Edit Field</MenuItem>
                <MenuItem
                  color={primaryErrorColor}
                  onClick={() => onDelete(row)}
                >
                  Delete Field
                </MenuItem>
              </MenuList>
            </Portal>
          </Menu>
        )
      },
      right: 'true',
      omit: isFreeTier || !isSuperAdmin
    }
  ]

  const subHeader = useMemo(() => {
    const onCreate = () => {
      setActiveRow(null)
      FIELD.onOpen()
    }

    const disabled = nodes?.length === 2 || isFreeTier || !isSuperAdmin

    return (
      <Flex
        justifyContent={'space-between'}
        sx={{ w: '100%', alignItems: 'center' }}
      >
        <Text>
          <strong>Custom Fields</strong> {`(Vulnerabilities)`}
        </Text>
        <AddButton
          label={nodes?.length === 2 ? 'Not allowed' : 'Add fields'}
          tooltipPlacement='left'
          onClick={onCreate}
          isDisabled={disabled}
        />
      </Flex>
    )
  }, [nodes?.length, isFreeTier, isSuperAdmin, FIELD])

  return (
    <>
      <Flex flexDir={'column'} width={'100%'}>
        <LynkTable
          subHeader
          columns={columns}
          data={nodes || []}
          progressPending={loading}
          subHeaderComponent={subHeader}
        />
      </Flex>

      {FIELD.isOpen && (
        <FieldModal
          data={activeRow}
          isOpen={FIELD.isOpen}
          onClose={FIELD.onClose}
        />
      )}

      {WARNING.isOpen && (
        <FieldWarning
          data={activeRow}
          isOpen={WARNING.isOpen}
          onClose={WARNING.onClose}
        />
      )}
    </>
  )
}

export default CustomFields
