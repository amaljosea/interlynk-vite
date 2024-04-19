import { useMutation } from '@apollo/client'
import React, { useCallback, useMemo, useState } from 'react'
import DataTable from 'react-data-table-component'
import { customStyles } from 'utils'
import { getFullDateAndTime } from 'utils'
import { timeSince } from 'utils'
import LegalModal from 'views/Dashboard/Profile/components/LegalModal'

import { EmailIcon, InfoIcon, PhoneIcon } from '@chakra-ui/icons'
import {
  Flex,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Portal,
  Stack,
  Text,
  Tooltip,
  useColorModeValue,
  useDisclosure,
  useToast
} from '@chakra-ui/react'

import CustomLoader from 'components/CustomLoader'
import InfoModal from 'components/InfoModal'

import { useGlobalState } from 'hooks/useGlobalState'

import { OrganizationManufacturerDelete } from 'graphQL/Mutation'

import { FaEllipsisVertical, FaPlus } from 'react-icons/fa6'

const LegalTable = ({ data, refetch }) => {
  const toast = useToast()
  const { totalRows } = useGlobalState()
  const [activeRow, setActiveRow] = useState(null)
  const [infoHeading, setInfoHeading] = useState('')
  const [infoText, setInfoText] = useState('')
  const [infoUrl, setInfoUrl] = useState('')
  const textColor = useColorModeValue('gray.700', 'white')

  const { isOpen, onOpen, onClose } = useDisclosure()
  const {
    isOpen: isInfoOpen,
    onOpen: onInfoOpen,
    onClose: onInfoClose
  } = useDisclosure()

  const onCheckMfc = useCallback(() => {
    setInfoHeading(`Manufacturer`)
    setInfoText(
      `For compliance, an SBOM may require the product manufacturer's name and contact information. A large corporation might have multiple legal names, including its subsidiaries.`
    )
    setInfoUrl(``)
    onInfoOpen()
  }, [onInfoOpen])

  const existingData = data?.nodes?.map((item) =>
    item?.organizationName?.toLowerCase()
  )

  const [deleteMfc] = useMutation(OrganizationManufacturerDelete)

  const handleDelete = async (id) => {
    await deleteMfc({
      variables: {
        id
      }
    }).then((res) => {
      const errors = res?.data?.organizationManufacturerDelete?.errors
      if (errors?.length > 0) {
        toast({
          description: errors[0],
          status: 'error',
          duration: 2000,
          position: 'top'
        })
      } else {
        refetch({ first: totalRows })
      }
    })
  }

  // SUB HEADER
  const subHeader = useMemo(() => {
    return (
      <Flex
        width={'100%'}
        alignItems={'center'}
        justifyContent={'space-between'}
      >
        <Stack direction={'row'} alignItems={'center'}>
          <Text fontSize='lg' color={textColor} fontWeight='bold'>
            Manufacturer Identities
          </Text>
          <InfoIcon
            color={'blue.500'}
            cursor={'pointer'}
            onClick={onCheckMfc}
          />
        </Stack>
        <Tooltip label='Add Manufacturer'>
          <IconButton
            size='sm'
            colorScheme='blue'
            onClick={() => {
              setActiveRow(null)
              onOpen()
            }}
            icon={<FaPlus size={20} />}
          />
        </Tooltip>
      </Flex>
    )
  }, [onCheckMfc, onOpen, textColor])

  // COLUMNS
  const columns = [
    // ORGANIZATION NAME
    {
      id: 'ORG_NAME',
      name: 'ORGANIZATION NAME',
      selector: (row) => (
        <Text textTransform={'capitalize'}>{row?.organizationName}</Text>
      ),
      width: '400px',
      wrap: true
    },
    // URL
    {
      id: 'URL',
      name: 'URL',
      selector: (row) => <Text>{row?.url}</Text>,
      width: '250px',
      wrap: true
    },
    // CONTACTS
    {
      id: 'CONTACTS',
      name: 'CONTACTS',
      selector: (row) => {
        const { organizationContacts } = row
        return (
          <Flex
            flexDirection={'column'}
            alignItems={'flex-start'}
            gap={3}
            my={4}
          >
            {organizationContacts?.map((item, index) => (
              <Flex key={index} alignItems={'center'} gap={4}>
                {item?.email ? (
                  <Tooltip placement='top' label={item?.email}>
                    <EmailIcon color={'blue.500'} boxSize={4} />
                  </Tooltip>
                ) : (
                  <EmailIcon color={'blackAlpha.500'} boxSize={4} />
                )}
                {item?.phone ? (
                  <Tooltip placement='top' label={item?.phone}>
                    <PhoneIcon color={'blue.500'} boxSize={3} />
                  </Tooltip>
                ) : (
                  <PhoneIcon color={'blackAlpha.500'} boxSize={3} />
                )}
                <Text>{item?.name || ''}</Text>
              </Flex>
            ))}
          </Flex>
        )
      },
      wrap: true
    },
    // CREATED AT
    {
      id: 'CREATED_AT',
      name: 'CREATED',
      selector: (row) => {
        const { createdAt } = row
        return (
          <Tooltip label={getFullDateAndTime(createdAt)} placement='top'>
            <Text>{timeSince(createdAt)}</Text>
          </Tooltip>
        )
      },
      width: '200px',
      right: 'true',
      sortable: false,
      sortFunction: (a, b) => {
        const dateA = new Date(a.createdAt)
        const dateB = new Date(b.createdAt)
        return dateA - dateB
      }
    },
    // UPDATED AT
    {
      id: 'UPDATED_AT',
      name: 'UPDATED',
      selector: (row) => {
        const { updatedAt } = row
        return (
          <Tooltip label={getFullDateAndTime(updatedAt)} placement='top'>
            <Text>{timeSince(updatedAt)}</Text>
          </Tooltip>
        )
      },
      sortable: true,
      sortFunction: (a, b) => {
        const dateA = new Date(a.updatedAt)
        const dateB = new Date(b.updatedAt)
        return dateA - dateB
      },
      width: '200px',
      right: 'true'
    },
    // ACTIONS
    {
      id: 'ACTION',
      name: 'ACTION',
      selector: (row) => {
        return (
          <Menu>
            <MenuButton
              as={IconButton}
              icon={<FaEllipsisVertical />}
              variant='none'
              color='gray.400'
            />
            <Portal>
              <MenuList fontSize={'sm'}>
                <MenuItem
                  onClick={() => {
                    setActiveRow(row)
                    onOpen()
                  }}
                >
                  Update Manufacturer
                </MenuItem>
                <MenuItem
                  color={'red.500'}
                  onClick={() => handleDelete(row?.id)}
                >
                  Archive Manufacturer
                </MenuItem>
              </MenuList>
            </Portal>
          </Menu>
        )
      },
      width: '120px',
      right: 'true'
    }
  ]

  return (
    <>
      <Flex flexDir={'column'} width={'100%'}>
        <DataTable
          columns={columns}
          data={data?.nodes || []}
          customStyles={customStyles}
          progressPending={data ? false : true}
          progressComponent={<CustomLoader />}
          subHeader
          subHeaderComponent={subHeader}
          persistTableHead
          responsive={true}
        />
      </Flex>

      {isOpen && (
        <LegalModal
          data={activeRow}
          isOpen={isOpen}
          onClose={onClose}
          refetch={refetch}
          orgs={existingData}
        />
      )}

      {/* INFO MODAL */}
      {isInfoOpen && (
        <InfoModal
          isOpen={isInfoOpen}
          onClose={onInfoClose}
          heading={infoHeading}
          body={infoText}
          url={infoUrl}
        />
      )}
    </>
  )
}

export default LegalTable
