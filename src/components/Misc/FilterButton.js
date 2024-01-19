import { Button, MenuButton } from '@chakra-ui/react'
import { FaFilter } from 'react-icons/fa'

const FilterButton = ({ children }) => {
  return (
    <MenuButton
      as={Button}
      colorScheme='blue'
      fontWeight='normal'
      fontSize={'sm'}
      leftIcon={<FaFilter size={14} />}
    >
      {children}
    </MenuButton>
  )
}

export default FilterButton
