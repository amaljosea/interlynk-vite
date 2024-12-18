import { useMemo } from 'react'
import SearchFilter from 'views/Sbom/components/SearchFilter'

import { Flex, IconButton, Stack, Tooltip } from '@chakra-ui/react'

import RefreshBtn from 'components/Icons/RefreshBtn'

import { FaCheckDouble } from 'react-icons/fa'

import CheckFilters from '../../CheckFilters'

const ChecksSubHeader = (
  checkSearch,
  onSearchInputChange,
  handleSearch,
  handleClear,
  filterHead,
  reset,
  handleReCheck,
  isArchived,
  editChecks
) => {
  const subHeader = useMemo(() => {
    return (
      <Flex
        width={'100%'}
        alignItems={'center'}
        justifyContent={'space-between'}
      >
        <Stack
          width={'100%'}
          direction={'row'}
          spacing={3}
          alignItems={'flex-start'}
        >
          {/* SEARCH COMPONENTS */}
          <SearchFilter
            id='healthcheck'
            filterText={checkSearch}
            onChange={onSearchInputChange}
            onFilter={handleSearch}
            onClear={handleClear}
          />

          {/* FILTER COMPONENTS BASED ON ECOSYSTEM */}
          {filterHead && (
            <CheckFilters reset={reset} filters={filterHead?.sbom?.filters} />
          )}
        </Stack>

        <Stack spacing={2} direction={'row'}>
          <Tooltip label='Re-Check'>
            <IconButton
              fontSize={'sm'}
              variant='solid'
              colorScheme='blue'
              fontWeight='normal'
              onClick={handleReCheck}
              hidden={isArchived}
              isDisabled={!editChecks}
              icon={<FaCheckDouble size={16} />}
            />
          </Tooltip>
          <RefreshBtn />
        </Stack>
      </Flex>
    )
  }, [
    isArchived,
    checkSearch,
    onSearchInputChange,
    handleSearch,
    handleClear,
    filterHead,
    handleReCheck,
    editChecks,
    reset
  ])

  return subHeader
}

export default ChecksSubHeader
