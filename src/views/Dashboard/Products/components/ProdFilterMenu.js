import {
  Box,
  Button,
  Menu,
  MenuButton,
  MenuItemOption,
  MenuList,
  MenuOptionGroup,
  Stack
} from '@chakra-ui/react'
import { FaFilter } from 'react-icons/fa'
import CheckMark from 'components/Misc/CheckMark'
import { useGlobalState } from 'hooks/useGlobalState'

const ProdFilterMenu = ({ onFilter }) => {
  const { prodState } = useGlobalState()
  const { enabled } = prodState

  return (
    <Stack direction={'row'} alignItems={'center'} gap={1}>
      {/* ACTIVE */}
      <Box width={'fit-content'} position={'relative'}>
        <Menu closeOnSelect={true}>
          {enabled !== '' && enabled !== 'all' && <CheckMark />}
          <MenuButton
            as={Button}
            colorScheme='blue'
            fontWeight='normal'
            fontSize={'sm'}
            leftIcon={<FaFilter size={14} />}
          >
            Active
          </MenuButton>
          <MenuList>
            <MenuOptionGroup type='radio' value={enabled} onChange={onFilter}>
              {['all', 'yes', 'no'].map((item, index) => (
                <MenuItemOption
                  key={index}
                  value={item}
                  fontSize={'sm'}
                  textTransform={'capitalize'}
                >
                  {item}
                </MenuItemOption>
              ))}
            </MenuOptionGroup>
          </MenuList>
        </Menu>
      </Box>
    </Stack>
  )
}

export default ProdFilterMenu
