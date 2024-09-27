import { useCallback, useMemo, useState } from 'react'
import DataTable from 'react-data-table-component'
import { useParams } from 'react-router-dom'
import { customStyles, getFullDateAndTime, timeSince } from 'utils'
import DeleteModal from 'views/Dashboard/Support/DeleteModal'
import StatusModal from 'views/Dashboard/Support/StatusModal'
import SupportModal from 'views/Dashboard/Support/SupportModal'
import SearchFilter from 'views/Sbom/components/SearchFilter'

import { CheckIcon } from '@chakra-ui/icons'
import {
  Flex,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Portal,
  Stack,
  Tag,
  Text,
  Tooltip,
  useDisclosure
} from '@chakra-ui/react'

import CustomLoader from 'components/CustomLoader'
import RefreshBtn from 'components/Icons/RefreshBtn'
import CpeCard from 'components/Misc/CpeCard'
import LynkSwitch from 'components/Misc/LynkSwitch'
import PurlCard from 'components/Misc/PurlCard'
import Pagination from 'components/Pagination'

import { usePaginatedQuery } from 'hooks/usePaginatedQuery'
import useQueryParam from 'hooks/useQueryParam'
import { useThemeColor } from 'hooks/useThemeColors'

import { GetSbomSupportTab } from 'graphQL/Queries'

import { FaEllipsisV } from 'react-icons/fa'
import { FaPlus } from 'react-icons/fa6'

