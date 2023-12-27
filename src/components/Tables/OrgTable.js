import { useMemo, useState } from 'react'
import { AddIcon, ArrowForwardIcon } from '@chakra-ui/icons'
import {
  Button,
  Flex,
  IconButton,
  Link,
  Stack,
  Tag,
  TagLabel,
  Text,
  Tooltip,
  useDisclosure,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton
} from '@chakra-ui/react'
import DataTable from 'react-data-table-component'
import { customStyles } from 'utils'
import { getFullDateAndTime } from 'utils'
import CustomLoader from 'components/CustomLoader'
import OrgModal from 'views/Dashboard/Profile/components/OrgModal'
import { useMutation } from '@apollo/client'
import { SwitchOrganization } from 'graphQL/Mutation'
import Cookies from 'js-cookie'
import { useLocation, useNavigate } from 'react-router-dom'

const OrgTable = ({ data, refetch, activeOrg }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const activetab = queryParams.get('tab')
  const toast = useToast()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const {
    isOpen: isWarningOpen,
    onOpen: onWarningOpen,
    onClose: onWarningClose
  } = useDisclosure()

  const [activeRow, setActiveRow] = useState(null)

  const [switchOrg] = useMutation(SwitchOrganization)

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

  const subHeaderComponent = useMemo(() => {
    return (
      <Flex width={'100%'} alignItems={'center'} justifyContent={'flex-end'}>
        <Stack direction={'row'} spacing={2} alignItems={'center'}>
          <Tooltip label='Add Organization'>
            <IconButton
              colorScheme='blue'
              icon={<AddIcon />}
              onClick={onOpen}
            ></IconButton>
          </Tooltip>
        </Stack>
      </Flex>
    )
  }, [])

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
        const { name } = row
        return <Text fontSize={14}>{name}</Text>
      },
      wrap: true
    },
    {
      id: 'CONTACT_EMAIL',
      name: 'CONTACT EMAIL',
      selector: (row) => {
        const { email } = row
        return <Text fontSize={14}>{email}</Text>
      },
      wrap: true
    },
    {
      id: 'LINK',
      name: 'LINK',
      selector: (row) => {
        const { url } = row
        return (
          <Link
            href={url}
            isExternal
            fontSize={14}
            _hover={{ color: 'blue.500' }}
          >
            {url}
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
            colorScheme={status === 'approved' ? 'green' : 'blue'}
          >
            <TagLabel fontSize={14} textTransform={'capitalize'}>
              {status}
            </TagLabel>
          </Tag>
        )
      },
      wrap: true
    },
    {
      id: 'UPDATED_AT',
      name: 'UPDATED AT',
      selector: (row) => {
        const { updatedAt } = row
        return <Text fontSize={14}>{getFullDateAndTime(updatedAt)}</Text>
      },
      wrap: true
    },
    {
      id: 'ACTION',
      name: 'ACTION',
      selector: (row) => {
        const { id } = row
        return (
          <>
            {activeOrg !== id ? (
              <Button
                size='sm'
                variant='solid'
                cursor={'pointer'}
                colorScheme={'blue'}
                onClick={() => onSwitch(row)}
                rightIcon={<ArrowForwardIcon />}
              >
                Switch to
              </Button>
            ) : (
              <Button
                size='sm'
                variant='solid'
                cursor={'pointer'}
                colorScheme={'green'}
              >
                Active
              </Button>
            )}
          </>
        )
      },
      wrap: true
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
          customStyles={customStyles}
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
            <ModalHeader>Switch Org</ModalHeader>
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
    </>
  )
}

export default OrgTable
