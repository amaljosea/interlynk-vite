import React, { useMemo } from 'react'
import { isCustomerView } from 'utils'
import ExportCsv from 'views/Dashboard/Products/components/ExportCsv'
import SearchFilter from 'views/Sbom/components/SearchFilter'

import { Flex, IconButton, Tooltip } from '@chakra-ui/react'

import AddButton from 'components/Icons/AddButton'
import RefreshBtn from 'components/Icons/RefreshBtn'

import { RiFundsBoxFill } from 'react-icons/ri'

import CompFilters from '../../CompFilters'

const ComponentsSubHeader = ({
  compSearch,
  handleSearch,
  handleClear,
  onSearchInputChange,
  MAP,
  shouldShowDemoFeatures,
  onCreateComponent,
  restricted,
  signedUrlParams,
  isArchived,
  compData,
  searchInput,
  field,
  direction,
  reset
}) => {
  const customerView = isCustomerView()
  // Use useMemo to memoize the component's JSX
  return useMemo(() => {
    return (
      <Flex w={'100%'} justifyContent={'space-between'}>
        {/* Left Section: Filters and Search */}
        <Flex gap={2} flexWrap={'wrap'}>
          {/* SEARCH COMPONENTS */}
          <SearchFilter
            id='component'
            filterText={compSearch}
            onFilter={handleSearch}
            onClear={handleClear}
            onChange={onSearchInputChange}
          />
          {/* FILTER COMPONENTS BASED ON ECOSYSTEM */}
          <CompFilters reset={reset} />
        </Flex>

        {/* Right Section: Actions */}
        <Flex gap={2}>
          {/* SHOW HEATMAP */}
          {shouldShowDemoFeatures && (
            <Tooltip label='View Health Map'>
              <IconButton
                colorScheme='blue'
                onClick={MAP.onOpen}
                icon={<RiFundsBoxFill />}
                hidden={!shouldShowDemoFeatures}
              />
            </Tooltip>
          )}
          {/* CREATE COMPONENT */}
          {!customerView && (
            <AddButton
              label='Add Component'
              onClick={onCreateComponent}
              name='add_component'
              isDisabled={restricted}
              hidden={signedUrlParams || isArchived}
            />
          )}

          {/* EXPORT CSV */}
          {!customerView && (
            <ExportCsv
              tableType='SBOM Components View'
              filters={{
                ...compData,
                orderBy: searchInput === '' ? { field, direction } : undefined,
                search: searchInput !== '' ? searchInput : undefined
              }}
            />
          )}

          {/* REFRESH */}
          <RefreshBtn onClick={reset} />
        </Flex>
      </Flex>
    )
  }, [
    compSearch,
    handleSearch,
    handleClear,
    onSearchInputChange,
    MAP,
    shouldShowDemoFeatures,
    onCreateComponent,
    restricted,
    signedUrlParams,
    isArchived,
    compData,
    searchInput,
    field,
    direction,
    reset,
    customerView
  ])
}

export default ComponentsSubHeader
