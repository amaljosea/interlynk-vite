import { HamburgerIcon } from '@chakra-ui/icons'
import {
  Button,
  ButtonGroup,
  IconButton,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItemOption,
  MenuList,
  MenuOptionGroup
} from '@chakra-ui/react'

import { useGlobalState } from 'hooks/useGlobalState'
import {
  allActivities,
  allPolicies,
  allProducts,
  allTrends,
  allVulns
} from 'hooks/useGlobalState'

const CardList = () => {
  const {
    selectedActivities,
    setSelectedActivities,
    selectedProducts,
    setSelectedProducts,
    selectedVulns,
    setSelectedVulns,
    selectedTrends,
    setSelectedTrends,
    selectedPolicies,
    setSelectedPolicies,
    handleClearAll,
    handleSelectAll
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
          title='Product'
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
          title='Vulnerability'
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
          title='Vulnerability Trends'
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
          title='Policy'
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

        <MenuOptionGroup
          title='Activity'
          type='checkbox'
          value={selectedActivities}
          onChange={(values) => setSelectedActivities(values)}
        >
          {allActivities.map((value) => (
            <MenuItemOption key={value} value={value}>
              {value
                .replaceAll('_', ' ')
                .replace(/\b\w/g, (l) => l.toUpperCase())}
            </MenuItemOption>
          ))}
        </MenuOptionGroup>

        <MenuDivider />

        <ButtonGroup px={3} py={2}>
          <Button
            size='xs'
            onClick={handleSelectAll}
            colorScheme='blue'
            variant='outline'
          >
            Select All
          </Button>
          <Button
            size='xs'
            onClick={handleClearAll}
            colorScheme='red'
            variant='outline'
          >
            Clear All
          </Button>
        </ButtonGroup>
      </MenuList>
    </Menu>
  )
}

export default CardList
