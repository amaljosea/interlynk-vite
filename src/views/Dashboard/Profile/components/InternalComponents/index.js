import { useMutation, useQuery } from '@apollo/client'
import { useMemo, useState } from 'react'
import DataTable from 'react-data-table-component'
import { customStyles } from 'utils'
import { getFullDateAndTime } from 'utils'
import { timeSince } from 'utils'

import { Flex, Text, Tooltip } from '@chakra-ui/react'

import CustomLoader from 'components/CustomLoader'
import AddButton from 'components/Icons/AddButton'
import LynkSwitch from 'components/Misc/LynkSwitch'
import { RegexHighlighter } from 'components/RegexHighlighter'

import useCustomToast from 'hooks/useCustomToast'
import { useGlobalQueryContext } from 'hooks/useGlobalQueryContext'
import { useHasPermission } from 'hooks/useHasPermission'
import useQueryParam from 'hooks/useQueryParam'
import { useThemeColor } from 'hooks/useThemeColors'

import { updateOrgComp } from 'graphQL/Mutation'
import { GetInternalComponents } from 'graphQL/Queries'

import { DeleteInternalComponent } from './DeleteInternalComponent'
import { UpdateInternalComponent } from './MutateInternalComponent'

export const InternalComponents = () => {
  const activetab = useQueryParam('tab')
  const { orgView } = useGlobalQueryContext()
  const [isOpen, setIsOpen] = useState(false)
  const [editingRow, setEditingRow] = useState(null)
  const { data, loading } = useQuery(GetInternalComponents, {
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

  const { headingTextColor, primaryTextColor } = useThemeColor([
    'headingTextColor',
    'primaryTextColor'
  ])
  const paddingCell = 0
  const paddingHeadCell = 0

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
          <Text color={primaryTextColor} my={2}>
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
          <Text color={primaryTextColor} my={2}>
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
          <Text color={primaryTextColor} my={2}>
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

  // HEADER SECTION
  const subHeader = useMemo(() => {
    return (
      <Flex
        width={'100%'}
        alignItems={'center'}
        justifyContent={'space-between'}
      >
        <Flex flexDirection={'column'}>
          <Text fontSize='lg' color={primaryTextColor} fontWeight='bold'>
            Internal Components
          </Text>
          <Text fontSize={'sm'}>
            Tag components as internal, if their name match the regular
            expression
          </Text>
        </Flex>
        <AddButton
          label='Add Internal components'
          tooltipPlacement={'left'}
          onClick={() => {
            setIsOpen(true)
          }}
          isDisabled={!manageListing}
        />
      </Flex>
    )
  }, [manageListing, primaryTextColor])

  return (
    <>
      <DataTable
        subHeader
        responsive
        columns={columns}
        data={data?.organization?.organizationComponents}
        subHeaderComponent={subHeader}
        customStyles={customStyles(
          headingTextColor,
          null,
          paddingCell,
          paddingHeadCell
        )}
        progressPending={loading}
        progressComponent={<CustomLoader />}
        persistTableHead
      />
      {isOpen && (
        <UpdateInternalComponent
          onClose={onClose}
          internalComponent={editingRow}
        />
      )}
    </>
  )
}
