import {
  Box,
  Button,
  Flex,
  IconButton,
  Select,
  Stack,
  Text,
  Tooltip
} from '@chakra-ui/react'
import CustomLoader from 'components/CustomLoader'
import DataTable from 'react-data-table-component'
import { useMemo, useState } from 'react'
import SearchFilter from 'views/Sbom/components/SearchFilter'
import { FaCheckDouble } from 'react-icons/fa6'
import { customStyles } from 'utils'
import { BiSolidWrench } from 'react-icons/bi'
import { GoSkip } from 'react-icons/go'
import { useGlobalState } from 'hooks/useGlobalState'

const SupportTable = ({ data }) => {
  const { totalRows } = useGlobalState()
  const [searchInput, setSearchInput] = useState('')

  // SEARCH COMPONENT
  const handleSearch = () => console.log('hello')
  // CLEAR SERACH
  const handleClear = () => setSearchInput('')
  // SUB HEADER
  const subHeader = useMemo(() => {
    return (
      <Flex
        width={'100%'}
        alignItems={'center'}
        justifyContent={'space-between'}
      >
        {/* SEARCH COMPONENTS */}
        <SearchFilter
          id='team'
          filterText={searchInput}
          setFilterText={setSearchInput}
          onFilter={handleSearch}
          onClear={handleClear}
        />

        <Tooltip label='Refresh'>
          <IconButton colorScheme='blue' icon={<FaCheckDouble />}></IconButton>
        </Tooltip>
      </Flex>
    )
  }, [searchInput, handleSearch, handleClear])
  // COLUMNS
  const columns = [
    {
      id: 'COMPONENT',
      name: 'COMPONENT',
      selector: (row) => '',
      wrap: true,
      width: '200px'
    },
    {
      id: 'VERSION',
      name: 'VERSION',
      selector: (row) => '',
      width: '200px',
      wrap: true
    },
    {
      id: 'LTS',
      name: 'LTS',
      selector: (row) => '',
      width: '200px'
    },
    {
      id: 'END-OF-LIFE',
      name: 'END-OF-LIFE',
      selector: (row) => '',
      width: '250px'
    },
    {
      id: 'END-OF-SERVICE',
      name: 'END-OF-SERVICE',
      selector: (row) => '',
      width: '250px'
    },
    {
      id: 'ACTION',
      name: 'ACTION',
      selector: (row) => {
        return (
          <Stack direction={'row'} alignItems={'center'} spacing={2}>
            <Tooltip label='Fix'>
              <IconButton
                size='sm'
                variant='solid'
                colorScheme='blue'
                fontWeight='normal'
                icon={<BiSolidWrench size={18} />}
              />
            </Tooltip>

            <Tooltip label='Ignore'>
              <IconButton
                size='sm'
                variant='solid'
                colorScheme='blue'
                fontWeight='normal'
                icon={<GoSkip size={18} />}
              />
            </Tooltip>
          </Stack>
        )
      },
      right: 'true'
    }
  ]

  return (
    <Flex flexDir={'column'} width={'100%'}>
      <DataTable
        columns={columns}
        data={data?.nodes || []}
        customStyles={customStyles}
        persistTableHead
        subHeader
        subHeaderComponent={subHeader}
        progressComponent={<CustomLoader />}
        responsive={true}
      />

      <Flex
        width={'100%'}
        flexDir={'row'}
        gap={4}
        alignItems={'center'}
        mt={6}
        justifyContent={'space-between'}
        flexWrap={'wrap'}
      >
        <Stack alignItems={'center'} direction={'row'} spacing={4}>
          <Button colorScheme='blue' isDisabled>
            Prev
          </Button>
          <Button colorScheme='blue' isDisabled>
            Next
          </Button>
          <Box>
            Page {1} of {1}
          </Box>
        </Stack>

        <Stack alignItems={'center'} direction={'row'} spacing={4}>
          <Text>Show</Text>
          <Select width={20} value={totalRows} id='rowlimit' name='rowlimit'>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </Select>
        </Stack>
      </Flex>
    </Flex>
  )
}

export default SupportTable