const Support = ({ sbomData }) => {
  const params = useParams()
  const projectId = params.productid
  const sbomId = params.sbomid
  const activeTab = useQueryParam('tab')

  const isArchived = sbomData?.lifecycle === 'archived'

  const { headingTextColor, primaryTextColor, primaryErrorColor } =
    useThemeColor(['headingTextColor', 'primaryTextColor', 'primaryErrorColor'])

  const { isOpen, onOpen, onClose } = useDisclosure()
  const {
    isOpen: isActiveOpen,
    onOpen: onActiveOpen,
    onClose: onActiveClose
  } = useDisclosure()
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose
  } = useDisclosure()
  const {
    isOpen: isCardOpen,
    onOpen: onCardOpen,
    onClose: onCardClose
  } = useDisclosure()

  const [filters, setFilters] = useState({})
  const [activeRow, setActiveRow] = useState(null)
  const [filterText, setFilterText] = useState('')

  const { nodes, paginationProps, loading, reset } = usePaginatedQuery(
    GetSbomSupportTab,
    {
      skip: activeTab === 'support' ? false : true,
      selector: 'sbom.supports',
      variables: {
        sbomId,
        projectId: projectId,
        ...filters
      }
    }
  )

  const setSearchFilter = useCallback(
    (value) => {
      setFilters((oldFilter) => ({
        ...oldFilter,
        search: value
      }))
      reset()
    },
    [reset]
  )

  // CLEAR SERACH
  const handleClear = useCallback(() => {
    setFilterText('')
    setFilters((oldFilter) => ({
      ...oldFilter,
      search: undefined
    }))
    reset()
  }, [reset])

  // ON SEARCH INPUT CHANGE
  const onSearchInputChange = useCallback(
    (e) => {
      const { value } = e.target
      if (value === '') {
        handleClear()
      } else {
        setFilterText(value)
      }
    },
    [handleClear]
  )

  // SEARCH COMPONENT
  const handleSearch = useCallback(
    (event) => {
      const {
        key,
        target: { value }
      } = event
      if (key === 'Enter') {
        setSearchFilter(value)
      }
    },
    [setSearchFilter]
  )

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
          id='support'
          filterText={filterText}
          onChange={onSearchInputChange}
          onClear={handleClear}
          onFilter={handleSearch}
        />
        <Stack spacing={2} alignItems={'center'} direction={'row'}>
          {!sbomId && (
            <Tooltip label='Create Support'>
              <IconButton
                colorScheme='blue'
                onClick={() => {
                  setActiveRow(null)
                  onOpen()
                }}
                icon={<FaPlus />}
              />
            </Tooltip>
          )}
          <RefreshBtn onClick={() => reset()} />
        </Stack>
      </Flex>
    )
  }, [
    filterText,
    onSearchInputChange,
    handleClear,
    handleSearch,
    sbomId,
    onOpen,
    reset
  ])

  const getColor = (eolDate) => {
    const currentDate = new Date()
    const sixMonthsFromToday = new Date()
    sixMonthsFromToday.setMonth(sixMonthsFromToday.getMonth() + 6)

    if (new Date(eolDate) <= currentDate) {
      return 'red'
    } else if (new Date(eolDate) <= sixMonthsFromToday) {
      return 'orange'
    } else {
      return 'green'
    }
  }

  // COLUMNS
  const columns = [
    {
      id: 'COMPONENT_SUPPORT_OVERRIDES_ENABLED',
      name: 'ACTIVE',
      selector: (row) => {
        const { enabled } = row
        return (
          <LynkSwitch
            size='md'
            isChecked={enabled}
            onChange={() => {
              setActiveRow(row)
              onActiveOpen()
            }}
          />
        )
      },
      width: '8%',
      omit: sbomId ? true : false,
      sortable: true
    },
    {
      id: 'COMPONENT_SUPPORT_OVERRIDES_PRODUCT_NAME',
      name: 'PRODUCT',
      selector: (row) => {
        return (
          <Stack my={4}>
            <Text color={primaryTextColor}>
              {row?.productName || row?.name}
            </Text>
            <Text color={primaryTextColor}>
              {row?.productVersion || row?.version}
            </Text>
          </Stack>
        )
      },
      wrap: true,
      width: '20%',
      sortable: true
    },
    {
      id: 'IDS',
      name: 'IDS',
      selector: (row) => (
        <Text
          my={4}
          color={primaryTextColor}
          cursor={'pointer'}
          onClick={() => {
            setActiveRow(row)
            onCardOpen()
          }}
        >
          {row?.idUri}
        </Text>
      ),
      wrap: true,
      width: '20%'
    },
    {
      id: 'COMPONENT_SUPPORT_OVERRIDES_PRODUCT_VERSION',
      name: 'VERSION',
      selector: (row) => (
        <Text color={primaryTextColor}>{row?.productVersion}</Text>
      ),
      width: '12%',
      wrap: true,
      sortable: true,
      omit: true
    },
    {
      id: 'DEPRECATED',
      name: 'DEPRECATED',
      selector: (row) =>
        row?.deprecated ? <CheckIcon color={primaryErrorColor} /> : '',
      width: '12%',
      wrap: true
    },
    {
      id: 'OUTDATED',
      name: 'OUTDATED',
      selector: (row) =>
        row?.outdated ? <CheckIcon color={primaryErrorColor} /> : '',
      width: '12%',
      wrap: true
    },
    {
      id: 'EOL_INFOS_EOL_DATE',
      name: 'END-OF-LIFE',
      selector: (row) => {
        const { eol } = row
        return (
          <Tag variant='solid' colorScheme={getColor(eol)} hidden={!eol}>
            {eol}
          </Tag>
        )
      },
      width: '12%',
      wrap: true
    },
    {
      id: 'EOL_INFOS_EOL_SUPPORT',
      name: 'END-OF-SERVICE',
      selector: (row) => {
        const { eos } = row
        return (
          <Tag variant='solid' colorScheme={getColor(eos)} hidden={!eos}>
            {eos}
          </Tag>
        )
      },
      width: '12%',
      wrap: true
    },
    // UPDATED AT
    {
      id: 'COMPONENT_SUPPORT_OVERRIDES_UPDATED_AT',
      name: 'UPDATED',
      selector: (row) => (
        <Tooltip label={getFullDateAndTime(row?.updatedAt)} placement={'top'}>
          <Text color={primaryTextColor}>
            {row?.updatedAt ? timeSince(row?.updatedAt) : ''}
          </Text>
        </Tooltip>
      ),
      right: 'true',
      wrap: true,
      sortable: true,
      sortFunction: (a, b) => {
        const dateA = new Date(a.updatedAt)
        const dateB = new Date(b.updatedAt)
        return dateA - dateB
      }
    },
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
              color='gray.400'
            />
            <Portal>
              <MenuList fontSize={'sm'}>
                {/* EDIT SUPPORT */}
                <MenuItem
                  onClick={() => {
                    setActiveRow(row)
                    onOpen()
                  }}
                >
                  Edit Support
                </MenuItem>
                {/* DELETE SUPPORT  */}
                <MenuItem
                  color='red'
                  onClick={() => {
                    setActiveRow(row)
                    onDeleteOpen()
                  }}
                >
                  Delete Support
                </MenuItem>
              </MenuList>
            </Portal>
          </Menu>
        )
      },
      width: '8%',
      right: 'true',
      omit: sbomId || isArchived ? true : false
    }
  ]

  return (
    <>
      <Flex flexDir={'column'} width={'100%'}>
        <DataTable
          columns={columns}
          data={nodes || []}
          customStyles={customStyles(headingTextColor)}
          defaultSortFieldId={filters.field}
          defaultSortAsc={false}
          progressPending={loading}
          persistTableHead
          subHeader
          subHeaderComponent={subHeader}
          progressComponent={<CustomLoader />}
          responsive={true}
        />

        {/* PAGINATION */}
        <Pagination {...paginationProps} />
      </Flex>

      {isOpen && (
        <SupportModal
          supports={nodes}
          data={activeRow}
          isOpen={isOpen}
          onClose={onClose}
        />
      )}

      {isDeleteOpen && (
        <DeleteModal
          data={activeRow}
          isOpen={isDeleteOpen}
          onClose={onDeleteClose}
        />
      )}

      {isActiveOpen && (
        <StatusModal
          data={activeRow}
          isOpen={isActiveOpen}
          onClose={onActiveClose}
        />
      )}

      {isCardOpen && activeRow?.idUri?.startsWith('pkg') && (
        <PurlCard
          value={activeRow?.idUri}
          isOpen={isCardOpen}
          onClose={onCardClose}
        />
      )}

      {isCardOpen && activeRow?.idUri?.startsWith('cpe') && (
        <CpeCard
          value={activeRow?.idUri}
          isOpen={isCardOpen}
          onClose={onCardClose}
        />
      )}
    </>
  )
}

export default Support
