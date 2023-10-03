import React, { useState } from 'react'
import {
  Menu,
  MenuButton,
  MenuList,
  MenuOptionGroup,
  MenuItemOption,
  Button,
  Flex
} from '@chakra-ui/react'
import { FaFilter } from 'react-icons/fa'

const FilterMenu = ({ severityOptions, shortDescOptions, onFilterChange }) => {
  const [selectedSeverityFilters, setSelectedSeverityFilters] = useState([])
  const [selectedShortDescFilters, setSelectedShortDescFilters] = useState([])

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
      severity: selectedSeverityFilters,
      shortDesc: newFilters
    })
  }

  return (
    <Flex
      width={'100%'}
      alignItems={'flex-end'}
      justifyContent={'flex-end'}
      pos={'relative'}
      gap={3}
    >
      <Menu>
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
            type='checkbox'
            value={selectedSeverityFilters}
            onChange={handleSeverityFilterChange}
          >
            {severityOptions.map((option) => (
              <MenuItemOption
                key={option}
                value={option}
                textTransform='capitalize'
              >
                {option}
              </MenuItemOption>
            ))}
          </MenuOptionGroup>
        </MenuList>
      </Menu>
      <Menu>
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
            type='checkbox'
            value={selectedShortDescFilters}
            onChange={handleShortDescFilterChange}
          >
            {shortDescOptions.map((option) => (
              <MenuItemOption
                key={option}
                value={option}
                textTransform='capitalize'
              >
                {option}
              </MenuItemOption>
            ))}
          </MenuOptionGroup>
        </MenuList>
      </Menu>
    </Flex>
  )
}

export default FilterMenu
