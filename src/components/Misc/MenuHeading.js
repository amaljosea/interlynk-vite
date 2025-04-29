import { useLocation } from 'react-router-dom'

import { Button, MenuButton } from '@chakra-ui/react'

import { useThemeColor } from 'hooks/useThemeColors'

import { LuFilter } from 'react-icons/lu'

const MenuHeading = ({ title, onClick, active, name }) => {
  const location = useLocation()
  const {
    primaryBlueText,
    primaryTextColor,
    grayBorderColor,
    primaryBlueBorder,
    secondaryBgColor,
    mutedBorder
  } = useThemeColor([
    'primaryBlueText',
    'primaryTextColor',
    'grayBorderColor',
    'primaryBlueBorder',
    'secondaryBgColor',
    'mutedBorder'
  ])

  const isDashboard = location?.pathname === '/vendor/dashboard'
  const lightBorder = isDashboard ? mutedBorder : grayBorderColor

  return (
    <MenuButton
      as={Button}
      fontWeight='normal'
      fontSize='sm'
      onClick={onClick}
      variant='outline'
      borderColor={active ? primaryBlueBorder : lightBorder}
      color={active ? primaryBlueText : primaryTextColor}
      backgroundColor={active ? secondaryBgColor : 'transparent'}
      leftIcon={
        <LuFilter
          size={20}
          color={active ? primaryBlueText : primaryTextColor}
        />
      }
      data-testid={`filter_${title}`}
      name={name}
    >
      {title}
    </MenuButton>
  )
}

export default MenuHeading
