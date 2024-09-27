import { gql, useMutation, useQuery } from '@apollo/client'
import { isValid } from 'date-fns'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import DataTable from 'react-data-table-component'
import { customStyles, getFullDateAndTime, truncatedValue } from 'utils'

import { AddIcon, CopyIcon } from '@chakra-ui/icons'
import {
  Checkbox,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  IconButton,
  Input,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Portal,
  Progress,
  Stack,
  Tag,
  TagLabel,
  Text,
  Tooltip,
  useClipboard,
  useColorModeValue,
  useDisclosure
} from '@chakra-ui/react'

import CustomLoader from 'components/CustomLoader'
import LynkDate from 'components/LynkDate'
import LynkModal from 'components/LynkModal'

import { useGlobalQueryContext } from 'hooks/useGlobalQueryContext'
import useQueryParam from 'hooks/useQueryParam'
import { useThemeColor } from 'hooks/useThemeColors'

// CSS styling for the date-time picker
import {
  createApiToken,
  deleteApiToken,
  updateApiToken
} from 'graphQL/Mutation'

import { BiCheck, BiShieldQuarter } from 'react-icons/bi'
import { FaEllipsisV } from 'react-icons/fa'

const GetApiKeys = gql`
  query GetApiKeys {
    organization {
      currentUser {
        apiKeys {
          id
          rawToken
          tokenMask
          revoked
          expired
          createdAt
          updatedAt
          revokedAt
          expiresAt
          tokenName
        }
      }
    }
  }
`

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

  const borderColor = useColorModeValue('gray.200', 'gray.600')

  const { data, loading } = useQuery(GetApiKeys, {
    skip: !orgView || activetab !== 'security tokens'
  })

  const { apiKeys } = data?.organization?.currentUser || ''

  const tokenRef = useRef(null)

  const [token, setToken] = useState('')
  const [keyName, setKeyName] = useState('')
  const [error, setError] = useState('')
  const [selectedDate, setSelectedDate] = useState('')
  const [noExpire, setNoExpire] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [activeRow, setActiveRow] = useState(null)
  const [isValidDate, setIsValidDate] = useState(true)

  const handleChange = (event) => {
    const { value } = event.target
    setKeyName(value)
    setError('')
  }

  const onTokenBlur = () => {
    if (keyName.length < 4 || keyName.length > 128) {
      setError('Input must be between 4 and 128 characters')
    } else {
      setError('')
    }
  }

  const handleExpireChange = (e) => {
    const defaultDate = new Date()
    defaultDate.setDate(defaultDate.getDate() + 90)
    const { checked } = e.target
    setNoExpire(checked)
    setIsValidDate(true)
    if (checked === true) {
      setSelectedDate('')
    } else {
      setSelectedDate(defaultDate)
    }
  }

  const key = useClipboard(token)

  const [generateToken] = useMutation(createApiToken)
  const [deleteToken] = useMutation(deleteApiToken)
  const [updateToken] = useMutation(updateApiToken)

  const handleCreate = () => {
    setIsLoading(true)
    generateToken({
      variables: {
        tokenName: keyName,
        expiresAt: selectedDate
          ? selectedDate.toISOString().replace(/\.\d{3}Z$/, 'Z')
          : null
      }
    }).then((res) => {
      if (res?.data?.apiTokenCreate?.errors?.length > 0) {
        setError(res?.data?.apiTokenCreate?.errors[0])
        setIsLoading(false)
      } else {
        setTimeout(() => {
          setToken(res.data.apiTokenCreate.apiKey.rawToken)
          setIsLoading(false)
        }, 3000)
      }
    })
  }

  const handleDelete = (id) => {
    deleteToken({
      variables: {
        apiKeyId: id
      }
    }).then((res) => res && onClose())
  }

  const handleUpdate = () => {
    updateToken({
      variables: {
        id: activeRow.id,
        expires: noExpire === true ? null : selectedDate
      }
    }).then((res) => {
      if (res?.data?.apiTokenUpdate?.errors?.length > 0) {
        setError(res?.data?.apiTokenUpdate?.errors[0])
      } else {
        onClose()
      }
    })
  }

  const handleRevoked = (id) => {
    updateToken({
      variables: {
        id: id,
        revoked: new Date().toISOString()
      }
    }).then((res) => res?.data && onClose())
  }

  const handleSubmit = () => onClose()

  const handleDateChange = (newDate) => {
    const isValidDate = newDate && !isNaN(newDate)
    setSelectedDate(newDate._d)
    if (isValidDate) {
      setIsValidDate(true)
    } else {
      setIsValidDate(false)
    }
  }

  // HEADER SECTION
  const subHeaderComponent = useMemo(() => {
    const defaultDate = new Date()
    defaultDate.setDate(defaultDate.getDate() + 90)
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
            onClick={() => {
              setKeyName('')
              setError('')
              setSelectedDate(defaultDate)
              setToken('')
              setNoExpire(false)
              setActiveRow(null)
              setIsValidDate(true)
              onOpen()
            }}
            icon={<AddIcon />}
            colorScheme='blue'
            variant='solid'
            fontWeight='normal'
            fontSize={'sm'}
          />
        </Tooltip>
      </Flex>
    )
  }, [onOpen, primaryTextColor])

  useEffect(() => {
    if (activeRow) {
      setKeyName(activeRow?.tokenName)
      setSelectedDate(new Date(activeRow.expiresAt))
      setNoExpire(activeRow.expiresAt === null ? true : false)
    }
  }, [activeRow])

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
        <Text color={primaryTextColor}>
          {getFullDateAndTime(row.createdAt)}
        </Text>
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
        <Text color={primaryTextColor}>
          {getFullDateAndTime(row.updatedAt)}
        </Text>
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
          {row.expiresAt ? getFullDateAndTime(row.expiresAt) : 'No Expiration'}
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
      selector: (row) => {
        const { revoked } = row

        return (
          <Menu>
            <MenuButton
              as={IconButton}
              icon={<FaEllipsisV />}
              variant='none'
              color='gray.400'
            />
            <Portal>
              <MenuList size='sm'>
                {row.revoked === false && (
                  <MenuItem onClick={() => handleRevoked(row.id)}>
                    Revoke Token
                  </MenuItem>
                )}
                <MenuItem
                  isDisabled={revoked}
                  onClick={() => {
                    setToken('')
                    setSelectedDate(row?.expiresAt || '')
                    setIsValidDate(true)
                    setActiveRow(row)
                    onOpen()
                  }}
                >
                  Edit Expiration
                </MenuItem>
                <MenuItem onClick={() => handleDelete(row.id)}>Delete</MenuItem>
              </MenuList>
            </Portal>
          </Menu>
        )
      },
      right: 'true',
      width: '120px'
    }
  ]

  const onButtonClick =
    token !== '' ? handleSubmit : activeRow ? handleUpdate : handleCreate

  const modalTitle = activeRow
    ? truncatedValue(activeRow?.tokenName, 20)
    : 'Create Security Token'

  const buttonName =
    token !== ''
      ? 'Done'
      : activeRow
        ? 'Update'
        : isLoading
          ? 'Creating...'
          : 'Create'

  const isButtonDisabled =
    token !== ''
      ? token === ''
      : activeRow
        ? !isValidDate
        : !keyName ||
          (selectedDate !== '' && !isValid(selectedDate)) ||
          isLoading ||
          error !== '' ||
          !isValidDate

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
        <LynkModal
          isOpen={isOpen}
          onClose={onClose}
          onSubmit={onButtonClick}
          title={modalTitle}
          Icon={BiShieldQuarter}
          disabled={isButtonDisabled}
          buttonText={buttonName}
        >
          {!activeRow && (
            <FormControl
              mb={5}
              isRequired
              isInvalid={keyName !== '' && error !== ''}
            >
              <FormLabel fontSize={12} htmlFor='keyName'>
                Token Name
              </FormLabel>
              <Input
                type='text'
                id='keyName'
                name='keyName'
                value={keyName}
                minLength={4}
                maxLength={128}
                onBlur={onTokenBlur}
                onChange={handleChange}
                isDisabled={token !== ''}
              />
              <FormErrorMessage>{error}</FormErrorMessage>
            </FormControl>
          )}
          {!noExpire && (
            <FormControl mb={5} isRequired isInvalid={!isValidDate}>
              <FormLabel fontSize={12} htmlFor='expire'>
                Expiration Date
              </FormLabel>
              <LynkDate value={selectedDate} onChange={handleDateChange} />
              {!isValidDate && (
                <FormErrorMessage>
                  Please enter a valid datetime
                </FormErrorMessage>
              )}
            </FormControl>
          )}
          <FormControl mb={5}>
            <Checkbox
              isChecked={noExpire}
              onChange={handleExpireChange}
              isDisabled={token !== ''}
            >
              <Text fontSize={12}>No Expiration</Text>
            </Checkbox>
          </FormControl>
          {isLoading && <Progress size='xs' isIndeterminate />}
          {token !== '' && (
            <Stack direction={'row'} alignItems={'center'}>
              <FormControl>
                <Input type={'text'} defaultValue={token} readOnly />
              </FormControl>
              {/* ACTION */}
              <Tooltip
                label={key.hasCopied ? 'Copied!' : 'Copy'}
                closeOnClick={false}
                hasArrow
                placement='top'
              >
                <IconButton
                  border='1px solid'
                  borderColor={borderColor}
                  onClick={() => key.onCopy()}
                  icon={key.hasCopied ? <BiCheck /> : <CopyIcon />}
                />
              </Tooltip>
            </Stack>
          )}
        </LynkModal>
      )}
    </>
  )
}

export default TokenInfo
