import { useState } from 'react'

import {
  Menu,
  MenuItemOption,
  MenuList,
  MenuOptionGroup
} from '@chakra-ui/react'
import { Flex } from '@chakra-ui/react'

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
    <Flex gap={2} alignItems={'center'}>
      <Menu closeOnSelect={true}>
        <MenuHeading title={'Status'} active={status[0]} />
        <MenuList fontSize={'sm'}>
          <MenuOptionGroup
            type='checkbox'
            value={status}
            onChange={handleStatusChange}
          >
            {generateMenuItems(availableStatus)}
          </MenuOptionGroup>
        </MenuList>
      </Menu>
      <Menu closeOnSelect={true}>
        <MenuHeading title={'License Type'} active={spdx[0]} />
        <MenuList fontSize={'sm'}>
          <MenuOptionGroup
            type='checkbox'
            value={spdx}
            onChange={handleSpdxChange}
          >
            {generateMenuItems(availableSpdxFilters)}
          </MenuOptionGroup>
        </MenuList>
      </Menu>
    </Flex>
  )
}

export default LicenseFilter
