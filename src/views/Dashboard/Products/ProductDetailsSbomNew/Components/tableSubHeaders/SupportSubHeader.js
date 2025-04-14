import { useMemo } from 'react'
import ExportCsv from 'views/Dashboard/Products/components/ExportCsv'
import SearchFilter from 'views/Sbom/components/SearchFilter'

import { Flex, IconButton, Stack, Tooltip } from '@chakra-ui/react'

import RefreshBtn from 'components/Icons/RefreshBtn'

import { useHasPermission } from 'hooks/useHasPermission'
import { useRouteFlags } from 'hooks/useRouteFlags'

import { BiScan } from 'react-icons/bi'
import { FaPen } from 'react-icons/fa6'

import SupportFilters from '../../SupportFilters'

const SupportSubHeader = ({
  reset,
  action,
  filterText,
  handleSearch,
  handleClear,
  onSearchInputChange,
  selectedItems,
  supportData
}) => {
  const { isCustomerView } = useRouteFlags()

  const editComponent = useHasPermission({
    parentKey: 'view_sbom',
    childKey: 'update_sbom_components'
  })

  const withSupport = selectedItems?.filter(
    (component) => component?.componentSupportLevel !== null
  )
  const withoutSupport = selectedItems?.filter(
    (component) => component?.componentSupportLevel === null
  )

  const notAllowed = withSupport?.length > 0 && withoutSupport?.length > 0
  const info = notAllowed
    ? 'Create and update at the same time is not allowed'
    : 'Set Status'

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
          {!isCustomerView && (
            <Tooltip placement='left' label={'Rerun Support Analysis'}>
              <IconButton
                icon={<BiScan size={20} />}
                colorScheme='blue'
                isDisabled={!editComponent}
                onClick={() => action('rerun_support_analysis', null)}
              />
            </Tooltip>
          )}
          {!isCustomerView && selectedItems?.length > 0 && (
            <Tooltip placement='left' label={info}>
              <IconButton
                icon={<FaPen />}
                colorScheme='blue'
                isDisabled={notAllowed || !editComponent}
                onClick={() => action('view_support_modal', null)}
              />
            </Tooltip>
          )}
          {!isCustomerView && (
            <ExportCsv
              tableType='Support Status View'
              filters={{ ...supportData }}
            />
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
    reset,
    isCustomerView,
    editComponent,
    selectedItems?.length,
    info,
    notAllowed,
    supportData,
    action
  ])

  return subHeader
}

export default SupportSubHeader
