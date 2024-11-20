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
  reset,
  compBtn
}) => {
  const customerView = isCustomerView()
  // Use useMemo to memoize the component's JSX
  return useMemo(() => {
    return (
      <Flex
        sx={{ w: '100%', alignItems: 'flex-start', gap: 2 }}
        justifyContent={'space-between'}
      >
        {/* Left Section: Filters and Search */}
        <Flex sx={{ flexWrap: 'wrap', gap: 3, alignItems: 'flex-start' }}>
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
        <Flex sx={{ gap: 2, justifyContent: 'flex-end' }}>
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
              ref={compBtn}
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
    compBtn,
    customerView
  ])
}

export default ComponentsSubHeader
