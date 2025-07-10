import React, { useMemo } from 'react'
import Filters from 'views/Dashboard/Requests/Filters'
import SearchFilter from 'views/Sbom/components/SearchFilter'

import { Flex, Stack } from '@chakra-ui/react'

import AddButton from 'components/Icons/AddButton'
import RefreshBtn from 'components/Icons/RefreshBtn'

import { useHasPermission } from 'hooks/useHasPermission'

const RequestHeader = ({
  action,
  setFilters,
  filterText,
  handleClear,
  handleSearch,
  onSearchInputChange
}) => {
  const addReq = useHasPermission({
    parentKey: 'view_requests',
    childKey: 'edit_requests'
  })

  return useMemo(() => {
    return (
      <Flex
        width={'100%'}
        alignItems={'center'}
        justifyContent={'space-between'}
      >
        <Stack spacing={3} alignItems={'center'} direction={'row'}>
          {/* SEARCH COMPONENTS */}
          <SearchFilter
            id='support'
            filterText={filterText}
            onChange={onSearchInputChange}
            onClear={handleClear}
            onFilter={handleSearch}
          />
          {/* FILTERS */}
          <Filters setFilters={setFilters} />
        </Stack>
        <Stack spacing={2} alignItems={'center'} direction={'row'}>
          <AddButton
            label='Request SBOM'
            isDisabled={!addReq}
            onClick={() => action('request', null)}
            aria-label='request_sbom'
          />
          <RefreshBtn queries={['GetRequests']} />
        </Stack>
      </Flex>
    )
  }, [
    action,
    addReq,
    filterText,
    handleClear,
    handleSearch,
    onSearchInputChange,
    setFilters
  ])
}

export default RequestHeader
