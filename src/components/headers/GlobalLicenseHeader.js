import React, { useMemo } from 'react'
import SearchFilter from 'views/Sbom/components/SearchFilter'

import { Flex } from '@chakra-ui/react'

import AddButton from 'components/Icons/AddButton'
import RefreshBtn from 'components/Icons/RefreshBtn'
import LicenseFilter from 'components/Licenses/LicenseFilter'

import { useHasPermission } from 'hooks/useHasPermission'

const GlobalLicenseHeader = (props) => {
  const {
    action,
    filterText,
    handleClear,
    handleSearch,
    onSearchInputChange,
    handleFilter
  } = props

  const updateLic = useHasPermission({
    parentKey: 'view_licenses',
    childKey: 'edit_licenses'
  })

  return useMemo(() => {
    return (
      <Flex gap={2} width={'100%'} justifyContent={'space-between'}>
        <Flex gap={2}>
          <SearchFilter
            id='license'
            onClear={handleClear}
            filterText={filterText}
            onFilter={handleSearch}
            onChange={onSearchInputChange}
          />
          <LicenseFilter onFilter={handleFilter} />
        </Flex>
        <Flex gap={2}>
          {/* ADD LICNESE */}
          <AddButton
            label='Add License'
            isDisabled={!updateLic}
            onClick={() => action('add_license', null)}
            aria-label='add_license'
          />
          <RefreshBtn />
        </Flex>
      </Flex>
    )
  }, [
    action,
    filterText,
    handleClear,
    handleFilter,
    handleSearch,
    onSearchInputChange,
    updateLic
  ])
}

export default GlobalLicenseHeader
