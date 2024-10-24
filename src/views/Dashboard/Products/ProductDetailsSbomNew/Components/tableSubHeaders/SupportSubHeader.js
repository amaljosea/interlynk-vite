import { useMemo } from 'react'
import SearchFilter from 'views/Sbom/components/SearchFilter'

import { Flex, IconButton, Stack, Tooltip } from '@chakra-ui/react'

import RefreshBtn from 'components/Icons/RefreshBtn'

import { FaPlus } from 'react-icons/fa'

const SupportSubHeader = (
  filterText,
  onSearchInputChange,
  handleClear,
  handleSearch,
  sbomId,
  onOpen,
  reset,
  setActiveRow
) => {
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
    reset,
    setActiveRow
  ])

  return subHeader
}

export default SupportSubHeader
