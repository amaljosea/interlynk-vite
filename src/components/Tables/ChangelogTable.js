import {
  Button,
  Flex,
  Stack,
  Tag,
  TagLabel,
  useDisclosure,
  Input,
  Tooltip,
  Text
} from '@chakra-ui/react'
import GlobalContext from 'context/GlobalContext'
import React, {
  createRef,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react'
import DataTable from 'react-data-table-component'
import { getFullDateAndTime } from 'utils'
import FilterChangelog from 'views/Sbom/components/FilterChangelog'

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

const setColor = (type) => {
  switch (type) {
    case 'added':
      return 'green'
    case 'modified':
      return 'pink'
    case 'deleted':
      return 'red'
  }
}

const FilterComponent = ({ filterText, onFilter, onClear }) => {
  const searchRef = useRef()

  const focusSearchInput = () => {
    if (searchRef?.current) {
      searchRef?.current.focus()
    }
  }

  const handleKeyPress = (e) => {
    if (e.ctrlKey && e.key === '/') {
      focusSearchInput()
    }
  }

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress)

    return () => {
      window.removeEventListener('keydown', handleKeyPress)
    }
  }, [])

  return (
    <>
      <Input
        width={'400px'}
        id='search'
        type='text'
        placeholder='Search'
        aria-label='Search Input'
        ref={searchRef}
      />
    </>
  )
}

const ChangelogTable = ({ data, setFilteredChangelog }) => {
  const { changelogData } = useContext(GlobalContext)

  const [filterText, setFilterText] = useState('')
  const [resetPaginationToggle, setResetPaginationToggle] = useState(false)

  const [filteredItems, setFilteredItems] = useState([])

  useEffect(() => {
    const filterData = data.filter(
      (item) =>
        (item.type &&
          item.type.toLowerCase().includes(filterText.toLowerCase())) ||
        (item.changedBy &&
          item.changedBy.toLowerCase().includes(filterText.toLowerCase()))
    )

    setFilteredItems(filterData)
  }, [filterText])

  const handleChangelogChange = (selectedFilters) => {
    if (
      selectedFilters.type.length === 0 &&
      selectedFilters.user.length === 0
    ) {
      // IF NO FILTER SELECTED RETURN DEFAULT HEALTH CHECK DATA
      setFilteredChangelog(changelogData)
    } else {
      // IF ANY FILTER IS SELECTED RETURN SELECTED DATA
      const filtered = changelogData.filter(
        (item) =>
          (selectedFilters.type.length === 0 ||
            selectedFilters.type.includes(item.type)) &&
          (selectedFilters.user.length === 0 ||
            selectedFilters.user.includes(item.changedBy))
      )
      setFilteredChangelog(filtered)
    }
  }

  const subHeaderComponentMemo = useMemo(() => {
    const handleClear = () => {
      if (filterText) {
        setResetPaginationToggle(!resetPaginationToggle)
        setFilterText('')
      }
    }

    return (
      <Flex
        width={'100%'}
        alignItems={'center'}
        justifyContent={'space-between'}
      >
        <Stack
          width={'100%'}
          direction={'row'}
          spacing={4}
          alignItems={'flex-start'}
        >
          <FilterComponent
            onFilter={(e) => setFilterText(e.target.value)}
            onClear={handleClear}
            filterText={filterText}
          />

          <FilterChangelog onFilterChange={handleChangelogChange} />
        </Stack>
      </Flex>
    )
  }, [filterText, resetPaginationToggle, handleChangelogChange])

  // COLUMNS
  const columns = [
    // TYPE
    {
      id: 'type',
      name: 'TYPE',
      selector: (row) => {
        const { type } = row
        return (
          <Tag
            variant='subtle'
            colorScheme={setColor(type)}
            style={{ width: '80px', margin: 'center' }}
          >
            {type}
          </Tag>
        )
      },
      width: '200px'
    },
    // OBJECT
    {
      id: 'object',
      name: 'OBJECT',
      selector: (row) => {
        const { object } = row
        return (
          <Tooltip label={object} placement='top'>
            <Text>
              {object !== null
                ? `${object?.substring(0, 20)}${
                    object.length > 20 ? '...' : ''
                  }`
                : ''}
            </Text>
          </Tooltip>
        )
      },
      width: '250px'
    },
    // PREV VALUE
    {
      id: 'prevValue',
      name: 'PREVIOUS VALUE',
      selector: (row) => (
        <Tooltip label={row.prevValue} placement='top'>
          <Text>
            {row.prevValue !== ''
              ? `${row.prevValue?.substring(0, 15)}${
                  row.prevValue.length > 15 ? '...' : ''
                }`
              : ''}
          </Text>
        </Tooltip>
      )
    },
    // LONG DESCRIPTION
    {
      id: 'newValue',
      name: 'NEW VALUE',
      selector: (row) => (
        <Tooltip label={row.newValue} placement='top'>
          <Text>
            {row.newValue !== ''
              ? `${row.newValue?.substring(0, 15)}${
                  row.newValue.length > 15 ? '...' : ''
                }`
              : ''}
          </Text>
        </Tooltip>
      )
    },
    // STATUS
    {
      id: 'changedBy',
      name: 'CHANGED BY',
      selector: (row) => row.changedBy
    },
    {
      id: 'time',
      name: 'TIME',
      selector: (row) => <Text>{getFullDateAndTime(row.time)}</Text>
    }
  ]

  return (
    <>
      {data.length > 0 ? (
        <Flex flexDir={'column'} width={'100%'}>
          <DataTable
            columns={columns}
            data={data}
            customStyles={customStyles}
            progressPending={data.length === 0}
            subHeader
            subHeaderComponent={subHeaderComponentMemo}
            responsive={true}
          />
        </Flex>
      ) : (
        <Flex
          width={'100%'}
          mt={4}
          alignItems={'center'}
          justifyContent={'center'}
        >
          <Text>No change log data found</Text>
        </Flex>
      )}
    </>
  )
}

export default ChangelogTable
