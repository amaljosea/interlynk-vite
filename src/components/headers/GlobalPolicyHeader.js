import React, { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import SearchFilter from 'views/Sbom/components/SearchFilter'

import { Flex, Stack } from '@chakra-ui/react'

import AddButton from 'components/Icons/AddButton'
import RefreshBtn from 'components/Icons/RefreshBtn'

import { useHasPermission } from 'hooks/useHasPermission'

const GlobalPolicyHeader = ({
  action,
  filterText,
  handleClear,
  handleSearch,
  onSearchInputChange
}) => {
  const params = useParams()
  const productId = params.productid

  const updatePolicy = useHasPermission({
    parentKey: 'view_policy',
    childKey: 'create_update_policy'
  })

  return useMemo(() => {
    return (
      <Flex
        w={'100%'}
        alignItems={'center'}
        justifyContent={productId ? 'flex-end' : 'space-between'}
      >
        {!productId && (
          <SearchFilter
            id='policies'
            onClear={handleClear}
            filterText={filterText}
            onFilter={handleSearch}
            onChange={onSearchInputChange}
          />
        )}
        <Stack spacing={2} alignItems={'center'} direction={'row'}>
          <AddButton
            hidden={productId}
            label='Create Policy'
            aria-label='add_policy'
            isDisabled={!updatePolicy}
            onClick={() => action('create_policy', null)}
          />
          <RefreshBtn />
        </Stack>
      </Flex>
    )
  }, [
    action,
    filterText,
    handleClear,
    handleSearch,
    onSearchInputChange,
    productId,
    updatePolicy
  ])
}

export default GlobalPolicyHeader
