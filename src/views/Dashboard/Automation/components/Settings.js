import { DeleteIcon, SettingsIcon } from '@chakra-ui/icons'
import {
  Flex,
  HStack,
  IconButton,
  Switch,
  Tag,
  Text,
  useDisclosure
} from '@chakra-ui/react'
import CardBody from 'components/Card/CardBody'
import CustomLoader from 'components/CustomLoader'
import DataTable from 'react-data-table-component'
import UpdateRule from './UpdateRule'
import { useState } from 'react'
import { DeleteAutomation } from 'graphQL/Mutation'
import { useMutation } from '@apollo/client'
import { useLocation } from 'react-router-dom'
import { UpdateAutomation } from 'graphQL/Mutation'

const customStyles = {
  headCells: {
    style: {
      fontWeight: 'bold',
      color: '#2D3748',
      fontSize: '12px',
      letterSpacing: '1px'
    }
  },
  subHeader: {
    style: {
      padding: 0,
      margin: 0
    }
  }
}

const Settings = ({ data, getData }) => {
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const productId = queryParams.get('id')

  const { isOpen, onOpen, onClose } = useDisclosure()
  const [activeRow, setActiveRow] = useState(null)

  const [updateAutoCheck] = useMutation(UpdateAutomation)
  const [deleteAutoCheck] = useMutation(DeleteAutomation)

  const handleRemove = async (id) => {
    await deleteAutoCheck({
      variables: {
        autoCheckId: id,
        projectId: productId
      }
    }).then(
      (res) => res.data && getData({ variables: { id: productId, first: 25 } })
    )
  }

  const handleStatus = async (row) => {
    await updateAutoCheck({
      variables: {
        id: row.id,
        projectId: productId,
        condition: row.condition,
        enabled: row.enabled ? false : true
      }
    }).then(
      (res) =>
        res.data &&
        getData({
          variables: {
            id: productId,
            first: 25
          }
        })
    )
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
            onClick={() => handleRemove(row.id)}
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
          getData={getData}
          productId={productId}
        />
      )}
    </>
  )
}

export default Settings
