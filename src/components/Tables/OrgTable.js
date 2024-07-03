import { useMutation } from '@apollo/client'
import Cookies from 'js-cookie'
import { useMemo, useState } from 'react'
import DataTable from 'react-data-table-component'
import { useNavigate } from 'react-router-dom'
import { customStyles, getFullDateAndTime, timeSince } from 'utils'
import OrgModal from 'views/Dashboard/Profile/components/OrgModal'

import { AddIcon } from '@chakra-ui/icons'
import {
  Alert,
  AlertDescription,
  AlertIcon,
  Badge,
  Box,
  Button,
  Flex,
  IconButton,
  Link,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Portal,
  Stack,
  Tag,
  TagLabel,
  Text,
  Tooltip,
  useColorModeValue,
  useDisclosure,
  useToast
} from '@chakra-ui/react'

import CustomLoader from 'components/CustomLoader'

import { useGlobalState } from 'hooks/useGlobalState'
import { useHasPermission } from 'hooks/useHasPermission'

import {
  AcceptOrgInvitation,
  DeclineOrgInvitation,
  QuitOrganization,
  SwitchOrganization
} from 'graphQL/Mutation'

import { FaEllipsisVertical } from 'react-icons/fa6'

const OrgTable = ({ data, refetch, activeOrg, isAdmin }) => {
  const navigate = useNavigate()
  const toast = useToast()
  const [leaveError, setLeaveError] = useState('')
  const { isOpen, onOpen, onClose } = useDisclosure()

  const headColor = useColorModeValue('#4A5568', '#CBD5E0')
  const textColor = useColorModeValue('#1A202C', '#F7FAFC')

  const { totalRows, userPermissions } = useGlobalState()

  const updateOrg = useHasPermission({
    parentKey: 'view_organization',
    childKey: 'update_organization'
  })

  const removeOrg = useHasPermission({
    parentKey: 'view_organization',
    childKey: 'remove_organization'
  })

  const {
    isOpen: isWarningOpen,
    onOpen: onWarningOpen,
    onClose: onWarningClose
  } = useDisclosure()

  const {
    isOpen: isLeaveOpen,
    onOpen: onLeaveOpen,
    onClose: onLeaveClose
  } = useDisclosure()

  const [activeRow, setActiveRow] = useState(null)

  const [switchOrg] = useMutation(SwitchOrganization)
  const [quitOrg] = useMutation(QuitOrganization)
  const [acceptInvitation] = useMutation(AcceptOrgInvitation)
  const [declineInvitation] = useMutation(DeclineOrgInvitation)

  const onSwitchOrg = async (id, name) => {
    await switchOrg({
      variables: {
        orgId: id
      }
    })
      .then((res) => {
        if (res.data) {
          Cookies.set('authToken', res.data.organizationSwitch.token)
          toast({
            description: `Logged into ${name} successfully`,
            position: 'top',
            status: 'success'
          })
        }
      })
      .finally(() => navigate('/vendor/dashboard'))
  }

  const onLeaveOrg = async (id) => {
    try {
      const res = await quitOrg({
        variables: {
          id
        }
      })

      if (res?.data?.organizationUserLeave?.errors?.length > 0) {
        setLeaveError(res?.data?.organizationUserLeave?.errors[0])
      } else {
        navigate('/auth')
      }
    } catch (error) {
      setLeaveError(error.message || 'An unexpected error occurred')
    }
  }

  const onAccept = async (id) => {
    await acceptInvitation({
      variables: {
        organizationId: id
      }
    })
      .then((res) => {
        if (res.data) {
          console.log('res', res.data)
          toast({
            description: `Invitation accepted`,
            position: 'top',
            status: 'success'
          })
        }
      })
      .finally(() => navigate('/vendor/dashboard'))
  }

  const onDecline = async (id) => {
    await declineInvitation({
      variables: {
        organizationId: id
      }
    })
      .then((res) => {
        if (res.data) {
          console.log('res', res.data)
          toast({
            description: `Invitation declined`,
            position: 'top',
            status: 'success'
          })
        }
      })
      .finally(() => {
        if (isAdmin) {
          refetch({ first: totalRows, status: 'approved' })
        } else {
          refetch({
            variables: { invitationStatuses: ['ACCEPTED', 'INVITED'] }
          })
        }
      })
  }

  const subHeaderComponent = useMemo(() => {
    return (
      <Flex width={'100%'} alignItems={'center'} justifyContent={'flex-end'}>
        <Stack direction={'row'} spacing={2} alignItems={'center'}>
          <Tooltip label='Register Organization'>
            <IconButton
              colorScheme='blue'
              icon={<AddIcon />}
              onClick={onOpen}
              isDisabled={!updateOrg}
            ></IconButton>
          </Tooltip>
        </Stack>
      </Flex>
    )
  }, [onOpen, updateOrg])

  const onSwitch = (row) => {
    setActiveRow(row)
    onWarningOpen()
  }

  // COLUMNS
  const columns = [
    {
      id: 'NAME',
      name: 'NAME',
      selector: (row) => {
        const { name, id } = row
        return (
          <Stack direction={'row'} my={3} alignItems={'center'}>
            <Text color={textColor} fontSize={14}>
              {name}
            </Text>
            {activeOrg === id && (
              <Badge
                variant='outline'
                colorScheme='blue'
                py={1}
                px={2}
                borderRadius={4}
              >
                Active
              </Badge>
            )}
          </Stack>
        )
      },
      wrap: true
    },
    {
      id: 'CONTACT_EMAIL',
      name: 'CONTACT',
      selector: (row) => {
        const { email } = row
        return (
          <Text color={textColor} fontSize={14}>
            {email}
          </Text>
        )
      },
      wrap: true
    },
    {
      id: 'LINK',
      name: 'LINK',
      selector: (row) => {
        const { url } = row
        return (
          <Link href={url} isExternal>
            <Text
              color={textColor}
              _hover={{ color: 'blue.500' }}
              fontSize={14}
            >
              {url}
            </Text>
          </Link>
        )
      },
      wrap: true
    },
    {
      id: 'STATUS',
      name: 'STATUS',
      selector: (row) => {
        const { status } = row
        return (
          <Tag
            variant='subtle'
            width={'100px'}
            colorScheme={status === 'approved' ? 'green' : 'blue'}
          >
            <TagLabel fontSize={14} textTransform={'capitalize'} mx={'auto'}>
              {status}
            </TagLabel>
          </Tag>
        )
      },
      wrap: true
    },
    {
      id: 'UPDATED_AT',
      name: 'UPDATED',
      selector: (row) => {
        const { updatedAt } = row
        return (
          <Tooltip label={getFullDateAndTime(updatedAt)} placement={'top'}>
            <Text color={textColor} textTransform={'capitalize'}>
              {timeSince(updatedAt)}
            </Text>
          </Tooltip>
        )
      },
      wrap: true,
      right: 'true',
      sortable: true,
      sortFunction: (a, b) => {
        const dateA = new Date(a.updatedAt)
        const dateB = new Date(b.updatedAt)
        return dateA - dateB // Sort in descending order
      }
    },
    {
      id: 'ACTION',
      name: 'ACTION',
      selector: (row) => {
        const { id, invitationStatus, superAdmin } = row
        return (
          <Menu>
            <MenuButton
              as={IconButton}
              aria-label='Options'
              icon={<FaEllipsisVertical />}
              variant='none'
              color='gray.400'
            />
            <Portal>
              {invitationStatus === 'invited' ? (
                <MenuList size='sm'>
                  <MenuItem onClick={() => onAccept(row.id)}>Accept</MenuItem>
                  <MenuItem onClick={() => onDecline(row.id)}>Decline</MenuItem>
                </MenuList>
              ) : (
                <MenuList size='sm'>
                  {activeOrg !== id && (
                    <MenuItem onClick={() => onSwitch(row)}>Switch To</MenuItem>
                  )}
                  <MenuItem
                    isDisabled={superAdmin || !removeOrg}
                    hidden={activeOrg !== id}
                    onClick={() => {
                      setActiveRow(row)
                      setLeaveError('')
                      onLeaveOpen()
                    }}
                  >
                    Leave Organization
                  </MenuItem>
                </MenuList>
              )}
            </Portal>
          </Menu>
        )
      },
      wrap: true,
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
          customStyles={customStyles(headColor)}
          data={data || []}
          progressComponent={<CustomLoader />}
          progressPending={data ? false : true}
          subHeaderComponent={subHeaderComponent}
        />
      </Flex>

      {isOpen && (
        <OrgModal
          isOpen={isOpen}
          onClose={onClose}
          refetch={refetch}
          org={activeOrg}
          onSwitch={onSwitchOrg}
        />
      )}

      {isWarningOpen && (
        <Modal isOpen={isWarningOpen} onClose={onWarningClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Switch Organization</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Text>
                You are about to swich to Organization:{' '}
                <strong>{activeRow.name}</strong>
              </Text>
              <Text mt={6}>Click Continue to confirm</Text>
            </ModalBody>

            <ModalFooter>
              <Button fontWeight={'medium'} mr={3} onClick={onWarningClose}>
                Cancel
              </Button>
              <Button
                fontWeight={'medium'}
                variant='solid'
                colorScheme='blue'
                onClick={() => onSwitchOrg(activeRow.id, activeRow.name)}
              >
                Continue
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}

      {isLeaveOpen && (
        <Modal isOpen={isLeaveOpen} onClose={onLeaveClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Leave Organization</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              {leaveError !== '' && (
                <Box mb={5} width={'100%'}>
                  <Alert status='error' borderRadius={4}>
                    <AlertIcon />
                    <AlertDescription fontSize={'sm'}>
                      {leaveError}
                    </AlertDescription>
                  </Alert>
                </Box>
              )}
              <Text>
                You are about to leave Organization:{' '}
                <strong>{activeRow.name}</strong>
              </Text>
              <Text mt={6}>Are you sure you wish to continue ?</Text>
            </ModalBody>

            <ModalFooter>
              <Button fontWeight={'medium'} mr={3} onClick={onLeaveClose}>
                Cancel
              </Button>
              <Button
                fontWeight={'medium'}
                variant='solid'
                colorScheme='red'
                onClick={() => onLeaveOrg(activeRow.id)}
              >
                Leave
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </>
  )
}

export default OrgTable
