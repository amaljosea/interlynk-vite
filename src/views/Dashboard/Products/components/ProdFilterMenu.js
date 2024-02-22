import {
  Box,
  Menu,
  MenuItemOption,
  MenuList,
  MenuOptionGroup,
  Stack
} from '@chakra-ui/react'
import CheckMark from 'components/Misc/CheckMark'
import { useGlobalState } from 'hooks/useGlobalState'
import MenuHeading from 'components/Misc/MenuHeading'

const ProdFilterMenu = ({ onFilter }) => {
  const { prodState } = useGlobalState()
  const { enabled } = prodState

  return (
    <Stack direction={'row'} alignItems={'center'} gap={1}>
      {/* ACTIVE */}
      <Box width={'fit-content'} position={'relative'}>
        <Menu closeOnSelect={false}>
          {enabled !== '' && enabled !== 'all' && <CheckMark />}
          <MenuHeading title={'Active'} />
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
