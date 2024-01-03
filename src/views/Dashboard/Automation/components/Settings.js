import { DeleteIcon, SettingsIcon } from '@chakra-ui/icons'
import {
  Flex,
  HStack,
  IconButton,
  Switch,
  Tag,
  Text,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure
} from '@chakra-ui/react'
import CardBody from 'components/Card/CardBody'
import CustomLoader from 'components/CustomLoader'
import DataTable from 'react-data-table-component'
import UpdateRule from './UpdateRule'
import { useState } from 'react'
import { customStyles } from 'utils'
import { DeleteAutomation, UpdateAutomation } from 'graphQL/Mutation'
import { useMutation } from '@apollo/client'
import { useLocation } from 'react-router-dom'
import { timeSince } from 'utils'
import { useGlobalState } from 'hooks/useGlobalState'

const Settings = ({ data, refetch }) => {
  const { totalRows, prodRulesState, dispatch } = useGlobalState()
  const { field, direction } = prodRulesState
  const { prodRulesDispatch } = dispatch

  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const productId = queryParams.get('id')

  const { isOpen, onOpen, onClose } = useDisclosure()
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose
  } = useDisclosure()

  const [activeRow, setActiveRow] = useState(null)

  const [updateAutoCheck] = useMutation(UpdateAutomation, {
    onCompleted: () =>
      refetch({
        variables: { id: productId, first: totalRows, field, direction }
      })
  })
  const [deleteAutoCheck] = useMutation(DeleteAutomation, {
    onCompleted: () =>
      refetch({
        variables: { id: productId, first: totalRows, field, direction }
      })
  })

  const handleRemove = async () => {
    await deleteAutoCheck({
      variables: {
        autoCheckId: activeRow.id,
        projectId: productId
      }
    }).then((res) => res.data && onDeleteClose())
  }

  const handleStatus = async (row) => {
    await updateAutoCheck({
      variables: {
        id: row.id,
        projectId: productId,
        condition: row.condition,
        enabled: row.enabled ? false : true
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
        const { enabled } = row
        return (
          <Switch
            isChecked={enabled}
            onChange={() => handleStatus(row)}
          ></Switch>
        )
      },
      width: '8%'
    },
    // RULE
    {
      id: 'rule',
      name: 'RULE APPLIES TO',
      selector: (row) => {
        const { applicability } = row
        return <Text textTransform={'capitalize'}>{applicability}</Text>
      }
    },
    // NAME
    {
      id: 'AUTO_CHECKS_LOOKUP_NAME',
      name: 'NAME',
      selector: (row) => {
        const { lookup } = row
        return (
          <Text textTransform={'capitalize'} my={2}>
            {lookup?.comp_name}-{lookup?.comp_version}
          </Text>
        )
      },
      wrap: true,
      sortable: true
    },
    // CONDITION
    {
      id: 'condition',
      name: 'CONDITION',
      selector: (row) => {
        const { condition } = row
        return <Text textTransform={'capitalize'}>{condition}</Text>
      }
    },
    // ATTRIBUTE
    {
      id: 'AUTO_CHECKS_ATTR_NAME',
      name: 'ATTRIBUTE',
      selector: (row) => {
        const { attrName } = row
        return <Tag colorScheme='blue'>{attrName}</Tag>
      },
      sortable: true
    },
    // FIX
    {
      id: 'fix',
      name: 'FIX',
      selector: (row) => {
        const { setTo } = row
        return (
          <HStack alignItems={'center'} justifyContent={'flex-start'} my={2}>
            <Text>{JSON.stringify(setTo)}</Text>
            <IconButton
              size='sm'
              onClick={() => {
                setActiveRow(row)
                onOpen()
              }}
              colorScheme='blue'
              icon={<SettingsIcon />}
            />
          </HStack>
        )
      },
      wrap: true,
      width: '25%'
    },
    // UPDATED AT
    {
      id: 'AUTO_CHECKS_UPDATED_AT',
      name: 'UPDATED AT',
      selector: (row) => {
        const { updatedAt } = row
        return <Text>{timeSince(updatedAt)}</Text>
      },
      sortable: true
    },
    // ACTIONS
    {
      id: 'actions',
      name: 'ACTIONS',
      selector: (row) => {
        return (
          <IconButton
            onClick={() => {
              setActiveRow(row)
              onDeleteOpen()
            }}
            size='sm'
            icon={<DeleteIcon />}
            colorScheme='red'
          />
        )
      },
      right: 'true'
    }
  ]

  const handleSort = async (column, sortDirection) => {
    refetch({
      variables: {
        id: productId,
        first: totalRows,
        field: column.id,
        direction: sortDirection === 'asc' ? 'ASC' : 'DESC'
      }
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

  return (
    <>
      <CardBody>
        <Flex flexDir={'column'} width={'100%'}>
          <DataTable
            columns={columns}
            title={<Text fontSize={'xl'}>Rule Automation Settings</Text>}
            data={data && data.nodes}
            customStyles={customStyles}
            onSort={handleSort}
            progressPending={data && data.nodes ? false : true}
            progressComponent={<CustomLoader />}
            responsive={true}
            persistTableHead
          />
        </Flex>
      </CardBody>

      {activeRow && isOpen && (
        <UpdateRule
          isOpen={isOpen}
          onClose={onClose}
          data={activeRow}
          refetch={refetch}
          productId={productId}
        />
      )}

      {/* DELETE */}
      {activeRow && isDeleteOpen && (
        <Modal isOpen={isDeleteOpen} onClose={onDeleteClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Delete Automation Rule</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Text>
                Deleting this automation rule will stop applying this change for
                future imports of SBOM. Existing SBOM where the rule is already
                applied will not be affected.
              </Text>
              <Text mt={4}>Are you sure you want to continue?</Text>
            </ModalBody>
            <ModalFooter>
              <Button mr={3} onClick={onDeleteClose}>
                No
              </Button>
              <Button colorScheme='red' onClick={handleRemove}>
                Yes
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </>
  )
}

export default Settings
