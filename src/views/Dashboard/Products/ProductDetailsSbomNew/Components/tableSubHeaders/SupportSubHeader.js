import { useMemo } from 'react'
import { splitBySupportLevel } from 'utils'
import ExportCsv from 'views/Dashboard/Products/components/ExportCsv'
import SearchFilter from 'views/Sbom/components/SearchFilter'

import { Flex, IconButton, Stack, Tooltip } from '@chakra-ui/react'

import RefreshBtn from 'components/Icons/RefreshBtn'

import { useHasPermission } from 'hooks/useHasPermission'
import { useRouteFlags } from 'hooks/useRouteFlags'

import { LuActivity, LuSquarePen } from 'react-icons/lu'

import SupportFilters from '../../SupportFilters'

const SupportSubHeader = ({
  reset,
  action,
  filterText,
  handleSearch,
  handleClear,
  onSearchInputChange,
  selectedItems,
  supportData,
  isInDraft
}) => {
  const { isCustomerView } = useRouteFlags()

  const editComponent = useHasPermission({
    parentKey: 'view_sbom',
    childKey: 'edit_sbom_components'
  })

  const { withSupport, withoutSupport } = splitBySupportLevel(selectedItems)
  const notAllowed = withSupport?.length > 0 && withoutSupport?.length > 0
  const info = notAllowed ? 'Not allowed' : 'Set Status'

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
          {!isCustomerView && !isInDraft && (
            <Tooltip placement='left' label={'Rerun Support Analysis'}>
              <IconButton
                icon={<LuActivity size={18} />}
                colorScheme='blue'
                isDisabled={!editComponent}
                data-testid='rerun_support_analysis'
                onClick={() => action('rerun_support_analysis', null)}
              />
            </Tooltip>
          )}
          {!isCustomerView && selectedItems?.length > 0 && (
            <Tooltip placement='left' label={info}>
              <IconButton
                icon={<LuSquarePen size={18} />}
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
          <RefreshBtn queries={['GetCompSupportData']} />
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
    isInDraft,
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
