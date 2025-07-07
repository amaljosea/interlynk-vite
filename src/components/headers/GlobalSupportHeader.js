import React, { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import SearchFilter from 'views/Sbom/components/SearchFilter'

import { Flex, Stack } from '@chakra-ui/react'

import AddButton from 'components/Icons/AddButton'
import RefreshBtn from 'components/Icons/RefreshBtn'

import { useHasPermission } from 'hooks/useHasPermission'

const GlobalSupportHeader = (props) => {
  const params = useParams()
  const sbomId = params.sbomid

  const { action, filterText, handleClear, handleSearch, onSearchInputChange } =
    props

  const editSup = useHasPermission({
    parentKey: 'view_support',
    childKey: 'edit_support'
  })

  return useMemo(() => {
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
            <AddButton
              label='Create Support'
              aria-label='add_support'
              isDisabled={!editSup}
              onClick={() => action('add_support', null)}
            />
          )}
          <RefreshBtn queries={['GetSupportTab']} />
        </Stack>
      </Flex>
    )
  }, [
    action,
    editSup,
    filterText,
    handleClear,
    handleSearch,
    onSearchInputChange,
    sbomId
  ])
}

export default GlobalSupportHeader
