import React, { useState } from 'react'
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
import { FaFilter } from 'react-icons/fa'

const FilterMenu = ({ onFilterChange, severity, category, resolution }) => {
  const [selectedSeverityFilters, setSelectedSeverityFilters] = useState([])
  const [selectedShortDescFilters, setSelectedShortDescFilters] = useState([])
  const [selectedResFilters, setSelectedResFilters] = useState(['Unresolved'])

  const handleSeverityFilterChange = (newFilters) => {
    setSelectedSeverityFilters(newFilters)
    onFilterChange({
      severity: newFilters,
      shortDesc: selectedShortDescFilters
    })
  }

  const handleShortDescFilterChange = (newFilters) => {
    setSelectedShortDescFilters(newFilters)
    onFilterChange({
      shortDesc: newFilters,
      severity: selectedSeverityFilters
    })
  }

  const handleResFilterChange = (newFilters) => {
    setSelectedResFilters(newFilters)
    onFilterChange({
      severity: selectedSeverityFilters,
      shortDesc: selectedShortDescFilters
    })
  }

  const activeSevCount = selectedSeverityFilters.length
  const activeCategoryCount = selectedShortDescFilters.length
  const activeResCount = selectedResFilters.length

  return (
    <Flex alignItems={'center'} gap={4}>
      {/* SEVERITY */}
      <Box width={'fit-content'} position={'relative'}>
        <Menu closeOnSelect={true}>
          {activeSevCount > 0 && (
            <Badge
              variant='solid'
              colorScheme='teal'
              position={'absolute'}
              right={-2}
              top={-1.5}
              zIndex={11}
            >
              {activeSevCount}
            </Badge>
          )}
          <MenuButton
            as={Button}
            colorScheme='blue'
            fontWeight='normal'
            fontSize={'sm'}
            leftIcon={<FaFilter size={14} />}
          >
            Severity
          </MenuButton>
          <MenuList>
            <MenuOptionGroup
              type='radio'
              onChange={() => window.location.reload()}
            >
              <MenuItemOption value={'All'} fontSize={'sm'}>
                All
              </MenuItemOption>
            </MenuOptionGroup>
            <MenuOptionGroup
              type='checkbox'
              value={selectedSeverityFilters}
              onChange={handleSeverityFilterChange}
            >
              {[...new Set(severity)].map((option) => (
                <MenuItemOption
                  key={option}
                  value={option}
                  fontSize={'sm'}
                  textTransform='capitalize'
                >
                  {option}
                </MenuItemOption>
              ))}
            </MenuOptionGroup>
          </MenuList>
        </Menu>
      </Box>

      {/* CATEGORY   */}
      <Box width={'fit-content'} position={'relative'}>
        <Menu closeOnSelect={true}>
          {activeCategoryCount > 0 && (
            <Badge
              variant='solid'
              colorScheme='teal'
              position={'absolute'}
              right={-2}
              top={-1.5}
              zIndex={11}
            >
              {activeCategoryCount}
            </Badge>
          )}
          <MenuButton
            as={Button}
            colorScheme='blue'
            fontWeight='normal'
            fontSize={'sm'}
            leftIcon={<FaFilter size={14} />}
          >
            Category
          </MenuButton>
          <MenuList height={'300px'} overflowY={'scroll'} overflow={'hiddens'}>
            <MenuOptionGroup
              type='radio'
              onChange={() => window.location.reload()}
            >
              <MenuItemOption value={'All'} fontSize={'sm'}>
                All
              </MenuItemOption>
            </MenuOptionGroup>
            <MenuOptionGroup
              type='checkbox'
              value={selectedShortDescFilters}
              onChange={handleShortDescFilterChange}
            >
              {[...new Set(category)].map((option) => (
                <MenuItemOption
                  key={option}
                  value={option}
                  textTransform='capitalize'
                  fontSize={'sm'}
                >
                  {option}
                </MenuItemOption>
              ))}
            </MenuOptionGroup>
          </MenuList>
        </Menu>
      </Box>

      {/* RESOLUTION */}
      <Box width={'fit-content'} position={'relative'}>
        <Menu closeOnSelect={true}>
          {activeResCount > 0 && (
            <Badge
              variant='solid'
              colorScheme='teal'
              position={'absolute'}
              right={-2}
              top={-1.5}
              zIndex={11}
            >
              {activeResCount}
            </Badge>
          )}
          <MenuButton
            as={Button}
            colorScheme='blue'
            fontWeight='normal'
            fontSize={'sm'}
            leftIcon={<FaFilter size={14} />}
          >
            Resolution
          </MenuButton>
          <MenuList>
            <MenuOptionGroup
              type='radio'
              onChange={() => window.location.reload()}
            >
              <MenuItemOption value={'All'} fontSize={'sm'}>
                All
              </MenuItemOption>
            </MenuOptionGroup>
            <MenuOptionGroup
              type='checkbox'
              value={selectedResFilters}
              onChange={handleResFilterChange}
            >
              {[...new Set(resolution)].map((option) => (
                <MenuItemOption
                  key={option}
                  value={option}
                  textTransform='capitalize'
                  fontSize={'sm'}
                >
                  {option}
                </MenuItemOption>
              ))}
            </MenuOptionGroup>
          </MenuList>
        </Menu>
      </Box>
    </Flex>
  )
}

export default FilterMenu
