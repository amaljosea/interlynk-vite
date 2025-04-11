import { useMutation, useQuery } from '@apollo/client'
import React, { useMemo, useState } from 'react'
import { getFullDate, timeSince } from 'utils'
import ConfirmationModal from 'views/Dashboard/Products/components/ConfirmationModal'
import LegalModal from 'views/Dashboard/Profile/components/LegalModal'

import { EmailIcon, InfoIcon, PhoneIcon } from '@chakra-ui/icons'
import {
  Flex,
  Portal,
  Stack,
  Text,
  Tooltip,
  useDisclosure
} from '@chakra-ui/react'
import { Menu, MenuItem, MenuList } from '@chakra-ui/react'

import AddButton from 'components/Icons/AddButton'
import ExternalNavIcon from 'components/Icons/ExternalNavIcon'
import LynkTable from 'components/LynkTable'
import LynkAction from 'components/Misc/LynkAction'

import useCustomToast from 'hooks/useCustomToast'
import { useGlobalQueryContext } from 'hooks/useGlobalQueryContext'
import { useHasPermission } from 'hooks/useHasPermission'
import useQueryParam from 'hooks/useQueryParam'
import { useThemeColor } from 'hooks/useThemeColors'

import { OrganizationManufacturerDelete } from 'graphQL/Mutation'
import { GetOrgManufacturers } from 'graphQL/Queries'

const LegalTable = () => {
  const { showToast } = useCustomToast()
  const activetab = useQueryParam('tab')
  const { orgView } = useGlobalQueryContext()
  const { primaryTextColor, primaryErrorColor, primaryBlueText } =
    useThemeColor(['primaryTextColor', 'primaryErrorColor', 'primaryBlueText'])

  const updateOrg = useHasPermission({
    parentKey: 'view_organization',
    childKey: 'update_organization'
  })

  const [activeRow, setActiveRow] = useState(null)

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
        <AddButton
          label='Add Manufacturer'
          tooltipPlacement='left'
          isDisabled={!updateOrg}
          onClick={() => {
            setActiveRow(null)
            EDIT.onOpen()
          }}
          aria-label='add_manufacturer'
        />
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
      selector: (row) => {
        if (!row?.url) {
          return <Text color={primaryTextColor}>N/A</Text>
        }

        return (
          <Flex direction='row' alignItems={'center'} gap={2} my={3}>
            <ExternalNavIcon
              href={
                row?.url.startsWith('http') ? row.url : `https://${row.url}`
              }
            />
            <Text color={primaryTextColor}>
              {row?.url.startsWith('http') ? row.url : `https://${row.url}`}
            </Text>
          </Flex>
        )
      },
      wrap: true
    },
    // CONTACTS
    {
      id: 'CONTACTS',
      name: 'CONTACTS',
      selector: (row) => {
        const { organizationContacts } = row

        if (organizationContacts?.length === 0) {
          return <Text color={primaryTextColor}>N/A</Text>
        }

        return (
          <Flex
            flexDirection={'column'}
            alignItems={'flex-start'}
            gap={3}
            my={4}
          >
            {organizationContacts?.map((item, index) => (
              <Flex key={index} alignItems={'center'} gap={4}>
                {item?.email && (
                  <Tooltip placement='top' label={item?.email}>
                    <EmailIcon color={primaryBlueText} boxSize={4} />
                  </Tooltip>
                )}
                {item?.phone && (
                  <Tooltip placement='top' label={item?.phone}>
                    <PhoneIcon color={primaryBlueText} boxSize={3} />
                  </Tooltip>
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
          <Tooltip label={getFullDate(createdAt)} placement='top'>
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
          <Tooltip label={getFullDate(updatedAt)} placement='top'>
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
            <LynkAction />
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
        <LynkTable
          subHeader
          columns={columns}
          data={nodes || []}
          progressPending={loading}
          subHeaderComponent={subHeader}
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
          description='This action will archive this Manufacturer'
        />
      )}
    </>
  )
}

export default LegalTable
