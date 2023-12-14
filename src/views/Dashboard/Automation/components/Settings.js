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

const Settings = ({ data, refetch }) => {
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

  const [updateAutoCheck] = useMutation(UpdateAutomation)
  const [deleteAutoCheck] = useMutation(DeleteAutomation)

  const handleRemove = async () => {
    await deleteAutoCheck({
      variables: {
        autoCheckId: activeRow.id,
        projectId: productId
      }
    })
      .then((res) => res.data && refetch())
      .finally(() => onDeleteClose())
  }

  const handleStatus = async (row) => {
    await updateAutoCheck({
      variables: {
        id: row.id,
        projectId: productId,
        condition: row.condition,
        enabled: row.enabled ? false : true
      }
    }).then((res) => res.data && refetch())
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
      id: 'name',
      name: 'NAME',
      selector: (row) => {
        const { lookup } = row
        return (
          <Text textTransform={'capitalize'} my={2}>
            {lookup?.comp_name}-{lookup?.comp_version}
          </Text>
        )
      },
      wrap: true
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
      id: 'attribute',
      name: 'ATTRIBUTE',
      selector: (row) => {
        const { attrName } = row
        return <Tag colorScheme='blue'>{attrName}</Tag>
      }
    },
    // FIX
    {
      id: 'fix',
      name: 'FIX',
      selector: (row) => {
        const { setTo } = row
        return (
          <HStack alignItems={'center'} justifyContent={'flex-start'}>
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

  return (
    <>
      <CardBody>
        <Flex flexDir={'column'} width={'100%'}>
          <DataTable
            columns={columns}
            title={<Text fontSize={'xl'}>Rule Automation Settings</Text>}
            data={data && data.nodes}
            customStyles={customStyles}
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
