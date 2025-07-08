import React, { useMemo } from 'react'
import SearchFilter from 'views/Sbom/components/SearchFilter'

import {
  Flex,
  Menu,
  MenuItemOption,
  MenuList,
  MenuOptionGroup,
  Stack
} from '@chakra-ui/react'

import AddButton from 'components/Icons/AddButton'
import RefreshBtn from 'components/Icons/RefreshBtn'
import MenuHeading from 'components/Misc/MenuHeading'

import { useGlobalState } from 'hooks/useGlobalState'

const OrganizationHeader = ({
  action,
  filters,
  setFilters,
  searchInput,
  handleClear,
  handleSearch,
  onSearchInputChange
}) => {
  const { organization } = useGlobalState()
  const isSuperAdmin = organization?.currentUser?.superAdmin

  const { status, tier } = filters || {}

  return useMemo(() => {
    const onFilterStatus = (value) => {
      setFilters((prev) => ({ ...prev, status: value !== 'all' ? value : '' }))
    }
    const onFilterTier = (value) => {
      setFilters((prev) => ({ ...prev, tier: value !== 'all' ? value : '' }))
    }

    const menuListStyle = {
      maxW: '200px',
      minH: 'auto',
      maxH: '350px',
      fontSize: 'sm',
      overflowY: 'scroll'
    }

    const refetch = [
      isSuperAdmin ? 'GetAllOrganizations' : 'GetMyOrganizations'
    ]

    return (
      <Flex
        w={'100%'}
        alignItems={'center'}
        justifyContent={!isSuperAdmin ? 'flex-end' : 'space-between'}
      >
        <Stack
          spacing={2}
          direction={'row'}
          alignItems={'center'}
          hidden={!isSuperAdmin}
        >
          {isSuperAdmin && (
            <SearchFilter
              id='organization'
              onClear={handleClear}
              onFilter={handleSearch}
              filterText={searchInput}
              onChange={onSearchInputChange}
            />
          )}
          <Menu closeOnSelect={false} isLazy>
            <MenuHeading title={'Tier'} active={tier !== ''} />
            <MenuList sx={menuListStyle}>
              <MenuOptionGroup
                type={'radio'}
                value={tier}
                onChange={onFilterTier}
              >
                {['all', 'free', 'enterprise']?.map((item, index) => (
                  <MenuItemOption
                    key={index}
                    value={item}
                    fontSize={'sm'}
                    textTransform={'capitalize'}
                  >
                    {item}
                  </MenuItemOption>
                ))}
              </MenuOptionGroup>
            </MenuList>
          </Menu>
          <Menu closeOnSelect={false} isLazy>
            <MenuHeading title={'Status'} active={status !== ''} />
            <MenuList sx={menuListStyle}>
              <MenuOptionGroup
                type={'radio'}
                value={status}
                onChange={onFilterStatus}
              >
                {['all', 'approved', 'unapproved']?.map((item, index) => (
                  <MenuItemOption
                    key={index}
                    value={item}
                    fontSize={'sm'}
                    textTransform={'capitalize'}
                  >
                    {item}
                  </MenuItemOption>
                ))}
              </MenuOptionGroup>
            </MenuList>
          </Menu>
        </Stack>
        <Stack spacing={2} alignItems={'center'} direction={'row'}>
          <AddButton
            label='Add Organization'
            aria-label='add_organization'
            onClick={() => action('add_organization', null)}
          />
          <RefreshBtn queries={refetch} />
        </Stack>
      </Flex>
    )
  }, [
    action,
    handleClear,
    handleSearch,
    isSuperAdmin,
    onSearchInputChange,
    searchInput,
    setFilters,
    status,
    tier
  ])
}

export default OrganizationHeader
