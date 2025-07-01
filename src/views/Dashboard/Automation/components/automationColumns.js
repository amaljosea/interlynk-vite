import { useMutation } from '@apollo/client'
import { useParams } from 'react-router-dom'
import {
  capitalizeFirstLetter,
  formatFieldValue,
  getFullDate,
  timeSince,
  updatedValue
} from 'utils'

import { Flex, IconButton, List, ListItem } from '@chakra-ui/react'
import { Portal, Text, Tooltip } from '@chakra-ui/react'
import { Menu, MenuItem, MenuList } from '@chakra-ui/react'

import LynkAction from 'components/Misc/LynkAction'
import LynkSwitch from 'components/Misc/LynkSwitch'

import useCustomToast from 'hooks/useCustomToast'
import { useHasPermission } from 'hooks/useHasPermission'
import { useThemeColor } from 'hooks/useThemeColors'

import { AutomationRuleUpdate } from 'graphQL/Mutation'

import { LuBox, LuGripVertical, LuLayers } from 'react-icons/lu'

export const useAutomationColumns = (
  setActiveRow,
  activeRow,
  RULE_ACTIVE,
  RULE,
  subOperators,
  projects,
  setActiveEnv,
  RULE_COPY,
  RULE_DELETE
) => {
  const { showToast } = useCustomToast()
  const params = useParams()
  const productId = params.productid

  const [updateRule] = useMutation(AutomationRuleUpdate, {
    fetchPolicy: 'network-only'
  })

  const editAutomations = useHasPermission({
    parentKey: 'view_product_group',
    childKey: 'edit_product_automations'
  })

  const { primaryTextColor, secondaryTextColor } = useThemeColor([
    'primaryTextColor',
    'secondaryTextColor'
  ])

  const filterProjects = projects?.filter((item) => item?.id !== productId)

  const moveRow = (e, row) => {
    e.preventDefault()
    if (row) {
      updateRule({
        variables: {
          id: activeRow?.id,
          priority: row?.priority
        }
      }).then((res) => {
        const errors = res?.data?.automationRuleUpdate?.errors
        if (errors?.length > 0) {
          showToast({
            description: errors[0],
            status: 'error'
          })
        }
      })
    }
  }

  const automationIcon = {
    component: <LuBox fontSize={18} />,
    version: <LuLayers fontSize={18} />
  }
  return [
    // REORDER
    {
      id: 'REORDER',
      name: '',
      selector: (row) => {
        return (
          <div
            draggable={editAutomations}
            onDrag={() => setActiveRow(row)}
            onDrop={(e) => moveRow(e, row)}
          >
            <LuGripVertical size={20} cursor={'move'} color='darkgray' />
          </div>
        )
      },
      width: '5%',
      wrap: true
    },
    // STATUS
    {
      id: 'STATUS',
      name: 'STATUS',
      selector: (row) => {
        return (
          <LynkSwitch
            isChecked={row?.active}
            isDisabled={!editAutomations}
            onChange={() => {
              setActiveRow(row)
              RULE_ACTIVE.onOpen()
            }}
          />
        )
      },
      width: '8%',
      wrap: true
    },
    // RULE
    {
      id: 'UPDATED_AT',
      name: 'RULE',
      selector: (row) => {
        const { automationConditions, updatedAt } = row
        const actionField =
          subOperators?.automationConditionSubjectFieldMapping?.find(
            (item) => item?.key === automationConditions[0]?.field
          )
        return (
          <Flex alignItems={'center'} gap={3} my={3}>
            <Tooltip
              label={actionField?.subject}
              textTransform={'capitalize'}
              placement={'top'}
            >
              <IconButton icon={automationIcon[actionField?.subject]} />
            </Tooltip>

            <Flex direction={'column'} alignItems={'start'} gap={1}>
              <Text fontSize={14} color={primaryTextColor}>
                {row?.name}
              </Text>
              <Tooltip label={getFullDate(updatedAt)} placement='top'>
                <Text color={secondaryTextColor} textAlign={'right'}>
                  {timeSince(updatedAt)}
                </Text>
              </Tooltip>
            </Flex>
          </Flex>
        )
      },
      width: '30%',
      wrap: true,
      sortable: true,
      sortFunction: (a, b) => {
        const dateA = new Date(a?.updatedAt)
        const dateB = new Date(b?.updatedAt)
        return dateA - dateB
      }
    },
    // CONDITION
    {
      id: 'CONDITIONS',
      name: 'CONDITIONS',
      selector: (row) => {
        const { automationConditions } = row
        return (
          <List spacing={3} my={3} color={primaryTextColor}>
            {automationConditions.map((item, index) => (
              <ListItem fontSize={14} key={index}>
                {
                  subOperators?.automationConditionSubjectFieldMapping?.find(
                    (sub) => sub?.key === item?.field
                  )?.name
                }{' '}
                -{' '}
                {item?.operator === 'exists' || item?.operator === 'not_exists'
                  ? updatedValue(item?.operator)
                  : item?.value}
              </ListItem>
            ))}
          </List>
        )
      },
      wrap: true,
      sortable: false
    },
    // CHANGES
    {
      id: 'CHANGES',
      name: 'CHANGES',
      selector: (row) => {
        const { automationActions } = row
        return (
          <List spacing={3} my={3} color={primaryTextColor}>
            {automationActions.map((item, index) => (
              <ListItem fontSize={14} key={index}>
                {
                  subOperators?.automationConditionSubjectFieldMapping?.find(
                    (sub) => sub?.key === item?.field
                  )?.name
                }{' '}
                - {item?.value ? formatFieldValue(item) : 'N/A'}
              </ListItem>
            ))}
          </List>
        )
      },
      wrap: true,
      sortable: false
    },
    // ACTIONS
    {
      id: 'actions',
      name: '',
      selector: (row) => {
        const { isSystem, name } = row
        return (
          <Menu>
            <LynkAction data-testid={`automation_actions_${name}`} />
            <Portal>
              <MenuList fontSize={'sm'}>
                {/* EDIT POLICY */}
                <MenuItem
                  data-testid={`automation_edit_${name}`}
                  isDisabled={!editAutomations}
                  onClick={() => {
                    setActiveRow(row)
                    RULE.onOpen()
                  }}
                >
                  {isSystem ? 'View' : 'Edit'} Rule
                </MenuItem>
                {/* COPY ACTIONS */}
                {filterProjects?.map((item) => (
                  <MenuItem
                    key={item?.id}
                    isDisabled={!editAutomations}
                    hidden={isSystem}
                    onClick={() => {
                      setActiveRow(row)
                      setActiveEnv(item)
                      RULE_COPY.onOpen()
                    }}
                  >
                    Copy to {capitalizeFirstLetter(item?.name)}
                  </MenuItem>
                ))}
                {/* DELETE POLICY  */}
                <MenuItem
                  color='red'
                  onClick={() => {
                    setActiveRow(row)
                    RULE_DELETE.onOpen()
                  }}
                  isDisabled={!editAutomations}
                  hidden={isSystem}
                  data-testid={`automation_delete_${name}`}
                >
                  Archive Rule
                </MenuItem>
              </MenuList>
            </Portal>
          </Menu>
        )
      },
      right: 'true',
      width: '10%'
    }
  ]
}
