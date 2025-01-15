import { useMutation, useQuery } from '@apollo/client'
import { useMemo, useRef, useState } from 'react'
import DataTable from 'react-data-table-component'
import { getFullDate, truncatedValue } from 'utils'
import { customStyles } from 'utils/styleUtils'

import { AddIcon } from '@chakra-ui/icons'
import {
  Flex,
  IconButton,
  Portal,
  Text,
  Tooltip,
  useDisclosure
} from '@chakra-ui/react'
import { Tag, TagLabel } from '@chakra-ui/react'
import { Menu, MenuItem, MenuList } from '@chakra-ui/react'

import CustomLoader from 'components/CustomLoader'
import LynkAction from 'components/Misc/LynkAction'

import { useGlobalQueryContext } from 'hooks/useGlobalQueryContext'
import { useHasPermission } from 'hooks/useHasPermission'
import useQueryParam from 'hooks/useQueryParam'
import { useThemeColor } from 'hooks/useThemeColors'

import { deleteApiToken, updateApiToken } from 'graphQL/Mutation'
import { GetApiKeys } from 'graphQL/Queries'

import TokenModal from './TokenModal'

const TokenInfo = () => {
  const activetab = useQueryParam('tab')
  const { orgView } = useGlobalQueryContext()

  const { isOpen, onOpen, onClose } = useDisclosure()

  const { headingTextColor, primaryTextColor } = useThemeColor([
    'headingTextColor',
    'primaryTextColor'
  ])

  const paddingCell = 0
  const paddingHeadCell = 0

  const { data, loading } = useQuery(GetApiKeys, {
    skip: !orgView || activetab !== 'security tokens'
  })

  const { apiKeys } = data?.organization?.currentUser || ''

  const tokenRef = useRef(null)

  const [activeRow, setActiveRow] = useState(null)

  const canAddToken = useHasPermission({
    parentKey: 'view_organization',
    childKey: 'update_organization'
  })

  const [deleteToken] = useMutation(deleteApiToken)
  const [updateToken] = useMutation(updateApiToken)

  const handleDelete = (id) => {
    deleteToken({
      variables: {
        apiKeyId: id
      }
    }).then((res) => res && onClose())
  }

  const handleRevoked = (id) => {
    updateToken({
      variables: {
        id: id,
        revoked: new Date().toISOString()
      }
    }).then((res) => res?.data && onClose())
  }

  const onEdit = (row) => {
    setActiveRow(row)
    onOpen()
  }

  // HEADER SECTION
  const subHeaderComponent = useMemo(() => {
    const onCreate = () => {
      setActiveRow(null)
      onOpen()
    }

    return (
      <Flex
        width={'100%'}
        alignItems={'center'}
        justifyContent={'space-between'}
      >
        <Flex flexDirection={'column'}>
          <Text fontSize='lg' color={primaryTextColor} fontWeight='bold'>
            Security Tokens
          </Text>
          <Text fontSize={'sm'}>
            Secure your organization with essential tokens for data protection
          </Text>
        </Flex>

        {/* NER TOKEN */}
        <Tooltip label='New Token'>
          <IconButton
            ref={tokenRef}
            onClick={onCreate}
            data-testid='new_token'
            icon={<AddIcon />}
            colorScheme='blue'
            variant='solid'
            fontWeight='normal'
            fontSize={'sm'}
            isDisabled={!canAddToken}
          />
        </Tooltip>
      </Flex>
    )
  }, [primaryTextColor, canAddToken, onOpen])

  // COLUMNS
  const columns = [
    // NAME
    {
      id: 'name',
      name: 'TOKEN NAME',
      wrap: true,
      selector: (row) => (
        <Tooltip label={row?.tokenName} placement='top'>
          <Text color={primaryTextColor} my={2}>
            {truncatedValue(row?.tokenName, 30)}
          </Text>
        </Tooltip>
      )
    },
    // TOKEN MASK
    {
      id: 'tokenMask',
      name: 'TOKEN MASK',
      selector: (row) => (
        <Text color={primaryTextColor} my={2}>
          {row.tokenMask}
        </Text>
      ),
      wrap: true
    },
    // CREATED
    {
      id: 'created',
      name: 'CREATED',
      selector: (row) => (
        <Text color={primaryTextColor}>{getFullDate(row.createdAt)}</Text>
      ),
      sortable: true,
      sortFunction: (a, b) => {
        const dateA = new Date(a.createdAt)
        const dateB = new Date(b.createdAt)
        return dateA - dateB
      },
      wrap: true,
      right: 'true'
    },
    // UPDATED
    {
      id: 'updated',
      name: 'UPDATED',
      selector: (row) => (
        <Text color={primaryTextColor}>{getFullDate(row.updatedAt)}</Text>
      ),
      sortable: true,
      sortFunction: (a, b) => {
        const dateA = new Date(a.updatedAt)
        const dateB = new Date(b.updatedAt)
        return dateA - dateB
      },
      wrap: true,
      right: 'true'
    },
    // EXPIRES
    {
      id: 'expires',
      name: 'EXPIRES',
      selector: (row) => (
        <Text color={primaryTextColor}>
          {row.expiresAt ? getFullDate(row.expiresAt) : 'No Expiration'}
        </Text>
      ),
      wrap: true,
      right: 'true'
    },
    // STATUS
    {
      id: 'status',
      name: 'STATUS',
      selector: (row) => {
        const { revoked, expired } = row

        const color = () => {
          if (!revoked && !expired) {
            return 'green'
          } else if (revoked) {
            return 'blue'
          } else {
            return 'red'
          }
        }

        return (
          <Tag
            size='md'
            key='md'
            variant='subtle'
            colorScheme={color()}
            textTransform={'capitalize'}
            width={'100%'}
            borderRadius={'6px'}
            alignItems={'center'}
            justifyContent={'center'}
          >
            <TagLabel px={1}>
              {!revoked && !expired
                ? 'Active'
                : revoked
                  ? 'Revoked'
                  : 'Expired'}
            </TagLabel>
          </Tag>
        )
      },
      right: 'true'
    },
    // ACTIONS
    {
      id: 'actions',
      name: 'ACTIONS',
      selector: (row, index) => {
        const { revoked } = row
        return (
          <Menu>
            <LynkAction data-testid={`token_actions_${index}`} />
            <Portal>
              <MenuList fontSize={'sm'}>
                <MenuItem
                  hidden={row?.revoked === true}
                  onClick={() => handleRevoked(row.id)}
                  data-testid={`token_revoke_${index}`}
                >
                  Revoke Token
                </MenuItem>
                <MenuItem
                  isDisabled={revoked}
                  onClick={() => onEdit(row)}
                  data-testid={`token_edit_${index}`}
                >
                  Edit Expiration
                </MenuItem>
                <MenuItem
                  onClick={() => handleDelete(row.id)}
                  data-testid={`token_delete_${index}`}
                >
                  Delete
                </MenuItem>
              </MenuList>
            </Portal>
          </Menu>
        )
      },
      right: 'true',
      width: '120px'
    }
  ]

  return (
    <>
      <Flex flexDir={'column'} width={'100%'}>
        <DataTable
          subHeader
          persistTableHead
          responsive={true}
          columns={columns}
          data={apiKeys || []}
          defaultSortAsc={false}
          progressPending={loading}
          defaultSortFieldId={'updated'}
          progressComponent={<CustomLoader />}
          customStyles={customStyles(
            headingTextColor,
            null,
            paddingCell,
            paddingHeadCell
          )}
          subHeaderComponent={subHeaderComponent}
        />
      </Flex>

      {isOpen && (
        <TokenModal data={activeRow} isOpen={isOpen} onClose={onClose} />
      )}
    </>
  )
}

export default TokenInfo
