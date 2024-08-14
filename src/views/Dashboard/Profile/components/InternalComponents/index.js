import { useMutation, useQuery } from '@apollo/client'
import { useState } from 'react'
import DataTable from 'react-data-table-component'
import { customStyles } from 'utils'
import { getFullDateAndTime } from 'utils'
import { timeSince } from 'utils'

import { AddIcon } from '@chakra-ui/icons'
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
import { RegexHighlighter } from 'components/RegexHighlighter'

import useCustomToast from 'hooks/useCustomToast'
import { useGlobalQueryContext } from 'hooks/useGlobalQueryContext'
import { useHasPermission } from 'hooks/useHasPermission'
import useQueryParam from 'hooks/useQueryParam'

import { updateOrgComp } from 'graphQL/Mutation'
import { getInternalComponents } from 'graphQL/Queries'

import { DeleteInternalComponent } from './DeleteInternalComponent'
import { UpdateInternalComponent } from './MutateInternalComponent'
import LynkSwitch from 'components/Misc/LynkSwitch'

export const InternalComponents = () => {
  const activetab = useQueryParam('tab')
  const { orgView } = useGlobalQueryContext()
  const [isOpen, setIsOpen] = useState(false)
  const [editingRow, setEditingRow] = useState(null)
  const { data, loading } = useQuery(getInternalComponents, {
    skip: !orgView ? true : activetab === 'lists' ? false : true
  })
  const { showToast } = useCustomToast()

  const manageListing = useHasPermission({
    parentKey: 'view_feeds',
    childKey: 'manage_listing'
  })

  const [mutate] = useMutation(updateOrgComp, {
    onCompleted: () => {
      showToast({
        description: `Internal component update successful!`,
        status: 'success'
      })
    }
  })

  const handleToggleChange = async (id, matchStr, ignoreCase, enabled) => {
    mutate({
      variables: {
        id,
        matchStr,
        ignoreCase,
        enabled
      }
    })
  }

  const headColor = useColorModeValue('#4A5568', '#CBD5E0')
  const textColor = useColorModeValue('#1A202C', '#F7FAFC')

  const columns = [
    {
      id: 'ACTIVE',
      name: 'ACTIVE',
      selector: (row) => {
        return (
          <LynkSwitch
            isDisabled={!manageListing}
            isChecked={row.enabled}
            onChange={() =>
              handleToggleChange(
                row.id,
                row.matchStr,
                row.ignoreCase,
                !row.enabled
              )
            }
          />
        )
      }
    },
    {
      id: 'REGULAR_EXPRESSION',
      name: 'REGULAR EXPRESSION',
      grow: 2,
      selector: (row) => {
        return <RegexHighlighter>{row.matchStr}</RegexHighlighter>
      }
    },
    {
      id: 'CASE_INSENSITIVE',
      name: 'CASE INSENSITIVE',
      grow: 1.5,
      selector: (row) => {
        return (
          <Text color={textColor} my={2}>
            {row.ignoreCase ? 'Yes' : 'No'}
          </Text>
        )
      }
    },
    {
      id: 'CREATED',
      name: 'CREATED',
      selector: (row) => (
        <Tooltip label={getFullDateAndTime(row.createdAt)} placement={'top'}>
          <Text color={textColor} my={2}>
            {timeSince(row.createdAt)}
          </Text>
        </Tooltip>
      )
    },
    {
      id: 'UPDATED',
      name: 'UPDATED',
      selector: (row) => (
        <Tooltip label={getFullDateAndTime(row.updatedAt)} placement={'top'}>
          <Text color={textColor} my={2}>
            {timeSince(row.updatedAt)}
          </Text>
        </Tooltip>
      )
    },
    {
      id: 'ACTION',
      name: 'ACTION',
      right: true,
      selector: (row) => {
        return (
          <DeleteInternalComponent
            internalComponent={row}
            manageListing={manageListing}
          />
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
              isDisabled={!manageListing}
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
        customStyles={customStyles(headColor)}
        progressPending={loading}
        progressComponent={<CustomLoader />}
        persistTableHead
      />
    </Card>
  )
}
