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
import CheckMark from 'components/Misc/CheckMark'
import {useState} from 'react'
import { FaFilter } from 'react-icons/fa'

const LicenseFilter = ( {onFilter} ) => {
  const [status, setStatus] = useState([undefined])
  const availableStatus = {
    all: undefined,
    approved: 'approved',
    rejected: 'rejected',
    unspecified: 'unspecified'
  }

  const handleStatusChange = (newStatus) => {
    newStatus = [newStatus[newStatus.length - 1]] // only allow one status at a time

    setStatus(newStatus)
    onFilter(newStatus)
  }

  const menuItems = Object.entries(availableStatus).map(([key, value]) => (
    <MenuItemOption
      key={key}
      value={value}
      fontSize={'sm'}
      textTransform={'capitalize'}
    >
      {key}
    </MenuItemOption>
  ))


  return (
    <Stack direction={'row'} alignItems={'center'} gap={1}>
      <Box width={'fit-content'} position={'relative'}>
        <Menu closeOnSelect={true}>
          {status[0] && <CheckMark />}
          <MenuButton
            as={Button}
            colorScheme='blue'
            fontWeight='normal'
            fontSize={'sm'}
            leftIcon={<FaFilter size={14} />}
          >
            Status
          </MenuButton>
          <MenuList>
            <MenuOptionGroup
              type='checkbox'
              value={status}
              onChange={handleStatusChange}
            >
              {menuItems}
            </MenuOptionGroup>
          </MenuList>
        </Menu>
      </Box>
    </Stack>
  )
}

export default LicenseFilter