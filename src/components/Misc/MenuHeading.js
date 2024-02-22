import { Button, MenuButton } from '@chakra-ui/react'
import { FaFilter } from 'react-icons/fa'

const MenuHeading = ({ title, onClick }) => {
  return (
    <MenuButton
      as={Button}
      colorScheme='blue'
      fontWeight='normal'
      fontSize={'sm'}
      leftIcon={<FaFilter size={14} />}
      onClick={onClick}
    >
      {title}
    </MenuButton>
  )
}

export default MenuHeading
