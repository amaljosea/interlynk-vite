import React, { useMemo, useState } from 'react'
import DataTable from 'react-data-table-component'
import { customStyles } from 'utils'
import LegalModal from 'views/Dashboard/Profile/components/LegalModal'

import {
  Flex,
  IconButton,
  Stack,
  Tag,
  TagLabel,
  Text,
  Tooltip,
  useDisclosure
} from '@chakra-ui/react'

import CustomLoader from 'components/CustomLoader'

import { FaPlus } from 'react-icons/fa6'

const LegalTable = () => {
  const [activeRow, setActiveRow] = useState(null)
  const { isOpen, onOpen, onClose } = useDisclosure()

  const data = [
    {
      id: 1,
      orgName: 'Interlynk Inc',
      url: 'https://interlynk.io',
      contacts: [
        {
          name: 'Surendra Pathak',
          email: 'sp@interlynk.io',
          phone: '+1 345 756 1234'
        },
        {
          name: 'Ritesh Carl Noronha',
          email: 'rcn@interlynk.io',
          phone: '+1 235 124 5432'
        }
      ]
    },
    {
      id: 2,
      orgName: 'IronSource Inc',
      url: 'https://unity.co',
      contacts: [
        {
          name: 'Jeff.Drobick',
          email: 'jeff@ironsource.io',
          phone: '+1 643 234 2345'
        }
      ]
    }
  ]

  // SUB HEADER
  const subHeader = useMemo(() => {
    return (
      <Flex width={'100%'} alignItems={'center'} justifyContent={'flex-end'}>
        <Tooltip label='Add Manufacturer'>
          <IconButton
            size='sm'
            colorScheme='blue'
            onClick={onOpen}
            icon={<FaPlus size={20} />}
          />
        </Tooltip>
      </Flex>
    )
  }, [])

  // COLUMNS
  const columns = [
    // ORGANIZATION NAME
    {
      id: 'ORG_NAME',
      name: 'ORGANIZATION NAME',
      selector: (row) => (
        <Text textTransform={'capitalize'}>{row?.orgName}</Text>
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
        const { contacts } = row
        const totalContacts = contacts?.length > 1 && contacts.slice(1)
        return (
          <Stack direction={'row'} spacing={4} alignItems={'center'}>
            {contacts.length > 0 && (
              <Text>{`${contacts[0]?.name} [${contacts[0]?.email}] [${contacts[0]?.phone}]`}</Text>
            )}
            {totalContacts.length > 0 && (
              <Tooltip
                label={JSON.stringify(totalContacts).slice(1, -1)}
                placement={'top'}
              >
                <Tag
                  size={'md'}
                  variant='subtle'
                  colorScheme='green'
                  width={'fit-content'}
                >
                  <TagLabel width={6}>{`+${totalContacts.length}`}</TagLabel>
                </Tag>
              </Tooltip>
            )}
          </Stack>
        )
      },
      wrap: true
    }
  ]

  return (
    <>
      <Flex flexDir={'column'} width={'100%'}>
        <DataTable
          columns={columns}
          data={data || []}
          customStyles={customStyles}
          progressPending={data ? false : true}
          progressComponent={<CustomLoader />}
          subHeader
          subHeaderComponent={subHeader}
          persistTableHead
          responsive={true}
        />
      </Flex>

      {isOpen && <LegalModal isOpen={isOpen} onClose={onClose} />}
    </>
  )
}

export default LegalTable
