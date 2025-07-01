import { allAnalytics } from 'utils/initDashboardData'
import { setItem,getItem } from 'utils/localStorageUtils'

import {
  IconButton,
  Menu,
  MenuButton,
  MenuItemOption,
  MenuList,
  MenuOptionGroup
} from '@chakra-ui/react'

import { useGlobalState } from 'hooks/useGlobalState'

import { LuMenu } from 'react-icons/lu'

const AnalyticsList = () => {
  const analytics = getItem('selectedAnalytics')
  const analyticsCards = analytics ? JSON.parse(analytics) : null

  const { selectedAnalytics, setSelectedAnalytics } = useGlobalState()

  const updateCards = (values) => {
    setSelectedAnalytics(values)
    if (analyticsCards) {
      setItem('selectedAnalytics', JSON.stringify(values))
    }
  }

  return (
    <Menu closeOnSelect={false}>
      <MenuButton
        as={IconButton}
        colorScheme='blue'
        aria-label='Options'
        icon={<LuMenu size={18} />}
        variant='solid'
      />
      <MenuList
        minWidth='240px'
        maxH={'400px'}
        fontSize={'sm'}
        overflowY={'scroll'}
      >
        <MenuOptionGroup
          type='checkbox'
          title='Analytics'
          value={selectedAnalytics}
          onChange={(values) => updateCards(values)}
        >
          {allAnalytics?.map((value) => (
            <MenuItemOption key={value} value={value}>
              {value
                .replaceAll('_', ' ')
                .replace(/\b\w/g, (l) => l.toUpperCase())}
            </MenuItemOption>
          ))}
        </MenuOptionGroup>
      </MenuList>
    </Menu>
  )
}

export default AnalyticsList
