import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import SearchFilter from 'views/Sbom/components/SearchFilter'

import { Flex, IconButton, Stack, Tooltip } from '@chakra-ui/react'

import RefreshBtn from 'components/Icons/RefreshBtn'

import { FaPlus } from 'react-icons/fa6'

const SupportSubHeader = (
  reset,
  filterText,
  onSearchInputChange,
  handleClear,
  handleSearch,
  onOpen,
  setActiveRow
) => {
  const params = useParams()

  const subHeader = useMemo(() => {
    return (
      <Flex w={'100%'} alignItems={'center'} justifyContent={'space-between'}>
        {params?.sbomid ? (
          <div></div>
        ) : (
          <SearchFilter
            id='support'
            filterText={filterText}
            onChange={onSearchInputChange}
            onClear={handleClear}
            onFilter={handleSearch}
          />
        )}
        <Stack spacing={2} alignItems={'center'} direction={'row'}>
          {!params?.sbomid && (
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
    handleClear,
    handleSearch,
    onOpen,
    onSearchInputChange,
    params?.sbomid,
    reset,
    setActiveRow
  ])

  return subHeader
}

export default SupportSubHeader
