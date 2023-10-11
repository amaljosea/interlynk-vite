import {
  Menu,
  MenuButton,
  MenuList,
  MenuOptionGroup,
  MenuItemOption,
  Button,
  Flex,
  Box,
  Badge
} from '@chakra-ui/react'
import React, { useState } from 'react'
import { FaFilter } from 'react-icons/fa'

const FilterChangelog = ({ onFilterChange, users, actions }) => {
  const [selectedTypeFilters, setSelectedTypeFilters] = useState([])
  const [selectedUserFilters, setSelectedUserFilters] = useState([])

  const handleTypeFilterChange = (newFilters) => {
    setSelectedTypeFilters(newFilters)
    onFilterChange({
      type: newFilters,
      user: selectedUserFilters
    })
  }

  const handleUserFilterChange = (newFilters) => {
    setSelectedUserFilters(newFilters)
    onFilterChange({
      type: selectedTypeFilters,
      user: newFilters
    })
  }

  const activeTypeCount = selectedTypeFilters.length
  const activeUserCount = selectedUserFilters.length

  return (
    <Flex alignItems={'center'} gap={4}>
      {/* TYPE FILTER */}
      <Box width={'fit-content'} position={'relative'}>
        <Menu closeOnSelect={true}>
          {activeTypeCount > 0 && (
            <Badge
              variant='solid'
              colorScheme='teal'
              position={'absolute'}
              right={-2}
              top={-1.5}
              zIndex={11}
            >
              {activeTypeCount}
            </Badge>
          )}
          <MenuButton
            as={Button}
            colorScheme='blue'
            fontWeight='normal'
            fontSize={'sm'}
            leftIcon={<FaFilter size={14} />}
          >
            Type
          </MenuButton>
          <MenuList minWidth='240px'>
            <MenuOptionGroup
              type='radio'
              onChange={() => window.location.reload()}
            >
              <MenuItemOption value={'All'} fontSize={'sm'}>
                all
              </MenuItemOption>
            </MenuOptionGroup>
            <MenuOptionGroup type='checkbox' onChange={handleTypeFilterChange}>
              {actions.length > 0 &&
                [...new Set(actions)].map((p, index) => (
                  <MenuItemOption value={p} key={index} fontSize={'sm'}>
                    {p}
                  </MenuItemOption>
                ))}
            </MenuOptionGroup>
          </MenuList>
        </Menu>
      </Box>
      {/* USER FILTER */}
      <Box width={'fit-content'} position={'relative'}>
        <Menu closeOnSelect={true}>
          {activeUserCount > 0 && (
            <Badge
              variant='solid'
              colorScheme='teal'
              position={'absolute'}
              right={-2}
              top={-1.5}
              zIndex={11}
            >
              {activeUserCount}
            </Badge>
          )}
          <MenuButton
            as={Button}
            colorScheme='blue'
            fontWeight='normal'
            fontSize={'sm'}
            leftIcon={<FaFilter size={14} />}
          >
            User
          </MenuButton>
          <MenuList minWidth='240px'>
            <MenuOptionGroup
              type='radio'
              onChange={() => window.location.reload()}
            >
              <MenuItemOption value={'All'} fontSize={'sm'}>
                all
              </MenuItemOption>
            </MenuOptionGroup>
            <MenuOptionGroup type='checkbox' onChange={handleUserFilterChange}>
              {users.length > 0 &&
                [...new Set(users)].map((p, index) => (
                  <MenuItemOption value={p} key={index} fontSize={'sm'}>
                    {p}
                  </MenuItemOption>
                ))}
            </MenuOptionGroup>
          </MenuList>
        </Menu>
      </Box>
    </Flex>
  )
}

export default FilterChangelog
