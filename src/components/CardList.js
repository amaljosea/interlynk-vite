import {
  allActivities,
  allPolicies,
  allProducts,
  allTrends,
  allVulns
} from 'utils/initDashboardData'

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

const CardList = () => {
  const {
    updateCards,
    selectedActivities,
    selectedProducts,
    selectedVulns,
    selectedTrends,
    selectedPolicies,
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
          onChange={(values) => updateCards(values, 'products')}
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
          onChange={(values) => updateCards(values, 'vulns')}
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
          onChange={(values) => updateCards(values, 'trends')}
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
          onChange={(values) => updateCards(values, 'policies')}
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
          onChange={(values) => updateCards(values, 'activities')}
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
