import React, { useMemo } from 'react'
import { getSignedUrlParams } from 'utils'
import { FREE_TIER_PRODUCT_LIMIT } from 'variables/general'
import ProdFilterMenu from 'views/Dashboard/Products/components/ProdFilterMenu'
import SearchFilter from 'views/Sbom/components/SearchFilter'

import { Box, Flex, IconButton, Tooltip } from '@chakra-ui/react'

import AddButton from 'components/Icons/AddButton'
import RefreshBtn from 'components/Icons/RefreshBtn'

import useGithubConfigSaved from 'hooks/useGithubConfigSaved'
import { useGlobalQueryContext } from 'hooks/useGlobalQueryContext'
import { useHasPermission } from 'hooks/useHasPermission'
import { useShouldShowDemoFeatures } from 'hooks/useShouldShowDemoFeatures'

import { LuGithub, LuPaintBucket, LuTags } from 'react-icons/lu'

const ProductHeader = (props) => {
  const {
    action,
    reset,
    filterText,
    onSearchInputChange,
    handleClear,
    handleSearch,
    filterMode,
    setFilterMode,
    setSelectedTags,
    bitbucket,
    totalCount
  } = props

  const signedUrlParams = getSignedUrlParams()
  const { isFreeTier } = useGlobalQueryContext()
  const isGithubConfigSaved = useGithubConfigSaved()
  const { shouldShowDemoFeatures } = useShouldShowDemoFeatures()

  const canAddProduct = useHasPermission({
    parentKey: 'view_product_group',
    childKey: 'create_product_group'
  })

  return useMemo(() => {
    return (
      <Flex
        width={'100%'}
        alignItems={'center'}
        justifyContent={'space-between'}
      >
        <Flex gap={2}>
          {/* SEARCH PRODUCTS */}
          <SearchFilter
            id='product'
            onClear={handleClear}
            onFilter={handleSearch}
            filterText={filterText}
            onChange={onSearchInputChange}
          />
          {/* FILTER PRODUCTS */}
          {!signedUrlParams && (
            <ProdFilterMenu
              reset={reset}
              filterMode={filterMode}
              setFilterMode={setFilterMode}
              setSelectedTags={setSelectedTags}
            />
          )}
        </Flex>
        <Flex gap={2}>
          {/* ADD GITHUB PROJECT */}
          {shouldShowDemoFeatures && isGithubConfigSaved && (
            <Tooltip label='Add GitHub Project'>
              <IconButton
                icon={<LuGithub size={18} />}
                variant='outline'
                onClick={() => action('import_github', null)}
              />
            </Tooltip>
          )}
          {/* EDIT LABEL */}
          <Tooltip label='Manage Labels'>
            <IconButton
              aria-label='Manage Labels'
              icon={<LuTags size={18} />}
              variant='outline'
              onClick={() => action('create_labels', null)}
              isDisabled={!canAddProduct}
              hidden={signedUrlParams || isFreeTier}
            />
          </Tooltip>
          {!isFreeTier && bitbucket && (
            <Tooltip label='Import from Bitbucket'>
              <IconButton
                colorScheme='blue'
                icon={<LuPaintBucket size={18} />}
                aria-label='import_bitbucket_projects'
                onClick={() => action('import_bitbucket', null)}
              />
            </Tooltip>
          )}
          {/* ADD PRODUCT */}
          <Box position='relative'>
            <Tooltip
              label={
                isFreeTier && totalCount >= FREE_TIER_PRODUCT_LIMIT
                  ? 'Limit reached for free tier'
                  : 'Add Product'
              }
              isDisabled={false} // Ensure the tooltip is never disabled
            >
              <Box>
                <AddButton
                  aria-label='Add Product'
                  onClick={() => action('update_product', null)}
                  isDisabled={
                    !canAddProduct ||
                    (isFreeTier && totalCount >= FREE_TIER_PRODUCT_LIMIT)
                  }
                  hidden={signedUrlParams}
                />
              </Box>
            </Tooltip>
          </Box>
          {/* REFRESH */}
          <RefreshBtn
            queries={[
              signedUrlParams ? 'ShareLynkProjectGroups' : 'GetProductTable'
            ]}
          />
        </Flex>
      </Flex>
    )
  }, [
    action,
    bitbucket,
    canAddProduct,
    filterMode,
    filterText,
    handleClear,
    handleSearch,
    isFreeTier,
    isGithubConfigSaved,
    onSearchInputChange,
    reset,
    setFilterMode,
    setSelectedTags,
    shouldShowDemoFeatures,
    signedUrlParams,
    totalCount
  ])
}

export default ProductHeader
