import { useCallback, useMemo, useState } from 'react'
import DataTable from 'react-data-table-component'
import { useParams } from 'react-router-dom'
import { customStyles } from 'utils'
import { updatedValue } from 'utils'

import { AddIcon, RepeatIcon } from '@chakra-ui/icons'
import {
  Flex,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Portal,
  Stack,
  Switch,
  Text,
  Tooltip,
  useDisclosure
} from '@chakra-ui/react'

import CardBody from 'components/Card/CardBody'
import CustomLoader from 'components/CustomLoader'

import { useGlobalState } from 'hooks/useGlobalState'

import { FaEllipsisV } from 'react-icons/fa'

import CreateRule from './components/CreateRule'
import DeleteWarning from './components/DeleteWarning'
import StatusWarning from './components/StatusWarning'

const Automation = ({ refetch }) => {
  const params = useParams()
  const productId = params.productid
  const { totalRows, userPermissions, prodRulesState, dispatch } =
    useGlobalState()
  const { field, direction } = prodRulesState
  const { prodRulesDispatch } = dispatch

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

  const [rules, setRules] = useState([])
  const [activeRow, setActiveRow] = useState(null)

  const handleDelete = () => {
    const newData = rules?.filter((item) => item.id !== activeRow?.id)
    setRules(newData)
    onDeleteClose()
  }

  const toggleStatus = () => {
    const updatedRules = rules.map((rule) =>
      rule.id === activeRow?.id ? { ...rule, active: !rule.active } : rule
    )
    setRules(updatedRules)
    onActiveClose()
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
        return <Text my={3}>{row?.rule}</Text>
      },
      width: '12%',
      wrap: true
    },
    // WHEN
    {
      id: 'when',
      name: 'WHEN',
      selector: (row) => {
        return (
          <Flex flexDir={'column'} gap={2} alignItems={'flex-start'} my={3}>
            {row?.when?.map((item, index) => (
              <Text
                key={index}
                bg={'blue.100'}
                color={'blue.700'}
                px={2}
                py={1}
                borderRadius={4}
              >
                {item?.subject}:{' '}
                {item?.operator === 'Exists' || item?.operator === 'Not Exists'
                  ? item?.operator
                  : ''}
                {item?.operator === 'Exists' || item?.operator === 'Not Exists'
                  ? ''
                  : item?.value}
              </Text>
            ))}
          </Flex>
        )
      },
      wrap: true,
      sortable: false
    },
    // THEN
    {
      id: 'then',
      name: 'THEN',
      selector: (row) => {
        return <Text my={3}>{row?.then}</Text>
      },
      wrap: true
    },
    // VALUE
    {
      id: 'value',
      name: 'VALUE',
      selector: (row) => {
        const { value } = row
        const keyValuePairs = Object.entries(value)
        return (
          <Flex flexDir={'column'} gap={1} my={3}>
            {keyValuePairs.map(([key, value], index) => (
              <li key={index} style={{ listStyle: 'none' }}>
                <strong style={{ textTransform: 'capitalize' }}>
                  {updatedValue(key)}:
                </strong>{' '}
                {value}
              </li>
            ))}
          </Flex>
        )
      },
      wrap: true,
      sortable: false
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

  const handleSort = async (column, sortDirection) => {
    refetch({
      id: productId,
      first: totalRows,
      last: undefined,
      field: column.id,
      direction: sortDirection === 'asc' ? 'ASC' : 'DESC'
    }).then((res) => {
      if (res.data) {
        prodRulesDispatch({
          type: 'SET_SORT_ORDER',
          payload: {
            field: column.id,
            direction: sortDirection === 'asc' ? 'ASC' : 'DESC'
          }
        })
      }
    })
  }

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

  return (
    <>
      <CardBody>
        <Flex flexDir={'column'} width={'100%'}>
          <DataTable
            columns={columns}
            data={rules || []}
            customStyles={customStyles}
            onSort={handleSort}
            progressPending={rules ? false : true}
            progressComponent={<CustomLoader />}
            responsive={true}
            persistTableHead
            subHeader
            subHeaderComponent={subHeaderComponent}
          />
        </Flex>
      </CardBody>

      {isRuleOpen && (
        <CreateRule
          rules={rules}
          data={activeRow}
          isOpen={isRuleOpen}
          onClose={onRuleClose}
          setRules={setRules}
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
