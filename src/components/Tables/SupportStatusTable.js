import { useCallback, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getFullDate, setIntensity, timeSince } from 'utils'
import { supportLevels } from 'variables/general'
import SupportExpand from 'views/Dashboard/Products/ProductDetailsSbomNew/Components/tableExpanded/SupportExpanded'
import SearchFilter from 'views/Sbom/components/SearchFilter'

import { Flex, Text, Tooltip } from '@chakra-ui/react'
import { Tag, TagLabel } from '@chakra-ui/react'
import {
  Menu,
  MenuItemOption,
  MenuList,
  MenuOptionGroup
} from '@chakra-ui/react'
import { useDisclosure } from '@chakra-ui/react'
import { IconButton, Stack, chakra } from '@chakra-ui/react'

import RefreshBtn from 'components/Icons/RefreshBtn'
import LynkBadge from 'components/LynkBadge'
import LynkTable from 'components/LynkTable'
import MenuHeading from 'components/Misc/MenuHeading'
import PartInfo from 'components/Misc/PartInfo'
import SupportStatus from 'components/Modal/SupportStatus'
import Pagination from 'components/Pagination'

import { usePaginatedQuery } from 'hooks/usePaginatedQuery'
import useQueryParam from 'hooks/useQueryParam'
import { useRouteFlags } from 'hooks/useRouteFlags'
import { useThemeColor } from 'hooks/useThemeColors'

import { GetCompSupportData } from 'graphQL/Queries'

import { FaPen } from 'react-icons/fa6'

