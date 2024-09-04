import { gql, useMutation, useQuery } from '@apollo/client'
import { isValid } from 'date-fns'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import DataTable from 'react-data-table-component'
import Datetime from 'react-datetime'
import 'react-datetime/css/react-datetime.css'
import { customStyles, getFullDateAndTime } from 'utils'

import { AddIcon } from '@chakra-ui/icons'
import {
  Box,
  Checkbox,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  Icon,
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
  useColorMode,
  useColorModeValue,
  useDisclosure
} from '@chakra-ui/react'

import CustomLoader from 'components/CustomLoader'
import LynkModal from 'components/LynkModal'

import { useGlobalQueryContext } from 'hooks/useGlobalQueryContext'
import useQueryParam from 'hooks/useQueryParam'

// CSS styling for the date-time picker
import {
  createApiToken,
  deleteApiToken,
  updateApiToken
} from 'graphQL/Mutation'

import { BiShieldQuarter } from 'react-icons/bi'
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
          notes
        }
      }
    }
  }
`

const TokenInfo = () => {
  const activetab = useQueryParam('tab')
  const { orgView } = useGlobalQueryContext()

  const { isOpen, onOpen, onClose } = useDisclosure()

  const { colorMode } = useColorMode()
  const react_datatime = colorMode === 'light' ? 'light_picker' : 'dark_picker'

  const headColor = useColorModeValue('#4A5568', '#CBD5E0')
  const textColor = useColorModeValue('#1A202C', '#F7FAFC')
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

  const handleCreate = async () => {
    setIsLoading(true)
    try {
      await generateToken({
        variables: {
          notes: keyName,
          expiresAt: selectedDate
            ? selectedDate.toISOString().replace(/\.\d{3}Z$/, 'Z')
            : null
        }
      }).then((res) => {
        if (res.data) {
          setTimeout(() => {
            setToken(res.data.apiTokenCreate.apiKey.rawToken)
            setIsLoading(false)
          }, 3000)
        }
      })
    } catch (error) {
      console.log('Mutation error', error)
    }
  }

  const handleDelete = async (id) => {
    try {
      await deleteToken({
        variables: {
          apiKeyId: id
        }
      }).then((res) => res && onClose())
    } catch (error) {
      console.log('Mutation error', error)
    }
  }

  const handleUpdate = async () => {
    try {
      await updateToken({
        variables: {
          id: activeRow.id,
          expires: noExpire === true ? null : selectedDate
        }
      }).then((res) => res.data && onClose())
    } catch (error) {
      console.log('Mutation error', error)
    }
  }

  const handleRevoked = async (id) => {
    try {
      await updateToken({
        variables: {
          id: id,
          revoked: new Date().toISOString()
        }
      }).then((res) => res?.data && onClose())
    } catch (error) {
      console.log('Mutation error', error)
    }
  }

  const handleSubmit = () => {
    onClose()
  }

  const handleDateChange = (newDate) => {
    console.log('newDate', newDate)
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
        marginBottom={'12px'}
      >
        <Box>
          <Heading as='h2' fontSize={'16px'} mb={1} fontFamily={'inherit'}>
            Security Tokens
          </Heading>
          <Text fontSize={'12px'} color='gray.600'>
            Secure your organization with essential tokens for data protection
          </Text>
        </Box>

        {/* NER TOKEN */}
        <Tooltip label='New Token'>
          <IconButton
            ref={tokenRef}
            onClick={() => {
              setKeyName('')
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
  }, [onOpen])

  useEffect(() => {
    if (activeRow) {
      setKeyName(activeRow.notes)
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
        <Tooltip label={row.notes} placement='top'>
          <Text color={textColor} my={2}>
            {row.notes.length > 30
              ? `${row.notes.substring(0, 30)}...`
              : row.notes}
          </Text>
        </Tooltip>
      )
    },
    // TOKEN MASK
    {
      id: 'tokenMask',
      name: 'TOKEN MASK',
      selector: (row) => (
        <Text color={textColor} my={2}>
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
        <Text color={textColor}>{getFullDateAndTime(row.createdAt)}</Text>
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
        <Text color={textColor}>{getFullDateAndTime(row.updatedAt)}</Text>
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
        <Text color={textColor}>
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
    ? activeRow.notes.length > 20
      ? `${activeRow.notes.substring(0, 20)}...`
      : activeRow.notes
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
          customStyles={customStyles(headColor)}
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
              <Datetime
                value={selectedDate}
                closeOnSelect={true}
                className={react_datatime}
                onChange={handleDateChange}
                inputProps={{
                  placeholder: 'Select Date and Time',
                  disabled: token !== '',
                  onCopy: (e) => e.preventDefault(),
                  onPaste: (e) => e.preventDefault(),
                  style: {
                    background: 'none'
                  }
                }}
              />
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
                  colorScheme='white'
                  borderColor={borderColor}
                  onClick={() => {
                    key.onCopy()
                  }}
                  //icon={
                  //   <Icon
                  //     color={'#A0AEC0'}
                  //     w={6}
                  //     h={6}
                  //     as={key.hasCopied ? BiCheck : CopyIcon}
                  //   />
                  // }
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
