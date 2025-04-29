import { useEffect, useState } from 'react'

import {
  Flex,
  Menu,
  MenuItemOption,
  MenuList,
  MenuOptionGroup,
  Spinner,
  VStack
} from '@chakra-ui/react'

import MenuHeading from 'components/Misc/MenuHeading'

import SearchFilter from './Licenses/LicenseSearchFilter'

export const AsyncFilter = ({ lazyDropDownProps, isActive }) => {
  const {
    isLoading,
    onMenuScrollToBottom,
    onInputChange,
    filteredNodes,
    getOptionLabel,
    getOptionValue,
    onChange
  } = lazyDropDownProps

  const handleScroll = (e) => {
    const bottom =
      e.target.scrollHeight - e.target.scrollTop === e.target.clientHeight
    if (bottom) {
      onMenuScrollToBottom()
    }
  }

  const [searchInput, setSearchInput] = useState('')
  const [selectedItems, setSelectedItems] = useState([])

  useEffect(() => {
    onChange(selectedItems)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedItems])

  const handleSearchChange = async (e) => {
    const searchValue = e.target.value
    setSearchInput(searchValue)
    await onInputChange(searchValue)
  }

  const handleMenuClick = (value) => {
    if (value === 'all') {
      setSelectedItems(['all'])
    } else {
      setSelectedItems((prevSelected) => {
        // If 'all' was selected earlier, remove it first
        const filteredPrev = prevSelected.filter((item) => item !== 'all')

        if (filteredPrev.includes(value)) {
          return filteredPrev.filter((item) => item !== value)
        } else {
          return [...filteredPrev, value]
        }
      })
    }
  }

  const handleClear = async () => {
    setSearchInput('')
    await lazyDropDownProps.onInputChange('')
  }

  return (
    <Menu onClose={handleClear} closeOnSelect={false}>
      <MenuHeading title={'Product'} active={isActive} />
      <MenuList
        maxH='200px'
        onScroll={handleScroll}
        overflowY={'scroll'}
        fontSize={'sm'}
      >
        <VStack spacing={1} align='stretch'>
          <Flex ml={1.5}>
            <SearchFilter
              value={searchInput}
              filterText={searchInput}
              onChange={handleSearchChange}
              onClear={handleClear}
            />
          </Flex>
          {isLoading && <Spinner size='sm' mx='auto' my={2} />}
          <MenuOptionGroup type='checkbox' value={selectedItems}>
            <MenuItemOption
              onClick={() => handleMenuClick('all')}
              value={'all'}
              fontSize={'sm'}
            >
              All
            </MenuItemOption>
            {filteredNodes?.map((item) => {
              const label = getOptionLabel(item)
              const value = getOptionValue(item)

              return (
                <MenuItemOption
                  onClick={() => handleMenuClick(value)}
                  key={value}
                  value={value}
                  py={2}
                >
                  {label}
                </MenuItemOption>
              )
            })}
          </MenuOptionGroup>
        </VStack>
      </MenuList>
    </Menu>
  )
}
