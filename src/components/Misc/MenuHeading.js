import { useLocation } from 'react-router-dom'

import { Button, MenuButton } from '@chakra-ui/react'

import { useThemeColor } from 'hooks/useThemeColors'

import { FaFilter } from 'react-icons/fa'

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
        <FaFilter
          size={14}
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
