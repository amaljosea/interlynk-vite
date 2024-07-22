import { useMutation, useQuery } from '@apollo/client'
import { useCallback, useMemo, useState } from 'react'
import DataTable from 'react-data-table-component'
import { useLocation, useParams } from 'react-router-dom'
import {
  capitalizeFirstLetter,
  customStyles,
  getFullDateAndTime,
  timeSince,
  updatedValue
} from 'utils'
import { ProductDetailsTabs } from 'utils/TabsObjects'

import { AddIcon, RepeatIcon } from '@chakra-ui/icons'
import {
  Flex,
  IconButton,
  List,
  ListItem,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Portal,
  Stack,
  Switch,
  Tag,
  Text,
  Tooltip,
  useColorModeValue,
  useDisclosure,
  useToast
} from '@chakra-ui/react'

import CardBody from 'components/Card/CardBody'
import CustomLoader from 'components/CustomLoader'
import Pagination from 'components/Pagination'

import { useHasPermission } from 'hooks/useHasPermission'
import { usePaginatatedQuery } from 'hooks/usePaginatatedQuery'

import { AutomationRuleDelete, AutomationRuleUpdate } from 'graphQL/Mutation'
import {
  AutomationConditionSubjectFieldMapping,
  GetProjectCheck
} from 'graphQL/Queries'

import { FaEllipsisV } from 'react-icons/fa'
import { MdDragIndicator } from 'react-icons/md'

import CopyRule from './components/CopyRule'
import CreateRule from './components/CreateRule'
import DeleteWarning from './components/DeleteWarning'
import StatusWarning from './components/StatusWarning'

