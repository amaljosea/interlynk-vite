import { HamburgerIcon } from '@chakra-ui/icons'
import {
  Box,
  Button,
  IconButton,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItemOption,
  MenuList,
  MenuOptionGroup
} from '@chakra-ui/react'

import { allPolicies } from 'hooks/useGlobalState'
import { allTrends } from 'hooks/useGlobalState'
import { allVulns } from 'hooks/useGlobalState'
import { allProducts } from 'hooks/useGlobalState'
import { useGlobalState } from 'hooks/useGlobalState'

const CardList = () => {
  const {
    selectedProducts,
    setSelectedProducts,
    selectedVulns,
    setSelectedVulns,
    selectedTrends,
    setSelectedTrends,
    selectedPolicies,
    setSelectedPolicies,
    handleClearAll
  } = useGlobalState()

  return (
    <Menu closeOnSelect={false}>
      <MenuButton
        as={IconButton}
        colorScheme='blue'
        aria-label='Options'
        icon={<HamburgerIcon />}
        variant='solid'
      />
      <MenuList
        minWidth='240px'
        maxH={'400px'}
        fontSize={'sm'}
        overflowY={'scroll'}
      >
        <MenuOptionGroup
          title='Product Graphs'
          type='checkbox'
          value={selectedProducts}
          onChange={(values) => setSelectedProducts(values)}
        >
          {allProducts.map((value) => (
            <MenuItemOption key={value} value={value}>
              {value
                .replaceAll('_', ' ')
                .replace(/\b\w/g, (l) => l.toUpperCase())}
            </MenuItemOption>
          ))}
        </MenuOptionGroup>

        <MenuDivider />

        <MenuOptionGroup
          title='Vulnerability Graphs'
          type='checkbox'
          value={selectedVulns}
          onChange={(values) => setSelectedVulns(values)}
        >
          {allVulns.map((value) => (
            <MenuItemOption key={value} value={value}>
              {value
                .replaceAll('_', ' ')
                .replace(/\b\w/g, (l) => l.toUpperCase())}
            </MenuItemOption>
          ))}
        </MenuOptionGroup>

        <MenuDivider />

        <MenuOptionGroup
          title='Trend Graphs'
          type='checkbox'
          value={selectedTrends}
          onChange={(values) => setSelectedTrends(values)}
        >
          {allTrends.map((value) => (
            <MenuItemOption key={value} value={value}>
              {value
                .replaceAll('_', ' ')
                .replace(/\b\w/g, (l) => l.toUpperCase())}
            </MenuItemOption>
          ))}
        </MenuOptionGroup>

        <MenuDivider />

        <MenuOptionGroup
          title='Policy Graphs'
          type='checkbox'
          value={selectedPolicies}
          onChange={(values) => setSelectedPolicies(values)}
        >
          {allPolicies.map((value) => (
            <MenuItemOption key={value} value={value}>
              {value
                .replaceAll('_', ' ')
                .replace(/\b\w/g, (l) => l.toUpperCase())}
            </MenuItemOption>
          ))}
        </MenuOptionGroup>

        <MenuDivider />

        <Box px={3} py={2} display='flex' justifyContent='space-between'>
          <Button
            size='xs'
            onClick={handleClearAll}
            colorScheme='red'
            variant='outline'
          >
            Clear All
          </Button>
        </Box>
      </MenuList>
    </Menu>
  )
}

export default CardList
