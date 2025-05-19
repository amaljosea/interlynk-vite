import { useMutation } from '@apollo/client'
import { useParams } from 'react-router-dom'
import { timeSince, updatedValue } from 'utils'
import { capitalizeFirstLetter, getFullDate } from 'utils'
import { formatFieldValue } from 'utils'

import { Flex, IconButton, List, ListItem } from '@chakra-ui/react'
import { Portal, Text, Tooltip } from '@chakra-ui/react'
import { Menu, MenuItem, MenuList } from '@chakra-ui/react'

import LynkAction from 'components/Misc/LynkAction'
import LynkSwitch from 'components/Misc/LynkSwitch'

import useCustomToast from 'hooks/useCustomToast'
import { useHasPermission } from 'hooks/useHasPermission'
import { useThemeColor } from 'hooks/useThemeColors'

import { AutomationRuleUpdate } from 'graphQL/Mutation'

import { BiCube, BiLayer } from 'react-icons/bi'
import { LuGripVertical } from 'react-icons/lu'

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
    component: <BiCube fontSize={18} />,
    version: <BiLayer fontSize={18} />
  }
  return [
    // RULE
    {
      id: 'priority',
      name: 'RULE',
      selector: (row) => {
        const { automationConditions, createdAt } = row
        const actionField =
          subOperators?.automationConditionSubjectFieldMapping?.find(
            (item) => item?.key === automationConditions[0]?.field
          )
        return (
          <Flex alignItems={'center'} gap={3} my={3}>
            <div
              draggable={editAutomations}
              onDrag={() => setActiveRow(row)}
              onDrop={(e) => moveRow(e, row)}
            >
              <LuGripVertical size={20} cursor={'move'} color='darkgray' />
            </div>
            <LynkSwitch
              isChecked={row?.active}
              isDisabled={!editAutomations}
              onChange={() => {
                setActiveRow(row)
                RULE_ACTIVE.onOpen()
              }}
            />
            <Tooltip
              label={actionField?.subject}
              textTransform={'capitalize'}
              placement={'top'}
            >
              <IconButton
                icon={automationIcon[actionField?.subject]}
                size={'sm'}
              />
            </Tooltip>

            <Flex direction={'column'} alignItems={'start'} gap={1}>
              <Text color={primaryTextColor}>{row?.name}</Text>
              <Tooltip label={getFullDate(createdAt)} placement='top'>
                <Text color={secondaryTextColor} textAlign={'right'}>
                  {timeSince(createdAt)}
                </Text>
              </Tooltip>
            </Flex>
          </Flex>
        )
      },
      width: '50%',
      wrap: true
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
              <ListItem key={index}>
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
              <ListItem key={index}>
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
    // CREATED AT
    {
      id: 'CREATED_AT',
      name: 'CREATED',
      selector: (row) => {
        const { createdAt } = row
        return (
          <Tooltip label={getFullDate(createdAt)} placement='top'>
            <Text color={primaryTextColor} textAlign={'right'}>
              {timeSince(createdAt)}
            </Text>
          </Tooltip>
        )
      },
      width: '10%',
      right: 'true',
      // sortable: true,
      sortFunction: (a, b) => {
        const dateA = new Date(a.createdAt)
        const dateB = new Date(b.createdAt)
        return dateA - dateB
      },
      omit: true
    },
    // UPDATED AT
    {
      id: 'UPDATED_AT',
      name: 'UPDATED',
      selector: (row) => {
        const { updatedAt } = row
        return (
          <Tooltip label={getFullDate(updatedAt)} placement='top'>
            <Text color={primaryTextColor} textAlign={'right'}>
              {timeSince(updatedAt)}
            </Text>
          </Tooltip>
        )
      },
      // sortable: true,
      sortFunction: (a, b) => {
        const dateA = new Date(a.updatedAt)
        const dateB = new Date(b.updatedAt)
        return dateA - dateB
      },
      width: '10%',
      right: 'true',
      omit: true
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
