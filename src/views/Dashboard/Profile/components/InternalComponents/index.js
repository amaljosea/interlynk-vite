import { useQuery } from '@apollo/client'
import { useState } from 'react'
import DataTable from 'react-data-table-component'
import { customStyles } from 'utils'
import { getFullDateAndTime } from 'utils'
import { timeSince } from 'utils'

import { AddIcon, EditIcon } from '@chakra-ui/icons'
import {
  Flex,
  IconButton,
  Stack,
  Text,
  Tooltip,
  useColorModeValue
} from '@chakra-ui/react'

import Card from 'components/Card/Card'
import CardBody from 'components/Card/CardBody'
import CardHeader from 'components/Card/CardHeader'
import CustomLoader from 'components/CustomLoader'

import { getInternalComponents } from 'graphQL/Queries'

import { DeleteInternalComponent } from './DeleteInternalComponent'
import { UpdateInternalComponent } from './MutateInternalComponent'

export const InternalComponents = () => {
  const textColor = useColorModeValue('gray.700', 'white')
  const [isOpen, setIsOpen] = useState(false)
  const [editingRow, setEditingRow] = useState(null)
  const { data, loading } = useQuery(getInternalComponents)

  const columns = [
    {
      name: 'Regular Expression',
      selector: 'matchStr'
    },
    {
      name: 'Case Insensitive',
      selector: () => {
        return <Text my={2}>Case Insensitive</Text>
      }
    },
    {
      name: 'Created',
      selector: (row) => {
        return (
          <Tooltip label={getFullDateAndTime(row.createdAt)} placement={'top'}>
            {timeSince(row.createdAt)}
          </Tooltip>
        )
      }
    },
    {
      name: 'Updated',
      selector: (row) => {
        return (
          <Tooltip label={getFullDateAndTime(row.updatedAt)} placement={'top'}>
            {timeSince(row.updatedAt)}
          </Tooltip>
        )
      }
    },
    {
      name: 'Actions',
      selector: (row) => {
        return (
          <div>
            <DeleteInternalComponent internalComponent={row} />
            <IconButton
              colorScheme='blue'
              ml={4}
              size='sm'
              onClick={() => {
                setIsOpen(true)
                setEditingRow(row)
              }}
              icon={<EditIcon />}
            >
              Update
            </IconButton>
          </div>
        )
      }
    }
  ]

  const onClose = () => {
    setIsOpen(false)
    setEditingRow(null)
  }

  return (
    <Card p={0}>
      <CardHeader
        p='12px 0'
        mb='8px'
        as={Flex}
        flexDirection='row'
        justifyContent='space-between'
      >
        <div>
          <Text fontSize='lg' color={textColor} fontWeight='bold'>
            Internal Components
          </Text>
          <Text fontSize={'sm'}>
            Tag components as internal, if their name match the regular
            expression
          </Text>
        </div>
        <div>
          <Tooltip placement='left' label='Add Internal components'>
            <IconButton
              icon={<AddIcon />}
              colorScheme='blue'
              variant='solid'
              onClick={() => {
                setIsOpen(true)
              }}
            />
          </Tooltip>
        </div>
      </CardHeader>

      <CardBody px='5px'>
        <Stack direction={'column'} alignItems={'flex-start'} gap={2}>
          <Flex
            flexDirection={'row'}
            flexWrap={'wrap'}
            spacing={2}
            gap={2}
          ></Flex>
        </Stack>
      </CardBody>
      {isOpen && (
        <UpdateInternalComponent
          onClose={onClose}
          internalComponent={editingRow}
        />
      )}
      <DataTable
        responsive
        columns={columns}
        data={data?.organization?.organizationComponents}
        customStyles={customStyles}
        progressPending={loading}
        progressComponent={<CustomLoader />}
        persistTableHead
      />
    </Card>
  )
}