const Automation = ({ projects }) => {
  const toast = useToast()
  const params = useParams()
  const productId = params.productid

  const filterProjects = projects?.filter((item) => item?.id !== productId)

  const headColor = useColorModeValue('#4A5568', '#CBD5E0')
  const textColor = useColorModeValue('#1A202C', '#F7FAFC')

  const [activeRow, setActiveRow] = useState(null)
  const [activeEnv, setActiveEnv] = useState(null)

  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const tab = queryParams.get('tab')

  const { AUTOMATION_RULES } = ProductDetailsTabs

  const { data: subOperators } = useQuery(
    AutomationConditionSubjectFieldMapping,
    {
      skip: tab === AUTOMATION_RULES ? false : true
    }
  )

  const { nodes, paginationProps, refetch, loading } = usePaginatatedQuery(
    GetProjectCheck,
    {
      skip: tab === AUTOMATION_RULES ? false : true,
      selector: 'project.automationRules',
      variables: {
        id: productId
      }
    }
  )

  const [deleteRule] = useMutation(AutomationRuleDelete)
  const [updateRule] = useMutation(AutomationRuleUpdate, {
    fetchPolicy: 'network-only'
  })

  const editAutomations = useHasPermission({
    parentKey: 'view_product_group',
    childKey: 'edit_product_automations'
  })

  const {
    isOpen: isRuleOpen,
    onOpen: onRuleOpen,
    onClose: onRuleClose
  } = useDisclosure()
  const {
    isOpen: isCopyOpen,
    onOpen: onCopyOpen,
    onClose: onCopyClose
  } = useDisclosure()
  const {
    isOpen: isActiveOpen,
    onOpen: onActiveOpen,
    onClose: onActiveClose
  } = useDisclosure()
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose
  } = useDisclosure()

  const handleDelete = async () => {
    await deleteRule({ variables: { id: activeRow?.id } }).then((res) => {
      const errors = res?.data?.automationRuleDelete?.errors
      if (errors?.length > 0) {
        toast({
          description: errors[0],
          status: 'error',
          position: 'top',
          duration: 2000
        })
      } else {
        refetch()
        onDeleteClose()
      }
    })
  }

  const toggleStatus = async () => {
    await updateRule({
      variables: {
        id: activeRow?.id,
        active: activeRow?.active === true ? false : true
      }
    }).then((res) => {
      const errors = res?.data?.automationRuleUpdate?.errors
      if (errors?.length > 0) {
        toast({
          description: errors[0],
          status: 'error',
          position: 'top',
          duration: 2000
        })
      } else {
        refetch()
        onActiveClose()
      }
    })
  }

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
          toast({
            description: errors[0],
            status: 'error',
            position: 'top',
            duration: 2000
          })
        } else {
          refetch()
        }
      })
    }
  }

  // COLUMNS
  const columns = [
    // ACTIVE
    {
      id: 'priority',
      name: '',
      selector: (row) => {
        return (
          <div
            draggable={editAutomations}
            style={{ padding: '1rem' }}
            onDrag={() => setActiveRow(row)}
            onDrop={(e) => moveRow(e, row)}
          >
            <MdDragIndicator size={20} cursor={'move'} color='darkgray' />
          </div>
        )
      },
      width: '5%'
    },
    // ACTIVE
    {
      id: 'active',
      name: 'ACTIVE',
      selector: (row) => {
        return (
          <Switch
            isChecked={row?.active}
            isDisabled={!editAutomations}
            onChange={() => {
              setActiveRow(row)
              onActiveOpen()
            }}
          />
        )
      },
      width: '6.5%',
      wrap: true
    },
    // RULE
    {
      id: 'rule',
      name: 'RULE',
      selector: (row) => {
        return (
          <Text color={textColor} my={3}>
            {row?.name}
          </Text>
        )
      },
      width: '12%',
      wrap: true
    },
    // SUBJECT
    {
      id: 'SUBJECT',
      name: 'SUBJECT',
      width: '10%',
      selector: (row) => {
        const { automationConditions } = row
        const actionField =
          subOperators?.automationConditionSubjectFieldMapping?.find(
            (item) => item?.key === automationConditions[0]?.field
          )
        const tagColor = actionField?.subject === 'component' ? 'blue' : 'green'
        return (
          <Tooltip
            label={actionField?.subject}
            textTransform={'capitalize'}
            placement={'top'}
          >
            <Tag size='md' variant='solid' colorScheme={tagColor}>
              {actionField?.subject === 'component' ? 'C' : 'V'}
            </Tag>
          </Tooltip>
        )
      },
      wrap: true
    },
    // CONDITION
    {
      id: 'CONDITIONS',
      name: 'CONDITIONS',
      selector: (row) => {
        const { automationConditions } = row
        return (
          <List spacing={3} my={3} color={textColor}>
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
          <List spacing={3} my={3} color={textColor}>
            {automationActions.map((item, index) => (
              <ListItem key={index}>
                {
                  subOperators?.automationConditionSubjectFieldMapping?.find(
                    (sub) => sub?.key === item?.field
                  )?.name
                }{' '}
                - {item?.value}
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
          <Tooltip label={getFullDateAndTime(createdAt)} placement='top'>
            <Text color={textColor} textAlign={'right'}>
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
      }
    },
    // UPDATED AT
    {
      id: 'UPDATED_AT',
      name: 'UPDATED',
      selector: (row) => {
        const { updatedAt } = row
        return (
          <Tooltip label={getFullDateAndTime(updatedAt)} placement='top'>
            <Text color={textColor} textAlign={'right'}>
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
      name: 'ACTIONS',
      selector: (row) => {
        const { isSystem } = row
        return (
          <Menu>
            <MenuButton
              size='sm'
              as={IconButton}
              icon={<FaEllipsisV />}
              variant='none'
              color='gray.400'
            />
            <Portal>
              <MenuList fontSize={'sm'}>
                {/* EDIT POLICY */}
                <MenuItem
                  isDisabled={!editAutomations}
                  onClick={() => {
                    setActiveRow(row)
                    onRuleOpen()
                  }}
                >
                  {isSystem ? 'View' : 'Edit'} Rule
                </MenuItem>
                {/* DELETE POLICY  */}
                <MenuItem
                  color='red'
                  onClick={() => {
                    setActiveRow(row)
                    onDeleteOpen()
                  }}
                  isDisabled={!editAutomations}
                  hidden={isSystem}
                >
                  Archive Rule
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
                      onCopyOpen()
                    }}
                  >
                    Copy to {capitalizeFirstLetter(item?.name)}
                  </MenuItem>
                ))}
              </MenuList>
            </Portal>
          </Menu>
        )
      },
      right: 'true',
      width: '10%'
    }
  ]

  const handleRefresh = useCallback(() => {
    refetch()
  }, [refetch])

  const subHeaderComponent = useMemo(() => {
    return (
      <Flex width={'100%'} alignItems={'center'} justifyContent={'flex-end'}>
        <Stack direction={'row'} spacing={2} alignItems={'center'}>
          <Tooltip label='Add Rule'>
            <IconButton
              onClick={() => {
                setActiveRow(null)
                onRuleOpen()
              }}
              colorScheme='blue'
              icon={<AddIcon />}
            />
          </Tooltip>
          <Tooltip label='Refresh'>
            <IconButton
              onClick={handleRefresh}
              colorScheme='blue'
              icon={<RepeatIcon />}
            />
          </Tooltip>
        </Stack>
      </Flex>
    )
  }, [onRuleOpen, handleRefresh])

  return (
    <>
      <CardBody>
        <Flex flexDir={'column'} width={'100%'}>
          <DataTable
            subHeader
            persistTableHead
            responsive={true}
            columns={columns}
            data={nodes}
            // onSort={handleSort}
            customStyles={customStyles(headColor)}
            progressComponent={<CustomLoader />}
            progressPending={loading}
            subHeaderComponent={subHeaderComponent}
          />
          <Pagination {...paginationProps} />
        </Flex>
      </CardBody>

      {isRuleOpen && (
        <CreateRule
          data={activeRow}
          refetch={refetch}
          isOpen={isRuleOpen}
          onClose={onRuleClose}
          subOperators={subOperators}
        />
      )}

      {isDeleteOpen && (
        <DeleteWarning
          isOpen={isDeleteOpen}
          onClose={onDeleteClose}
          onDelete={handleDelete}
        />
      )}

      {isActiveOpen && (
        <StatusWarning
          isOpen={isActiveOpen}
          onClose={onActiveClose}
          onToggle={toggleStatus}
          data={activeRow}
        />
      )}

      {isCopyOpen && (
        <CopyRule
          env={activeEnv}
          data={activeRow}
          isOpen={isCopyOpen}
          onClose={onCopyClose}
        />
      )}
    </>
  )
}

export default Automation
