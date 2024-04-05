import { useState } from 'react'

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

import { FaFilter } from 'react-icons/fa'

const LicenseFilter = ({ onFilter }) => {
  const [status, setStatus] = useState([undefined])
  const availableStatus = {
    All: undefined,
    Approved: 'approved',
    Rejected: 'rejected',
    Unspecified: 'unspecified'
  }

  const [spdx, setSpdx] = useState([undefined])
  const availableSpdxFilters = {
    All: undefined,
    SPDX: 'License',
    Custom: 'LicenseCustom'
  }

  const handleStatusChange = (newStatus) => {
    newStatus = [newStatus[newStatus.length - 1]] // only allow one status at a time

    setStatus(newStatus)
    onFilter('status', newStatus)
  }

  const handleSpdxChange = (newSpdx) => {
    newSpdx = [newSpdx[newSpdx.length - 1]] // only allow one filter item at a time

    setSpdx(newSpdx)
    onFilter('spdx', newSpdx)
  }

  const generateMenuItems = (availableFilters) => {
    return Object.entries(availableFilters).map(([key, value]) => (
      <MenuItemOption key={key} value={value} fontSize={'sm'}>
        {key}
      </MenuItemOption>
    ))
  }

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
              {generateMenuItems(availableStatus)}
            </MenuOptionGroup>
          </MenuList>
        </Menu>
      </Box>
      <Box width={'fit-content'} position={'relative'}>
        <Menu closeOnSelect={true}>
          {spdx[0] && <CheckMark />}
          <MenuButton
            as={Button}
            colorScheme='blue'
            fontWeight='normal'
            fontSize={'sm'}
            leftIcon={<FaFilter size={14} />}
          >
            License Type
          </MenuButton>
          <MenuList>
            <MenuOptionGroup
              type='checkbox'
              value={spdx}
              onChange={handleSpdxChange}
            >
              {generateMenuItems(availableSpdxFilters)}
            </MenuOptionGroup>
          </MenuList>
        </Menu>
      </Box>
    </Stack>
  )
}

export default LicenseFilter