const SupportStatusTable = () => {
  const params = useParams()
  const projectId = params.productid
  const activeTab = useQueryParam('tab')
  const { isCustomerView } = useRouteFlags()

  const { primaryTextColor, secondaryTextColor } = useThemeColor([
    'primaryTextColor',
    'secondaryTextColor'
  ])

  const STATUS = useDisclosure()

  const [toggleClear, setToggleClear] = useState(false)
  const [selectedItems, setSelectedItems] = useState([])
  const [searchInput, setSearchInput] = useState('')
  const [supportData, setSupportData] = useState({
    search: '',
    supportLevel: [],
    include: ['parts'],
    orderBy: {
      field: 'COMPONENT_SUPPORT_LEVELS_UPDATED_AT',
      direction: 'DESC'
    }
  })

  const { search, supportLevel, orderBy, include } = supportData || {}

  const { nodes, paginationProps, loading, reset } = usePaginatedQuery(
    GetCompSupportData,
    {
      skip: activeTab === 'support status' ? false : true,
      selector: 'componentSupportLevel',
      variables: {
        projectId: projectId,
        search: search !== '' ? search : undefined,
        supportLevel: supportLevel?.length > 0 ? supportLevel : undefined,
        includeParts: include?.includes('parts') ? true : undefined,
        orderBy: orderBy
      }
    }
  )

  // CLEAR SEARCH
  const handleClear = useCallback(async () => {
    setSearchInput('')
    setSupportData((prev) => ({ ...prev, search: '' }))
  }, [])

  // ON SEARCH INPUT CHANGE
  const onSearchInputChange = useCallback(
    (e) => {
      const { value } = e.target
      if (value === '') {
        handleClear()
      } else {
        setSearchInput(value)
      }
    },
    [handleClear]
  )

  // SEARCH COMPONENT
  const handleSearch = useCallback(async (event) => {
    const { value } = event.target
    if (event.key === 'Enter') {
      setSupportData((prev) => ({ ...prev, search: value }))
    }
  }, [])

  const handleSelect = (state) => setSelectedItems(state?.selectedRows)

  const handleSort = async (column, sortDirection) => {
    setSupportData((prev) => ({
      ...prev,
      orderBy: {
        field: column.id,
        direction: sortDirection === 'asc' ? 'ASC' : 'DESC'
      }
    }))
  }

  const columns = [
    {
      id: 'COMPONENT_SUPPORT_LEVELS_UPDATED_AT',
      name: 'NAME',
      sortable: true,
      wrap: true,
      width: '25%',
      selector: (row) => {
        const { occurrences } = row || {}
        const { name, isPart, componentSupportLevel } = occurrences[0] || {}

        return (
          <Stack my={3} spacing={1}>
            <Text color={primaryTextColor}>{name}</Text>
            <Flex gap={2} alignItems={'center'} flexWrap={'wrap'}>
              {isPart && (
                <Tooltip label={<PartInfo data={occurrences || []} />}>
                  <chakra.span>
                    <LynkBadge color='blue' title='Part' />
                  </chakra.span>
                </Tooltip>
              )}
              <Text hidden={!isPart} color={secondaryTextColor}>
                •
              </Text>
              {componentSupportLevel && (
                <Tooltip
                  placement={'top'}
                  label={getFullDate(componentSupportLevel?.updatedAt)}
                >
                  <Text color={secondaryTextColor}>
                    {timeSince(componentSupportLevel?.updatedAt)}
                  </Text>
                </Tooltip>
              )}
            </Flex>
          </Stack>
        )
      },
      sortFunction: (a, b) => {
        const dateA = new Date(a[0]?.componentSupportLevel?.updatedAt)
        const dateB = new Date(b[0]?.componentSupportLevel?.updatedAt)
        return dateA - dateB
      }
    },
    {
      id: 'SUPPORT_ASSESSMENT',
      name: 'ASSESSMENT',
      wrap: true,
      selector: (row) => {
        const { occurrences } = row || {}
        const { componentSupportLevel } = occurrences[0] || {}
        return (
          <Text color={primaryTextColor}>
            {componentSupportLevel?.user ? 'Manual' : 'Automatic'}
          </Text>
        )
      }
    },
    {
      id: 'COMPONENT_SUPPORT_LEVELS_LEVEL',
      name: 'LEVEL',
      sortable: true,
      selector: (row) => {
        const { occurrences } = row || {}
        const { componentSupportLevel } = occurrences[0] || {}
        const { level } = componentSupportLevel || {}
        const supportLevel = level ? level?.replaceAll('_', ' ') : 'N/A'

        if (supportLevel) {
          return (
            <Flex gap={2} alignItems={'center'}>
              <Tag w={'184px'} colorScheme={setIntensity(level)}>
                <TagLabel mx={'auto'} textTransform={'capitalize'}>
                  {supportLevel?.replaceAll('_', ' ')}{' '}
                </TagLabel>
              </Tag>
              {occurrences?.length > 1 && (
                <Text color={primaryTextColor}>+{occurrences?.length}</Text>
              )}
            </Flex>
          )
        }
        return (
          <Tag>
            <TagLabel mx={'auto'}>N/A</TagLabel>
          </Tag>
        )
      }
    },
    {
      id: 'COMPONENT_SUPPORT_LEVELS_END_DATE',
      name: 'END OF SUPPORT',
      sortable: true,
      wrap: true,
      right: 'true',
      selector: (row) => {
        const { occurrences } = row || {}
        const { componentSupportLevel } = occurrences[0] || {}
        const { endDate } = componentSupportLevel || {}
        if (endDate) {
          return (
            <Text color={primaryTextColor}>
              {new Date(endDate).toLocaleDateString()}
            </Text>
          )
        }
        return <Text color={primaryTextColor}>N/A</Text>
      },
      sortFunction: (a, b) => {
        const dateA = new Date(a?.componentSupportLevel?.endDate)
        const dateB = new Date(b?.componentSupportLevel?.endDate)
        return dateA - dateB
      }
    }
  ]

  // HEADER SECTION
  const SubHeader = useMemo(() => {
    const onFilterSupport = (value) => {
      setSupportData((prev) => ({
        ...prev,
        supportLevel: [...value]?.includes('all') ? [] : value
      }))
      reset()
    }

    const onFilterInclude = (value) => {
      setSupportData((prev) => ({
        ...prev,
        include: value || []
      }))
      reset()
    }

    const handleStatus = () => STATUS.onOpen()

    return (
      <Flex w={'100%'} alignItems={'center'} justifyContent={'space-between'}>
        <Flex gap={2} flexWrap={'wrap'}>
          <SearchFilter
            onClear={handleClear}
            onFilter={handleSearch}
            filterText={searchInput}
            id='global_support_status'
            onChange={onSearchInputChange}
          />
          <Menu closeOnSelect={false} isLazy>
            <MenuHeading
              title={'Support'}
              active={
                supportLevel?.length !== 0 && !supportLevel.includes('all')
              }
            />
            <MenuList
              minH='auto'
              maxH={'350px'}
              minW={'300px'}
              fontSize={'sm'}
              overflowY={'scroll'}
            >
              <MenuOptionGroup
                type={'checkbox'}
                value={supportLevel}
                onChange={onFilterSupport}
              >
                {supportLevels?.map((item) => (
                  <MenuItemOption
                    key={item?.id}
                    fontSize={'sm'}
                    value={item?.value}
                  >
                    {item?.label}
                  </MenuItemOption>
                ))}
              </MenuOptionGroup>
            </MenuList>
          </Menu>
          <Menu closeOnSelect={false}>
            <MenuHeading title={'Include'} active={include?.length !== 0} />
            <MenuList fontSize={'sm'}>
              <MenuOptionGroup
                type='checkbox'
                value={include}
                onChange={onFilterInclude}
              >
                <MenuItemOption value={'parts'} fontSize={'sm'}>
                  Parts
                </MenuItemOption>
              </MenuOptionGroup>
            </MenuList>
          </Menu>
        </Flex>
        <Flex gap={2} flexWrap={'wrap'} justifyContent='flex-end'>
          {!isCustomerView && selectedItems?.length > 0 && (
            <Tooltip label={'Set Status'}>
              <IconButton
                icon={<FaPen />}
                colorScheme='blue'
                onClick={handleStatus}
              />
            </Tooltip>
          )}
          <RefreshBtn onClick={() => reset()} />
        </Flex>
      </Flex>
    )
  }, [
    STATUS,
    handleClear,
    handleSearch,
    include,
    isCustomerView,
    onSearchInputChange,
    reset,
    searchInput,
    selectedItems?.length,
    supportLevel
  ])

  const handleReset = () => {
    setSelectedItems([])
    setToggleClear(true)
    STATUS.onClose()
    reset()
  }

  return (
    <>
      <Flex flexDir={'column'} width={'100%'}>
        <LynkTable
          subHeader
          expandableRows
          selectableRows
          columns={columns}
          data={nodes || []}
          expandOnRowClicked
          onSort={handleSort}
          progressPending={loading}
          subHeaderComponent={SubHeader}
          clearSelectedRows={toggleClear}
          className='data-table-container'
          onSelectedRowsChange={handleSelect}
          expandableRowsComponent={SupportExpand}
          defaultSortFieldId={'COMPONENT_SUPPORT_LEVELS_UPDATED_AT'}
        />

        {/* PAGINATION */}
        <Pagination {...paginationProps} />
      </Flex>

      {STATUS.isOpen && selectedItems?.length > 0 && (
        <SupportStatus
          isOpen={STATUS.isOpen}
          onClose={STATUS.onClose}
          handleClear={handleReset}
          selectedItems={selectedItems}
          setToggleClear={setToggleClear}
        />
      )}
    </>
  )
}

export default SupportStatusTable
