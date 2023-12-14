import { AddIcon, ExternalLinkIcon } from '@chakra-ui/icons'
import {
  Flex,
  Tag,
  Text,
  Stack,
  Button,
  Box,
  Link,
  TagLabel,
  Icon,
  Tooltip,
  IconButton,
  useDisclosure
} from '@chakra-ui/react'
import CustomLoader from 'components/CustomLoader'
import { useMemo, useState } from 'react'
import DataTable from 'react-data-table-component'
import LicenseDrawer from 'views/Dashboard/Linceses/components/LicenseDrawer'
import LicenseFilter from 'views/Dashboard/Linceses/components/LicenseFilter'
import RowLimit from 'views/Sbom/components/RowLimit'
import SearchFilter from 'views/Sbom/components/SearchFilter'
import { customStyles } from 'utils'

const LicenseTable = ({ data }) => {
  const [searchInput, setSearchInput] = useState('')

  // SEARCH COMPONENT
  const handleSearch = async () => {}

  // CLEAR SERACH
  const handleClear = async () => {
    setSearchInput('')
  }

  const { isOpen, onOpen, onClose } = useDisclosure()

  const subHeaderComponent = useMemo(() => {
    return (
      <Flex width={'100%'} alignItems={'center'} gap={3}>
        <Stack
          width={'100%'}
          direction={'row'}
          spacing={4}
          alignItems={'center'}
        >
          <SearchFilter
            id='license'
            filterText={searchInput}
            setFilterText={setSearchInput}
            onFilter={handleSearch}
            onClear={handleClear}
          />
          <LicenseFilter />
        </Stack>

        {/* ADD LICNESE */}
        <Tooltip label='Add License'>
          <IconButton
            onClick={onOpen}
            icon={<AddIcon />}
            colorScheme='blue'
            variant='solid'
            fontWeight='normal'
            fontSize={'sm'}
          />
        </Tooltip>
      </Flex>
    )
  }, [searchInput, handleClear, handleSearch])

  // COLUMNS
  const columns = [
    // NAME
    {
      id: 'NAME',
      name: 'NAME',
      wrap: true,
      selector: (row) => {
        const { reference, name } = row
        return (
          <Flex direction='row' alignItems={'center'} gap={2}>
            <Link href={reference} isExternal>
              <Icon
                as={ExternalLinkIcon}
                h={'16px'}
                w={'16px'}
                color={'blue.500'}
              />
            </Link>
            <Text my={3} fontWeight={'medium'}>
              {name}
            </Text>
          </Flex>
        )
      }
    },
    // SPDX ID
    {
      id: 'SPDX_ID',
      name: 'SPDX ID',
      selector: (row) => {
        const { licenseId } = row
        return (
          <>
            <Tag variant='subtle'>
              <TagLabel style={{ textTransform: 'capitalize' }} mx={'auto'}>
                {licenseId}
              </TagLabel>
            </Tag>
          </>
        )
      }
    },
    // SOURCE
    {
      id: 'OSI',
      name: 'OSI',
      selector: (row) => {
        const { isOsiApproved } = row
        return <Text>{isOsiApproved ? 'Yes' : 'No'}</Text>
      }
    },
    // FSF
    {
      id: 'FSF',
      name: 'FSF',
      selector: (row) => {
        const { fsf } = row
        return <Text>{fsf ? 'Yes' : 'No'}</Text>
      }
    },
    // CUSTOM
    {
      id: 'CUSTOM',
      name: 'CUSTOM',
      selector: (row) => {
        const { custom } = row
        return <Text>{custom ? 'Yes' : 'No'}</Text>
      }
    },
    // Products
    {
      id: 'STATUS',
      name: 'STATUS',
      selector: (row) => {
        const { status } = row
        return (
          <Tag
            size='md'
            variant='solid'
            colorScheme={
              status === 'approved'
                ? 'green'
                : status === 'rejected'
                ? 'red'
                : 'blue'
            }
            width={'110px'}
          >
            <TagLabel mx={'auto'} textTransform={'capitalize'}>
              {status}
            </TagLabel>
          </Tag>
        )
      }
    }
  ]

  return (
    <>
      <Flex flexDir={'column'} width={'100%'}>
        <DataTable
          columns={columns}
          data={data}
          customStyles={customStyles}
          defaultSortAsc={false}
          defaultSortFieldId={'UPDATED_AT'}
          progressPending={data ? false : true}
          progressComponent={<CustomLoader />}
          subHeader
          subHeaderComponent={subHeaderComponent}
          responsive
          persistTableHead
        />
      </Flex>

      {/* PAGINATION */}
      {data && (
        <Flex
          flexDir={'row'}
          gap={4}
          alignItems={'center'}
          mt={6}
          justifyContent={'space-between'}
        >
          <Stack alignItems={'center'} direction={'row'} spacing={4}>
            <Button colorScheme='blue'>Previous</Button>
            <Button colorScheme='blue'>Next</Button>
            <Box>Page 1 of 1</Box>
          </Stack>
          <RowLimit name='licenses' />
        </Flex>
      )}

      {isOpen && <LicenseDrawer isOpen={isOpen} onClose={onClose} />}
    </>
  )
}

export default LicenseTable
