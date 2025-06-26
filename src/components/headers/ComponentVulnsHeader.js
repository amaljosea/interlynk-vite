import React, { useMemo } from 'react'
import ExportCsv from 'views/Dashboard/Products/components/ExportCsv'
import VulnFilters from 'views/Dashboard/Vulnerabilities/components/VulnsFilter'
import SearchFilter from 'views/Sbom/components/SearchFilter'

import { Flex, IconButton, Stack, Tooltip } from '@chakra-ui/react'

import RefreshBtn from 'components/Icons/RefreshBtn'

import { useHasPermission } from 'hooks/useHasPermission'

import { LuSquarePen } from 'react-icons/lu'

const ComponentVulnsHeader = ({
  STATUS,
  filterInput,
  handleClear,
  handleSearch,
  onSearchInputChange,
  selectedVulns,
  onFilter,
  vulnState,
  prodGroups,
  sbomVersions
}) => {
  const editVulns = useHasPermission({
    parentKey: 'view_sbom',
    childKey: 'edit_vulnerabilities'
  })

  return useMemo(() => {
    return (
      <Flex
        width={'100%'}
        alignItems={'center'}
        justifyContent={'space-between'}
      >
        {/* FILTER */}
        <Stack spacing={2} alignItems={'center'} direction={'row'}>
          <SearchFilter
            id='globalVulns'
            filterText={filterInput}
            onFilter={handleSearch}
            onClear={handleClear}
            onChange={onSearchInputChange}
          />
          <VulnFilters
            prodGroups={prodGroups}
            sbomVersions={sbomVersions}
            setFilter={(newFilters) => onFilter(newFilters)}
          />
        </Stack>
        <Stack spacing={2} alignItems={'center'} direction={'row'}>
          {/* EXPORT CSV */}
          <ExportCsv
            tableType={'Vulnerability Detail View'}
            filters={{ ...vulnState }}
          />
          {/* UPDATE STATUES */}
          {selectedVulns.length > 0 && (
            <Tooltip label={'Set Status'}>
              <IconButton
                icon={<LuSquarePen size={18} />}
                variant='solid'
                colorScheme='blue'
                fontWeight='normal'
                title='Set vuln status'
                onClick={STATUS.onOpen}
                isDisabled={!editVulns}
              />
            </Tooltip>
          )}
          <RefreshBtn />
        </Stack>
      </Flex>
    )
  }, [
    STATUS,
    editVulns,
    filterInput,
    handleClear,
    handleSearch,
    onFilter,
    onSearchInputChange,
    prodGroups,
    sbomVersions,
    selectedVulns.length,
    vulnState
  ])
}

export default ComponentVulnsHeader
