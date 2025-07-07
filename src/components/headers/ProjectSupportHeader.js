import React, { useMemo } from 'react'
import { supportLevels } from 'variables/general'
import SearchFilter from 'views/Sbom/components/SearchFilter'

import {
  Flex,
  IconButton,
  Menu,
  MenuItemOption,
  MenuList,
  MenuOptionGroup,
  Tooltip
} from '@chakra-ui/react'

import RefreshBtn from 'components/Icons/RefreshBtn'
import MenuHeading from 'components/Misc/MenuHeading'

import { useRouteFlags } from 'hooks/useRouteFlags'

import { LuSquarePen } from 'react-icons/lu'

const ProjectSupportHeader = ({
  supportData,
  searchInput,
  handleClear,
  handleSearch,
  onSearchInputChange,
  selectedItems,
  onFilterSupport,
  onFilterInclude,
  handleStatus
}) => {
  const { isCustomerView } = useRouteFlags()
  const { supportLevel, include } = supportData || {}

  return useMemo(() => {
    return (
      <Flex w={'100%'} alignItems={'center'} justifyContent={'space-between'}>
        <Flex gap={2} flexWrap={'wrap'}>
          <SearchFilter
            onClear={handleClear}
            onFilter={handleSearch}
            filterText={searchInput}
            id='global_support_status'
            onChange={onSearchInputChange}
          />
          <Menu closeOnSelect={false} isLazy>
            <MenuHeading
              title={'Support'}
              active={
                supportLevel?.length !== 0 && !supportLevel.includes('all')
              }
            />
            <MenuList
              minH='auto'
              maxH={'350px'}
              minW={'300px'}
              fontSize={'sm'}
              overflowY={'scroll'}
            >
              <MenuOptionGroup
                type={'checkbox'}
                value={supportLevel}
                onChange={onFilterSupport}
              >
                {supportLevels?.map((item) => (
                  <MenuItemOption
                    key={item?.id}
                    fontSize={'sm'}
                    value={item?.value}
                  >
                    {item?.label}
                  </MenuItemOption>
                ))}
              </MenuOptionGroup>
            </MenuList>
          </Menu>
          <Menu closeOnSelect={false}>
            <MenuHeading title={'Include'} active={include?.length !== 0} />
            <MenuList fontSize={'sm'}>
              <MenuOptionGroup
                type='checkbox'
                value={include}
                onChange={onFilterInclude}
              >
                <MenuItemOption value={'parts'} fontSize={'sm'}>
                  Parts
                </MenuItemOption>
              </MenuOptionGroup>
            </MenuList>
          </Menu>
        </Flex>
        <Flex gap={2} flexWrap={'wrap'} justifyContent='flex-end'>
          {!isCustomerView && selectedItems?.length > 0 && (
            <Tooltip label={'Set Status'}>
              <IconButton
                icon={<LuSquarePen />}
                colorScheme='blue'
                onClick={handleStatus}
              />
            </Tooltip>
          )}
          <RefreshBtn queries={['GetCompSupportData']} />
        </Flex>
      </Flex>
    )
  }, [
    handleClear,
    handleSearch,
    handleStatus,
    include,
    isCustomerView,
    onFilterInclude,
    onFilterSupport,
    onSearchInputChange,
    searchInput,
    selectedItems?.length,
    supportLevel
  ])
}

export default ProjectSupportHeader
