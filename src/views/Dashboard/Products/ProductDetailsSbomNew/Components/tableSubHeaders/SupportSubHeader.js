import { useMemo } from 'react'
import SupportFilters from 'views/Customer/Sbom/SupportFilters'
import ExportCsv from 'views/Dashboard/Products/components/ExportCsv'
import SearchFilter from 'views/Sbom/components/SearchFilter'

import { Flex, IconButton, Stack, Tooltip } from '@chakra-ui/react'

import RefreshBtn from 'components/Icons/RefreshBtn'

import { useRouteFlags } from 'hooks/useRouteFlags'

import { FaPen } from 'react-icons/fa6'

const SupportSubHeader = ({
  reset,
  filterText,
  handleSearch,
  handleClear,
  onSearchInputChange,
  handleStatus,
  selectedItems
}) => {
  const { isCustomerView } = useRouteFlags()

  const subHeader = useMemo(() => {
    return (
      <Flex w={'100%'} alignItems={'center'} justifyContent={'space-between'}>
        <Flex gap={2} flexWrap={'wrap'}>
          <SearchFilter
            id='support'
            filterText={filterText}
            onChange={onSearchInputChange}
            onClear={handleClear}
            onFilter={handleSearch}
          />
          <SupportFilters reset={reset} />
        </Flex>
        <Stack spacing={2} alignItems={'center'} direction={'row'}>
          {!isCustomerView && selectedItems?.length > 0 && (
            <Tooltip label={'Set Status'}>
              <IconButton
                icon={<FaPen />}
                colorScheme='blue'
                onClick={handleStatus}
              />
            </Tooltip>
          )}
          {!isCustomerView && <ExportCsv tableType='SBOM Support View' />}
          <RefreshBtn onClick={() => reset()} />
        </Stack>
      </Flex>
    )
  }, [
    isCustomerView,
    filterText,
    handleClear,
    handleSearch,
    handleStatus,
    onSearchInputChange,
    reset,
    selectedItems?.length
  ])

  return subHeader
}

export default SupportSubHeader
