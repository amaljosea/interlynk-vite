import { Button, MenuButton, useColorModeValue } from '@chakra-ui/react'

import { FaFilter } from 'react-icons/fa'

const MenuHeading = ({ title, onClick, active }) => {
  const grayBorder = useColorModeValue('#1A202C29', '#ffffff29')
  const grayText = useColorModeValue('#03030399', '#E2E8F0')
  const bgActive = useColorModeValue('#EDF2F7', '')
  const iconColor = useColorModeValue('#3182CE', '#90cdf4')
  const activeBorderColor = useColorModeValue('#3182CE', '#90cdf499')

  return (
    <MenuButton
      as={Button}
      fontWeight='normal'
      fontSize='sm'
      onClick={onClick}
      variant='outline'
      borderColor={active ? activeBorderColor : grayBorder}
      color={active ? iconColor : grayText}
      backgroundColor={active ? bgActive : 'transparent'}
      leftIcon={<FaFilter size={14} color={active ? iconColor : grayText} />}
    >
      {title}
    </MenuButton>
  )
}

export default MenuHeading
