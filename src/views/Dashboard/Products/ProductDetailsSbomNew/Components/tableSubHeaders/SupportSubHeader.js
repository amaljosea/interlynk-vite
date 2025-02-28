import { useMemo } from 'react'
import { isCustomerView } from 'utils'
import SupportFilters from 'views/Customer/Sbom/SupportFilters'
import ExportCsv from 'views/Dashboard/Products/components/ExportCsv'
import SearchFilter from 'views/Sbom/components/SearchFilter'

import { Flex, Stack } from '@chakra-ui/react'

import RefreshBtn from 'components/Icons/RefreshBtn'

const SupportSubHeader = ({
  reset,
  filterText,
  handleSearch,
  handleClear,
  onSearchInputChange
}) => {
  const customerView = isCustomerView()

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
          {!customerView && <ExportCsv tableType='SBOM Support View' />}
          <RefreshBtn onClick={() => reset()} />
        </Stack>
      </Flex>
    )
  }, [
    customerView,
    filterText,
    handleClear,
    handleSearch,
    onSearchInputChange,
    reset
  ])

  return subHeader
}

export default SupportSubHeader
