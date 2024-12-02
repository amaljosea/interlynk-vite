import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { isCustomerView } from 'utils'
import ExportCsv from 'views/Dashboard/Products/components/ExportCsv'
import SearchFilter from 'views/Sbom/components/SearchFilter'

import { Flex, Stack } from '@chakra-ui/react'

import AddButton from 'components/Icons/AddButton'
import RefreshBtn from 'components/Icons/RefreshBtn'

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
  const customerView = isCustomerView()

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
            <AddButton
              label='Create Support'
              onClick={() => {
                setActiveRow(null)
                onOpen()
              }}
            />
          )}
          {!customerView && <ExportCsv tableType='SBOM Support View' />}
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
