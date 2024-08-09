import { useState } from 'react'

import {
  Box,
  Menu,
  MenuItemOption,
  MenuList,
  MenuOptionGroup,
  Stack
} from '@chakra-ui/react'

import MenuHeading from 'components/Misc/MenuHeading'

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
    onFilter('licenseType', newSpdx)
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
          <MenuHeading title={'Status'} active={status[0]} />
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
          <MenuHeading title={'License Type'} active={spdx[0]} />
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
