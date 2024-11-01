import { useMutation, useQuery } from '@apollo/client'
import React, { useMemo, useState } from 'react'
import DataTable from 'react-data-table-component'
import { Link } from 'react-router-dom'
import { customStyles, getFullDateAndTime, timeSince } from 'utils'
import ConfirmationModal from 'views/Dashboard/Products/components/ConfirmationModal'
import LegalModal from 'views/Dashboard/Profile/components/LegalModal'

import {
  EmailIcon,
  ExternalLinkIcon,
  InfoIcon,
  PhoneIcon
} from '@chakra-ui/icons'
import { AddIcon } from '@chakra-ui/icons'
import {
  Flex,
  Icon,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Portal,
  Stack,
  Text,
  Tooltip,
  useDisclosure
} from '@chakra-ui/react'

import CustomLoader from 'components/CustomLoader'

import useCustomToast from 'hooks/useCustomToast'
import { useGlobalQueryContext } from 'hooks/useGlobalQueryContext'
import { useHasPermission } from 'hooks/useHasPermission'
import useQueryParam from 'hooks/useQueryParam'
import { useThemeColor } from 'hooks/useThemeColors'

import { OrganizationManufacturerDelete } from 'graphQL/Mutation'
import { GetOrgManufacturers } from 'graphQL/Queries'

import { FaEllipsisV } from 'react-icons/fa'

const LegalTable = () => {
  const { showToast } = useCustomToast()
  const activetab = useQueryParam('tab')
  const { orgView } = useGlobalQueryContext()
  const {
    headingTextColor,
    primaryTextColor,
    primaryErrorColor,
    primaryBlueText,
    secondaryTextColor
  } = useThemeColor([
    'headingTextColor',
    'primaryTextColor',
    'primaryErrorColor',
    'primaryBlueText',
    'secondaryTextColor'
  ])

  const updateOrg = useHasPermission({
    parentKey: 'view_organization',
    childKey: 'update_organization'
  })

  const [activeRow, setActiveRow] = useState(null)

  const paddingCell = 0
  const paddingHeadCell = 0

  const { data, loading } = useQuery(GetOrgManufacturers, {
    skip: !orgView ? true : activetab === 'legal' ? false : true
  })

  const { nodes } = data?.organizationManufacturers || ''

  const EDIT = useDisclosure()
  const ARCHIVE = useDisclosure()

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
        showToast({
          description: errors[0],
          status: 'error'
        })
      } else {
        ARCHIVE.onClose()
      }
    })
  }

  // SUB HEADER
  const subHeader = useMemo(() => {
    const info = `For compliance, an SBOM may require the product manufacturer's name and contact information. A large corporation might have multiple legal names, including its subsidiaries.`

    return (
      <Flex
        width={'100%'}
        alignItems={'center'}
        justifyContent={'space-between'}
      >
        <Flex flexDirection={'column'}>
          <Stack direction={'row'} alignItems={'center'}>
            <Text fontSize='lg' color={primaryTextColor} fontWeight='bold'>
              Manufacturer Identities
            </Text>
            <Tooltip label={info}>
              <InfoIcon cursor={'pointer'} color={primaryBlueText} />
            </Tooltip>
          </Stack>
          <Text fontSize={'sm'}>
            View and manage the identities of manufacturers, ensuring
            authenticity and compliance across the supply chain.
          </Text>
        </Flex>

        <Tooltip label='Add Manufacturer' placement='left'>
          <IconButton
            isDisabled={!updateOrg}
            colorScheme='blue'
            onClick={() => {
              setActiveRow(null)
              EDIT.onOpen()
            }}
            icon={<AddIcon />}
          />
        </Tooltip>
      </Flex>
    )
  }, [primaryTextColor, primaryBlueText, updateOrg, EDIT])

  // COLUMNS
  const columns = [
    // ORGANIZATION NAME
    {
      id: 'ORG_NAME',
      name: 'ORGANIZATION NAME',
      selector: (row) => (
        <Text color={primaryTextColor} textTransform={'capitalize'}>
          {row?.organizationName}
        </Text>
      ),
      wrap: true
    },
    // URL
    {
      id: 'URL',
      name: 'URL',
      selector: (row) => (
        <Flex
          direction='row'
          alignItems={'center'}
          gap={2}
          my={3}
          hidden={row?.url ? false : true}
        >
          <Link to={row?.url} target={'_blank'}>
            <Icon
              as={ExternalLinkIcon}
              h={'16px'}
              w={'16px'}
              color={primaryBlueText}
            />
          </Link>
          <Text color={primaryTextColor}>{row?.url}</Text>
        </Flex>
      ),
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
                    <EmailIcon color={primaryBlueText} boxSize={4} />
                  </Tooltip>
                ) : (
                  <EmailIcon color={headingTextColor} boxSize={4} />
                )}
                {item?.phone ? (
                  <Tooltip placement='top' label={item?.phone}>
                    <PhoneIcon color={primaryBlueText} boxSize={3} />
                  </Tooltip>
                ) : (
                  <PhoneIcon color={headingTextColor} boxSize={3} />
                )}
                <Text color={primaryTextColor}>{item?.name || ''}</Text>
              </Flex>
            ))}
          </Flex>
        )
      },
      minWidth: '16%',
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
            <Text color={primaryTextColor}>{timeSince(createdAt)}</Text>
          </Tooltip>
        )
      },
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
            <Text color={primaryTextColor}>{timeSince(updatedAt)}</Text>
          </Tooltip>
        )
      },
      sortable: true,
      sortFunction: (a, b) => {
        const dateA = new Date(a.updatedAt)
        const dateB = new Date(b.updatedAt)
        return dateA - dateB
      },
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
              icon={<FaEllipsisV />}
              variant='none'
              color={secondaryTextColor}
            />
            <Portal>
              <MenuList fontSize={'sm'}>
                <MenuItem
                  isDisabled={!updateOrg}
                  onClick={() => {
                    setActiveRow(row)
                    EDIT.onOpen()
                  }}
                >
                  Update Manufacturer
                </MenuItem>
                <MenuItem
                  isDisabled={!updateOrg}
                  color={primaryErrorColor}
                  onClick={() => {
                    setActiveRow(row)
                    ARCHIVE.onOpen()
                  }}
                >
                  Archive Manufacturer
                </MenuItem>
              </MenuList>
            </Portal>
          </Menu>
        )
      },
      width: '10%',
      right: 'true'
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
          data={nodes || []}
          progressPending={loading}
          subHeaderComponent={subHeader}
          customStyles={customStyles(
            headingTextColor,
            null,
            paddingCell,
            paddingHeadCell
          )}
          progressComponent={<CustomLoader />}
        />
      </Flex>

      {EDIT.isOpen && (
        <LegalModal
          data={activeRow}
          isOpen={EDIT.isOpen}
          onClose={EDIT.onClose}
          orgs={existingData}
        />
      )}

      {/* ARCHIVE CONFIRMTION MODAL */}
      {ARCHIVE.isOpen && (
        <ConfirmationModal
          isOpen={ARCHIVE.isOpen}
          onClose={ARCHIVE.onClose}
          onConfirm={() => handleDelete(activeRow?.id)}
          name={activeRow?.organizationName}
          title='Archive Manufacturer'
          description='This will remove archive this Manufacturer'
        />
      )}
    </>
  )
}

export default LegalTable
