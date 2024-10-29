import { useMemo } from 'react'
import SearchFilter from 'views/Sbom/components/SearchFilter'

import { Flex } from '@chakra-ui/react'

import RefreshBtn from 'components/Icons/RefreshBtn'

import LogFilters from '../../LogFilters'

const ChangeLogSubHeader = (
  logSearch,
  onSearchInputChange,
  handleSearch,
  handleClear,
  activityLogFilters,
  setLogState,
  reset
) => {
  const subHeader = useMemo(() => {
    return (
      <Flex
        sx={{ w: '100%', alignItems: 'center' }}
        justifyContent={'space-between'}
      >
        <Flex sx={{ gap: 3, w: '100%', alignItems: 'flex-start' }}>
          <SearchFilter
            id='changelog'
            filterText={logSearch}
            onChange={onSearchInputChange}
            onFilter={handleSearch}
            onClear={handleClear}
          />
          {/* FILTER COMPONENTS BASED ON ECOSYSTEM */}
          <LogFilters
            filters={activityLogFilters}
            setLogState={(newFilters) => {
              setLogState(newFilters)
              reset()
            }}
          />
        </Flex>

        <RefreshBtn />
      </Flex>
    )
  }, [
    logSearch,
    onSearchInputChange,
    handleSearch,
    handleClear,
    activityLogFilters,
    reset,
    setLogState
  ])

  return subHeader
}

export default ChangeLogSubHeader
