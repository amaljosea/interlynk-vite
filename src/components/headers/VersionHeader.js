import React, { useMemo } from 'react'
// import { stages } from 'variables/general'
import SearchFilter from 'views/Sbom/components/SearchFilter'

import {
  Flex,
  IconButton, // Menu,
  // MenuItemOption,
  // MenuList,
  // MenuOptionGroup,
  Stack,
  Text,
  Tooltip
} from '@chakra-ui/react'

import RefreshBtn from 'components/Icons/RefreshBtn'

// import MenuHeading from 'components/Misc/MenuHeading'
import { FaPlus } from 'react-icons/fa6'
import { LuArchive, LuGitCompare } from 'react-icons/lu'

const VersionHeader = (props) => {
  const {
    // filters,
    // onFilterLifestage,
    filterText,
    onSearchInputChange,
    handleClear,
    handleSearch,
    selectedSbom,
    primaryBlueText,
    enabled,
    signedUrlParams,
    updateSbom,
    action
  } = props

  // const { lifestage } = filters || {}

  return useMemo(() => {
    return (
      <Flex
        sx={{ w: '100%', alignItems: 'center' }}
        justifyContent={'space-between'}
      >
        <Stack direction={'row'} alignItems={'center'} spacing={3}>
          <SearchFilter
            id='versions'
            filterText={filterText}
            onChange={onSearchInputChange}
            onClear={handleClear}
            onFilter={handleSearch}
          />
          {/* LIFE STAGE */}
          {/* <Menu closeOnSelect={false}>
            <MenuHeading title={'Lifestage'} active={lifestage?.length > 0} />
            <MenuList
              minW={'280px'}
              maxW={'400px'}
              minH='auto'
              maxH={'320px'}
              fontSize={'sm'}
              overflowY={'scroll'}
            >
              <MenuOptionGroup
                type={'checkbox'}
                value={lifestage}
                onChange={onFilterLifestage}
              >
                <MenuItemOption value='all'>All</MenuItemOption>
                {stages?.map((item, index) => (
                  <MenuItemOption
                    key={index}
                    fontSize={'sm'}
                    value={item?.value}
                    textTransform={'capitalize'}
                  >
                    {item.label}
                  </MenuItemOption>
                ))}
              </MenuOptionGroup>
            </MenuList>
          </Menu> */}
          {selectedSbom?.length === 1 && (
            <Text color={primaryBlueText}>
              ** Select one more version to enable comparison
            </Text>
          )}
          {selectedSbom?.length > 2 && (
            <Text color={primaryBlueText}>
              ** Comparison is permitted with only two versions
            </Text>
          )}
        </Stack>
        <Stack direction={'row'} spacing={2} alignItems={'center'}>
          {/* COMPARE VERSION */}
          {selectedSbom?.length === 2 && (
            <Tooltip label='Compare Version'>
              <IconButton
                colorScheme='blue'
                icon={<LuGitCompare size={20} />}
                onClick={() => action('compare_version', null)}
              />
            </Tooltip>
          )}
          {/* SHOW ARCHIVED VERSION */}
          <Tooltip label='Show Archived Versions'>
            <IconButton
              colorScheme='blue'
              isDisabled={!enabled}
              hidden={signedUrlParams}
              icon={<LuArchive size={20} />}
              aria-label='show_archive_sboms'
              onClick={() => action('show_archive_versions', null)}
            />
          </Tooltip>
          {/* BUILD SBOM */}
          <Tooltip label='Build Version'>
            <IconButton
              icon={<FaPlus />}
              colorScheme='blue'
              aria-label='build_sbom'
              hidden={signedUrlParams}
              isDisabled={!enabled || !updateSbom}
              onClick={() => action('build_sbom', null)}
            />
          </Tooltip>
          <RefreshBtn />
        </Stack>
      </Flex>
    )
  }, [
    action,
    enabled,
    filterText,
    handleClear,
    handleSearch,
    onSearchInputChange,
    primaryBlueText,
    selectedSbom?.length,
    signedUrlParams,
    updateSbom
  ])
}

export default VersionHeader
