import { useMutation } from '@apollo/client'
import { AddIcon } from '@chakra-ui/icons'
import {
  Button,
  Flex,
  FormControl,
  FormLabel,
  Tag,
  IconButton,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useClipboard,
  useDisclosure,
  TagLabel,
  MenuButton,
  Menu,
  Portal,
  MenuList,
  MenuItem,
  Tooltip,
  Checkbox,
  Text,
  Stack,
  Textarea,
  FormErrorMessage
} from '@chakra-ui/react'
import { useColorModeValue } from '@chakra-ui/system'
import React, { useRef, useState, useMemo, useEffect } from 'react'
import DataTable from 'react-data-table-component'
import { FaEllipsisV } from 'react-icons/fa'
import Datetime from 'react-datetime'
import 'react-datetime/css/react-datetime.css' // CSS styling for the date-time picker
import {
  createApiToken,
  deleteApiToken,
  updateApiToken
} from 'graphQL/Mutation'
import { getFullDateAndTime } from 'utils'
import { isValid } from 'date-fns'

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

const TokenInfo = ({ data, refetch }) => {
  const { isOpen, onOpen, onClose } = useDisclosure()

  const tokenRef = useRef(null)

  const defaultDate = new Date()
  defaultDate.setDate(defaultDate.getDate() + 90)

  const [token, setToken] = useState('')
  const [keyName, setKeyName] = useState('')
  const [selectedDate, setSelectedDate] = useState('')
  const [noExpire, setNoExpire] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [activeRow, setActiveRow] = useState(null)

  const key = useClipboard(token)

  const [generateToken] = useMutation(createApiToken)
  const [deleteToken] = useMutation(deleteApiToken, {
    onCompleted: () => refetch()
  })
  const [updateToken] = useMutation(updateApiToken, {
    onCompleted: () => refetch()
  })

  const handleCreate = async () => {
    setIsLoading(true)
    try {
      await generateToken({
        variables: {
          notes: keyName,
          expiresAt: selectedDate
            ? selectedDate.toISOString().replace(/\.\d{3}Z$/, 'Z')
            : undefined
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
          expires: noExpire ? undefined : selectedDate
        }
      }).then((res) => onClose())
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
      }).then((res) => onClose())
    } catch (error) {
      console.log('Mutation error', error)
    }
  }

  const handleSubmit = () => {
    refetch()
    onClose()
  }

  const handleDateChange = (newDate) => {
    console.log('newDate', newDate)
    setSelectedDate(newDate._d)
  }

  // HEADER SECTION
  const subHeaderComponent = useMemo(() => {
    return (
      <Flex width={'100%'} alignItems={'center'} justifyContent={'flex-end'}>
        {/* CREATE COMPONENT */}
        <Tooltip label='New Token'>
          <IconButton
            ref={tokenRef}
            onClick={() => {
              setKeyName('')
              setSelectedDate(defaultDate)
              setToken('')
              setNoExpire(false)
              setActiveRow(null)
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
  }, [])

  const handleExpireChange = (e) => {
    const { checked } = e.target
    setNoExpire(checked)

    if (checked === true) {
      setSelectedDate('')
    } else {
      setSelectedDate(defaultDate)
    }
  }

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
      name: 'NAME',
      selector: (row) => row.notes
    },
    // TOKEN MASK
    {
      id: 'tokenMask',
      name: 'TOKEN MASK',
      selector: (row) => row.tokenMask
    },
    // CREATED
    {
      id: 'created',
      name: 'CREATED',
      selector: (row) => <Text>{getFullDateAndTime(row.createdAt)}</Text>
    },
    // EXPIRES
    {
      id: 'expires',
      name: 'EXPIRES',
      selector: (row) => (
        <Text>
          {' '}
          {row.expiresAt ? getFullDateAndTime(row.expiresAt) : 'No Expiration'}
        </Text>
      )
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
            borderRadius='full'
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
      }
    },
    // ACTIONS
    {
      id: 'actions',
      name: 'ACTIONS',
      selector: (row) => {
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
                  onClick={() => {
                    setToken('')
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
      }
    }
  ]

  return (
    <>
      <Flex flexDir={'column'} width={'100%'}>
        <DataTable
          subHeader
          columns={columns}
          data={data}
          persistTableHead
          responsive={true}
          customStyles={customStyles}
          subHeaderComponent={subHeaderComponent}
        />
      </Flex>

      {isOpen && (
        <Modal finalFocusRef={tokenRef} isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>
              {activeRow ? activeRow.notes : 'Create API Key'}
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              {!activeRow && (
                <FormControl mb={5} isRequired>
                  <FormLabel mb={1} htmlFor='keyName'>
                    API Key Name
                  </FormLabel>
                  <Input
                    type='text'
                    id='keyName'
                    name='keyName'
                    value={keyName}
                    onChange={(e) => setKeyName(e.target.value)}
                  />
                </FormControl>
              )}
              {!noExpire && (
                <FormControl mb={5} isRequired>
                  <FormLabel mb={1} htmlFor='expire'>
                    Expiration Date
                  </FormLabel>
                  <Datetime
                    value={selectedDate}
                    onChange={handleDateChange}
                    utc={true}
                    inputProps={{ placeholder: 'Select Date and Time' }}
                  />
                </FormControl>
              )}
              <FormControl mb={5}>
                <Checkbox
                  display={activeRow && activeRow.expiresAt ? 'none' : 'block'}
                  isChecked={noExpire}
                  onChange={handleExpireChange}
                >
                  No Expiration
                </Checkbox>
              </FormControl>
              {token !== '' && (
                <>
                  <FormControl my={5}>
                    <Input type={'text'} defaultValue={token} readOnly />
                  </FormControl>
                  {/* ACTION */}
                  <Stack direction={'row'} alignItems={'center'}>
                    <Button
                      variant='solid'
                      colorScheme={'blue'}
                      onClick={() => key.onCopy()}
                    >
                      {key.hasCopied ? 'Copied!' : 'Copy'}
                    </Button>
                  </Stack>
                </>
              )}
            </ModalBody>

            <ModalFooter>
              {activeRow && (
                <Button
                  variant='solid'
                  colorScheme='blue'
                  onClick={handleUpdate}
                >
                  Update
                </Button>
              )}

              {token !== '' ? (
                <Button
                  variant='solid'
                  colorScheme='blue'
                  disabled={token === ''}
                  onClick={handleSubmit}
                >
                  Done
                </Button>
              ) : (
                !activeRow && (
                  <Button
                    variant='solid'
                    colorScheme='blue'
                    isDisabled={
                      !keyName ||
                      (selectedDate !== '' && !isValid(selectedDate)) ||
                      isLoading
                    }
                    onClick={handleCreate}
                  >
                    {isLoading ? 'Creating...' : 'Create'}
                  </Button>
                )
              )}
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </>
  )
}

export default TokenInfo
