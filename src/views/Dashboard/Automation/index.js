import { useMutation, useQuery } from '@apollo/client'
import { useCallback, useEffect, useMemo, useState } from 'react'
import DataTable from 'react-data-table-component'
import { useParams } from 'react-router-dom'
import {
  customStyles,
  getFullDateAndTime,
  timeSince,
  updatedValue
} from 'utils'

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
  useDisclosure,
  useToast
} from '@chakra-ui/react'

import CardBody from 'components/Card/CardBody'
import CustomLoader from 'components/CustomLoader'
import Pagination from 'components/Pagination'

import { useGlobalState } from 'hooks/useGlobalState'

import { AutomationRuleDelete, AutomationRuleUpdate } from 'graphQL/Mutation'
import {
  AutomationConditionSubjectFieldMapping,
  GetProjectCheck
} from 'graphQL/Queries'

import { FaEllipsisV } from 'react-icons/fa'

import CreateRule from './components/CreateRule'
import DeleteWarning from './components/DeleteWarning'
import StatusWarning from './components/StatusWarning'

const Automation = () => {
  const toast = useToast()
  const params = useParams()
  const productId = params.productid
  const activeTab = Number(localStorage.getItem('activeProdTab'))
  const { userPermissions, prodRulesState } = useGlobalState()
  const { field, direction, pageIndex } = prodRulesState

  const [activeRow, setActiveRow] = useState(null)

  const paginationSizes = [25, 50, 100]
  const [totalRows, setTotalRows] = useState(paginationSizes[0])

  const [isPrevActive, setIsPrevActive] = useState(false)
  const [isNextActive, setIsNextActive] = useState(false)

  const { data: subOperators } = useQuery(
    AutomationConditionSubjectFieldMapping,
    {
      skip: activeTab === 2 ? false : true
    }
  )

  const { data, refetch } = useQuery(GetProjectCheck, {
    skip: activeTab === 2 ? false : true,
    variables: {
      id: productId,
      first: totalRows
    }
  })

  const { automationRules } = data?.project || ''

  const [deleteRule] = useMutation(AutomationRuleDelete)
  const [updateRule] = useMutation(AutomationRuleUpdate)

  const product = userPermissions?.find((item) => item.key === 'view_product')
  const editAutomations = product?.supersededBy?.some(
    (permission) =>
      permission.key === 'edit_product_automations' && permission.value === true
  )

  const {
    isOpen: isRuleOpen,
    onOpen: onRuleOpen,
    onClose: onRuleClose
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

  const setPaginationControl = useCallback((data) => {
    setIsPrevActive(data?.project?.automationRules?.pageInfo?.hasPreviousPage)
    setIsNextActive(data?.project?.automationRules?.pageInfo?.hasNextPage)
  }, [])

  const disablePaginationControl = () => {
    setIsPrevActive(false)
    setIsNextActive(false)
  }

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

  // COLUMNS
  const columns = [
    // ACTIVE
    {
      id: 'active',
      name: 'ACTIVE',
      selector: (row) => {
        return (
          <Switch
            isChecked={row?.active}
            onChange={() => {
              setActiveRow(row)
              onActiveOpen()
            }}
          />
        )
      },
      width: '8%',
      wrap: true
    },
    // RULE
    {
      id: 'rule',
      name: 'RULE',
      selector: (row) => {
        return <Text my={3}>{row?.name}</Text>
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
          <List spacing={3} my={3}>
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
          <List spacing={3} my={3}>
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
            <Text textAlign={'right'}>{timeSince(createdAt)}</Text>
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
            <Text textAlign={'right'}>{timeSince(updatedAt)}</Text>
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
        return (
          <Menu>
            <MenuButton
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
                  Edit Rule
                </MenuItem>
                {/* DELETE POLICY  */}
                <MenuItem
                  color='red'
                  onClick={() => {
                    setActiveRow(row)
                    onDeleteOpen()
                  }}
                  isDisabled={!editAutomations}
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

  // const handleSort = async (column, sortDirection) => {
  //   refetch({
  //     id: productId,
  //     first: totalRows,
  //     last: undefined,
  //     field: column.id,
  //     direction: sortDirection === 'asc' ? 'ASC' : 'DESC'
  //   }).then((res) => {
  //     if (res.data) {
  //       prodRulesDispatch({
  //         type: 'SET_SORT_ORDER',
  //         payload: {
  //           field: column.id,
  //           direction: sortDirection === 'asc' ? 'ASC' : 'DESC'
  //         }
  //       })
  //     }
  //   })
  // }

  const handleRefresh = useCallback(async () => {
    await refetch({ id: productId, first: totalRows, field, direction })
  }, [direction, field, productId, refetch, totalRows])

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

  // ON PREV PAGE
  const handlePreviousPage = async () => {
    disablePaginationControl()
    await refetch({
      id: productId,
      first: undefined,
      last: totalRows,
      after: undefined,
      before: automationRules?.pageInfo?.startCursor
    }).then((res) => {
      if (res?.data) {
        setPaginationControl(res?.data)
      }
    })
  }

  // ON NEXT PAGE
  const handleNextPage = async () => {
    disablePaginationControl()
    await refetch({
      id: productId,
      first: totalRows,
      last: undefined,
      after: automationRules?.pageInfo?.endCursor,
      before: undefined
    }).then((res) => {
      if (res?.data) {
        setPaginationControl(res?.data)
      }
    })
  }

  // ON SET ROW
  const handleSetRow = async (e) => {
    const { value } = e.target
    setTotalRows(Number(value))
    disablePaginationControl()
    await refetch({
      id: productId,
      first: Number(value),
      last: undefined,
      after: undefined,
      before: undefined
    }).then((res) => {
      if (res?.data) {
        setPaginationControl(res?.data)
      }
    })
  }

  useEffect(() => {
    if (automationRules) {
      setIsPrevActive(automationRules?.pageInfo?.hasPreviousPage)
      setIsNextActive(automationRules?.pageInfo?.hasNextPage)
    }
  }, [automationRules])

  return (
    <>
      <CardBody>
        <Flex flexDir={'column'} width={'100%'}>
          <DataTable
            subHeader
            persistTableHead
            responsive={true}
            columns={columns}
            data={automationRules?.nodes || []}
            // onSort={handleSort}
            customStyles={customStyles}
            progressComponent={<CustomLoader />}
            progressPending={automationRules ? false : true}
            subHeaderComponent={subHeaderComponent}
          />

          {data && (
            <Pagination
              paginationSizes={paginationSizes}
              pageIndex={pageIndex}
              totalRows={totalRows}
              totalCount={data.totalCount}
              onPreviousPage={handlePreviousPage}
              onNextPage={handleNextPage}
              onSetRow={handleSetRow}
              hasNextPage={isNextActive}
              hasPreviousPage={isPrevActive}
            />
          )}
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
    </>
  )
}

export default Automation
