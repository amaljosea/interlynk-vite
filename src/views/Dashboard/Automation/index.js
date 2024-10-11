import { gql, useLazyQuery, useMutation, useQuery } from '@apollo/client'
import { useCallback, useMemo, useState } from 'react'
import DataTable from 'react-data-table-component'
import { useLocation, useParams } from 'react-router-dom'
import { capitalizeFirstLetter, customStyles, getFullDateAndTime } from 'utils'
import { timeSince, updatedValue } from 'utils'
import { ProductDetailsTabs } from 'utils/TabsObjects'

import { AddIcon } from '@chakra-ui/icons'
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
  Tag,
  Text,
  Tooltip,
  useDisclosure
} from '@chakra-ui/react'

import CardBody from 'components/Card/CardBody'
import CustomLoader from 'components/CustomLoader'
import RefreshBtn from 'components/Icons/RefreshBtn'
import LynkSwitch from 'components/Misc/LynkSwitch'
import Pagination from 'components/Pagination'

import useCustomToast from 'hooks/useCustomToast'
import { useHasPermission } from 'hooks/useHasPermission'
import { usePaginatedQuery } from 'hooks/usePaginatedQuery'
import { useThemeColor } from 'hooks/useThemeColors'

import { AutomationRuleDelete, AutomationRuleUpdate } from 'graphQL/Mutation'
import {
  AutomationConditionSubjectFieldMapping,
  GetProjectCheck
} from 'graphQL/Queries'

import { FaEllipsisV } from 'react-icons/fa'
import { FaFileExport, FaFileImport } from 'react-icons/fa6'
import { MdDragIndicator } from 'react-icons/md'

import CopyRule from './components/CopyRule'
import CreateRule from './components/CreateRule'
import DeleteWarning from './components/DeleteWarning'
import ImportRule from './components/ImportRule'
import StatusWarning from './components/StatusWarning'

const RuleExport = gql`
  query RuleExport($id: Uuid!) {
    project(id: $id) {
      automationRulesExport
    }
  }
`

const Automation = ({ projects }) => {
  const { showToast } = useCustomToast()
  const params = useParams()
  const productId = params.productid

  const filterProjects = projects?.filter((item) => item?.id !== productId)
  const activeProject = projects?.find((item) => item?.id === productId)

  const { headingTextColor, primaryTextColor, secondaryTextColor } =
    useThemeColor([
      'headingTextColor',
      'primaryTextColor',
      'secondaryTextColor'
    ])

  const [activeRow, setActiveRow] = useState(null)
  const [activeEnv, setActiveEnv] = useState(null)

  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const tab = queryParams.get('tab')

  const { AUTOMATION_RULES } = ProductDetailsTabs

  const [exportRule, { loading: exportLoading }] = useLazyQuery(RuleExport)
  const { data: subOperators } = useQuery(
    AutomationConditionSubjectFieldMapping,
    {
      skip: tab === AUTOMATION_RULES ? false : true
    }
  )

  const { nodes, paginationProps, loading } = usePaginatedQuery(
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

  const RULE = useDisclosure()
  const RULE_COPY = useDisclosure()
  const RULE_ACTIVE = useDisclosure()
  const RULE_DELETE = useDisclosure()
  const RULE_IMPORT = useDisclosure()

  const handleDelete = async () => {
    await deleteRule({ variables: { id: activeRow?.id } }).then((res) => {
      const errors = res?.data?.automationRuleDelete?.errors
      if (errors?.length > 0) {
        showToast({
          description: errors[0],
          status: 'error'
        })
      } else {
        RULE_DELETE.onClose()
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
        showToast({
          description: errors[0],
          status: 'error'
        })
      } else {
        RULE_ACTIVE.onClose()
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
          showToast({
            description: errors[0],
            status: 'error'
          })
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
      width: '6.5%',
      wrap: true
    },
    // RULE
    {
      id: 'rule',
      name: 'RULE',
      selector: (row) => {
        return (
          <Text color={primaryTextColor} my={3}>
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
              color={secondaryTextColor}
            />
            <Portal>
              <MenuList fontSize={'sm'}>
                {/* EDIT POLICY */}
                <MenuItem
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

  const downloadJsonFile = useCallback(
    (data) => {
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json'
      })
      const link = document.createElement('a')
      link.download = `${activeProject?.projectGroup?.name}-${activeProject?.name}.json`
      link.href = window.URL.createObjectURL(blob)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    },
    [activeProject]
  )

  const handleExport = useCallback(() => {
    exportRule({
      variables: {
        id: productId
      }
    }).then((res) => {
      if (res.called) {
        const data = res?.data?.project?.automationRulesExport
        data && downloadJsonFile(data)
      }
    })
  }, [downloadJsonFile, exportRule, productId])

  const subHeaderComponent = useMemo(() => {
    return (
      <Flex width={'100%'} alignItems={'center'} justifyContent={'flex-end'}>
        <Stack direction={'row'} spacing={2} alignItems={'center'}>
          <Tooltip label='Import Rules'>
            <IconButton
              colorScheme='blue'
              icon={<FaFileImport />}
              onClick={RULE_IMPORT.onOpen}
            />
          </Tooltip>
          <Tooltip label='Export Rules'>
            <IconButton
              colorScheme='blue'
              icon={<FaFileExport />}
              onClick={handleExport}
              isLoading={exportLoading}
            />
          </Tooltip>
          <Tooltip label='Add Rule'>
            <IconButton
              onClick={() => {
                setActiveRow(null)
                RULE.onOpen()
              }}
              colorScheme='blue'
              icon={<AddIcon />}
            />
          </Tooltip>
          <RefreshBtn />
        </Stack>
      </Flex>
    )
  }, [RULE, RULE_IMPORT, handleExport, exportLoading])

  return (
    <>
      <CardBody>
        <Flex flexDir={'column'} width={'100%'}>
          <DataTable
            subHeader
            data={nodes}
            persistTableHead
            responsive={true}
            columns={columns}
            customStyles={customStyles(headingTextColor)}
            progressPending={loading}
            progressComponent={<CustomLoader />}
            subHeaderComponent={subHeaderComponent}
          />
          <Pagination {...paginationProps} />
        </Flex>
      </CardBody>

      {RULE.isOpen && (
        <CreateRule
          data={activeRow}
          isOpen={RULE.isOpen}
          onClose={RULE.onClose}
          subOperators={subOperators}
        />
      )}

      {RULE_DELETE.isOpen && (
        <DeleteWarning
          isOpen={RULE_DELETE.isOpen}
          onClose={RULE_DELETE.onClose}
          onDelete={handleDelete}
        />
      )}

      {RULE_ACTIVE.isOpen && (
        <StatusWarning
          isOpen={RULE_ACTIVE.isOpen}
          onClose={RULE_ACTIVE.onClose}
          onToggle={toggleStatus}
          data={activeRow}
        />
      )}

      {RULE_COPY.isOpen && (
        <CopyRule
          env={activeEnv}
          data={activeRow}
          isOpen={RULE_COPY.isOpen}
          onClose={RULE_COPY.onClose}
        />
      )}

      {RULE_IMPORT.isOpen && (
        <ImportRule isOpen={RULE_IMPORT.isOpen} onClose={RULE_IMPORT.onClose} />
      )}
    </>
  )
}

export default Automation
