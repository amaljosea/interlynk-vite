import { useMutation } from '@apollo/client'
import Cookies from 'js-cookie'
import { useMemo, useState } from 'react'
import DataTable from 'react-data-table-component'
import { useNavigate } from 'react-router-dom'
import { customStyles, getFullDateAndTime, timeSince } from 'utils'
import OrgModal from 'views/Dashboard/Profile/components/OrgModal'

import { AddIcon, RepeatIcon } from '@chakra-ui/icons'
import {
  Badge,
  Box,
  Flex,
  IconButton,
  Link,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Portal,
  Stack,
  Tag,
  TagLabel,
  Text,
  Tooltip,
  useDisclosure
} from '@chakra-ui/react'

import CustomLoader from 'components/CustomLoader'
import LynkAlert from 'components/LynkAlert'
import LynkModal from 'components/LynkModal'

import useCustomToast from 'hooks/useCustomToast'
import { useThemeColor } from 'hooks/useThemeColors'

import {
  AcceptOrgInvitation,
  DeclineOrgInvitation,
  QuitOrganization,
  SwitchOrganization
} from 'graphQL/Mutation'

import { BiExit } from 'react-icons/bi'
import { FaEllipsisV } from 'react-icons/fa'

const OrgTable = ({ data, activeOrg }) => {
  const navigate = useNavigate()
  const { showToast } = useCustomToast()
  const [leaveError, setLeaveError] = useState('')
  const { isOpen, onOpen, onClose } = useDisclosure()
  const {
    headingTextColor,
    primaryTextColor,
    primaryBlueText,
    secondaryTextColor
  } = useThemeColor([
    'headingTextColor',
    'primaryTextColor',
    'primaryBlueText',
    'secondaryTextColor'
  ])

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
          showToast({
            description: `Logged into ${name} successfully`,
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
        onLeaveClose()
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
    }).then((res) => {
      const { errors } = res?.data?.organizationUserInvitationAcceptById || ''
      if (errors?.length > 0) {
        showToast({
          description: errors[0],
          status: 'error'
        })
      } else {
        showToast({
          description: `Invitation accepted`,
          status: 'success'
        })
        navigate('/vendor/dashboard')
      }
    })
  }

  const onDecline = async (id) => {
    await declineInvitation({
      variables: {
        organizationId: id
      }
    }).then((res) => {
      const { errors } = res?.data?.organizationUserInvitationDeclineById || ''
      if (errors?.length > 0) {
        showToast({
          description: errors[0],
          status: 'error'
        })
      }
    })
  }

  const subHeaderComponent = useMemo(() => {
    return (
      <Flex width={'100%'} alignItems={'center'} justifyContent={'flex-end'}>
        <Tooltip label='Register Organization'>
          <IconButton colorScheme='blue' icon={<AddIcon />} onClick={onOpen} />
        </Tooltip>
      </Flex>
    )
  }, [onOpen])

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
          <Stack direction={'column'} my={3}>
            <Text color={primaryTextColor} fontSize={14}>
              {name}
            </Text>
            {activeOrg === id && (
              <Badge
                py={1}
                px={2}
                borderRadius={4}
                w={'fit-content'}
                variant='outline'
                colorScheme='blue'
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
          <Text color={primaryTextColor} fontSize={14}>
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
              color={primaryTextColor}
              _hover={{ color: primaryBlueText }}
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
      id: 'PLAN',
      name: 'PLAN',
      selector: (row) => {
        const { tier } = row
        return (
          <Tag
            width={'100px'}
            variant='subtle'
            colorScheme={tier === 'enterprise' ? 'green' : 'blue'}
          >
            <TagLabel fontSize={14} textTransform={'capitalize'} mx={'auto'}>
              {tier}
            </TagLabel>
          </Tag>
        )
      },
      wrap: true,
      omit: true
    },
    {
      id: 'UPDATED_AT',
      name: 'UPDATED',
      selector: (row) => {
        const { updatedAt } = row
        return (
          <Tooltip label={getFullDateAndTime(updatedAt)} placement={'top'}>
            <Text color={primaryTextColor} textTransform={'capitalize'}>
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
              icon={<FaEllipsisV />}
              variant='none'
              color={secondaryTextColor}
            />
            <Portal>
              {invitationStatus === 'invited' ? (
                <MenuList fontSize='sm'>
                  <MenuItem onClick={() => onAccept(row.id)}>Accept</MenuItem>
                  <MenuItem onClick={() => onDecline(row.id)}>Decline</MenuItem>
                </MenuList>
              ) : (
                <MenuList fontSize='sm'>
                  {activeOrg !== id && (
                    <MenuItem onClick={() => onSwitch(row)}>Switch To</MenuItem>
                  )}
                  <MenuItem
                    isDisabled={superAdmin}
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
          defaultSortAsc={true}
          defaultSortFieldId={'UPDATED_AT'}
          customStyles={customStyles(headingTextColor)}
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
          org={activeOrg}
          onSwitch={onSwitchOrg}
        />
      )}

      {isWarningOpen && (
        <LynkModal
          isOpen={isWarningOpen}
          onClose={onWarningClose}
          onSubmit={() => onSwitchOrg(activeRow.id, activeRow.name)}
          title={'Switch Organization'}
          Icon={RepeatIcon}
          buttonText='Continue'
        >
          <Text>
            You are about to swich to Organization:{' '}
            <strong>{activeRow.name}</strong>
          </Text>
          <Text mt={6}>Click Continue to confirm</Text>
        </LynkModal>
      )}

      {isLeaveOpen && (
        <LynkModal
          isOpen={isLeaveOpen}
          onClose={onLeaveClose}
          onSubmit={() => onLeaveOrg(activeRow.id)}
          title={'Leave Organization'}
          Icon={BiExit}
          buttonText='Leave'
          buttonColor='red'
        >
          {leaveError !== '' && (
            <Box mb={5} width={'100%'}>
              <LynkAlert msg={leaveError} />
            </Box>
          )}
          <Text>
            You are about to leave Organization:{' '}
            <strong>{activeRow.name}</strong>
          </Text>
          <Text mt={6}>Are you sure you wish to continue ?</Text>
        </LynkModal>
      )}
    </>
  )
}

export default OrgTable
