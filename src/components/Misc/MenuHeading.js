import { Button, MenuButton } from '@chakra-ui/react'

import { useThemeColor } from 'hooks/useThemeColors'

import { FaFilter } from 'react-icons/fa'

const MenuHeading = ({ title, onClick, active, name }) => {
  const {
    primaryBlueText,
    primaryTextColor,
    grayBorderColor,
    primaryBlueBorder,
    secondaryBgColor
  } = useThemeColor([
    'primaryBlueText',
    'primaryTextColor',
    'grayBorderColor',
    'primaryBlueBorder',
    'secondaryBgColor'
  ])

  return (
    <MenuButton
      as={Button}
      fontWeight='normal'
      fontSize='sm'
      onClick={onClick}
      variant='outline'
      borderColor={active ? primaryBlueBorder : grayBorderColor}
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
