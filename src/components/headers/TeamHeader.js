import React, { useMemo } from 'react'
import { FREE_TIER_USER_LIMIT } from 'variables/general'
import ExportCsv from 'views/Dashboard/Products/components/ExportCsv'
import SearchFilter from 'views/Sbom/components/SearchFilter'

import { Box, Flex, Tooltip } from '@chakra-ui/react'

import AddButton from 'components/Icons/AddButton'
import RefreshBtn from 'components/Icons/RefreshBtn'

import { useGlobalState } from 'hooks/useGlobalState'
import { useHasPermission } from 'hooks/useHasPermission'
import { useRouteFlags } from 'hooks/useRouteFlags'

const TeamHeader = ({
  action,
  searchInput,
  handleClear,
  handleSearch,
  onSearchInputChange,
  numberOfUsers
}) => {
  const { isCustomerView } = useRouteFlags()
  const { organization } = useGlobalState()

  const { tier } = organization || {}
  const isFreeTier = tier === 'free'

  const inviteUser = useHasPermission({
    parentKey: 'view_users',
    childKey: 'invite_users'
  })

  const disabled =
    !inviteUser || (isFreeTier && numberOfUsers >= FREE_TIER_USER_LIMIT)

  return useMemo(() => {
    return (
      <Flex w={'100%'} alignItems={'center'} justifyContent={'space-between'}>
        {/* SEARCH COMPONENTS */}
        <SearchFilter
          id='team'
          onClear={handleClear}
          onFilter={handleSearch}
          filterText={searchInput}
          onChange={onSearchInputChange}
        />

        <Flex sx={{ gap: 2, justifyContent: 'flex-end' }}>
          {/* EXPORT CSV */}
          {!isCustomerView && (
            <ExportCsv
              tableType='Users'
              filters={{
                search: searchInput !== '' ? searchInput : undefined
              }}
            />
          )}
          {/* INVITE USER */}
          <Box position='relative'>
            <Tooltip
              label={
                isFreeTier && numberOfUsers >= FREE_TIER_USER_LIMIT
                  ? 'Limit reached for free tier'
                  : 'Invite User'
              }
              placement='bottom'
              isDisabled={false} // Ensure the tooltip is never disabled
            >
              <Box>
                <AddButton
                  aria-label='add_user'
                  isDisabled={disabled}
                  onClick={() => action('add_user', null)}
                />
              </Box>
            </Tooltip>
          </Box>
          <RefreshBtn />
        </Flex>
      </Flex>
    )
  }, [
    action,
    disabled,
    handleClear,
    handleSearch,
    isCustomerView,
    isFreeTier,
    numberOfUsers,
    onSearchInputChange,
    searchInput
  ])
}

export default TeamHeader
