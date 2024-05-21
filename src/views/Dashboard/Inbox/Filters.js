import { useState } from 'react'

import {
  Box,
  Menu,
  MenuItemOption,
  MenuList,
  MenuOptionGroup,
  Stack
} from '@chakra-ui/react'

import CheckMark from 'components/Misc/CheckMark'
import MenuHeading from 'components/Misc/MenuHeading'

const Filters = ({ setFilters }) => {
  const [email, setEmail] = useState([])
  const [product, setProduct] = useState([])
  const [status, setStatus] = useState([])

  const onFilterEmail = (value) => {
    const filterValue = value?.includes('All') ? undefined : value
    setEmail(value?.includes('All') ? [] : value)
    setFilters((oldFilters) => ({
      ...oldFilters,
      email: filterValue
    }))
  }
  const onFilterProduct = (value) => {
    const filterValue = value?.includes('All') ? undefined : value
    setProduct(value?.includes('All') ? [] : value)
    setFilters((oldFilters) => ({
      ...oldFilters,
      product: filterValue
    }))
  }
  const onFilterStatus = (value) => {
    const filterValue = value?.includes('all') ? undefined : value
    setStatus(value?.includes('all') ? [] : value)
    setFilters((oldFilters) => ({
      ...oldFilters,
      status: filterValue
    }))
  }

  return (
    <Stack direction={'row'} alignItems={'center'} gap={1}>
      {/* EMAILS */}
      <Box width={'fit-content'} position={'relative'}>
        <Menu closeOnSelect={false}>
          {email.length !== 0 && !email.includes('all') && <CheckMark />}
          <MenuHeading title={'Email'} />
          <MenuList>
            <MenuOptionGroup
              type='checkbox'
              value={email}
              onChange={onFilterEmail}
            >
              {[
                'All',
                'sp@interlynk.io',
                'rcn@interlynk.io',
                'sijin@interlynk.io',
                'amal@interlynk.io'
              ].map((item, index) => (
                <MenuItemOption key={index} value={item} fontSize={'sm'}>
                  {item}
                </MenuItemOption>
              ))}
            </MenuOptionGroup>
          </MenuList>
        </Menu>
      </Box>
      {/* PRODUCTS */}
      <Box width={'fit-content'} position={'relative'}>
        <Menu closeOnSelect={false}>
          {product.length !== 0 && !product.includes('all') && <CheckMark />}
          <MenuHeading title={'Product'} />
          <MenuList>
            <MenuOptionGroup
              type='checkbox'
              value={product}
              onChange={onFilterProduct}
            >
              {[
                'All',
                'biotronix',
                'lynk-api',
                'lynk-dash-app',
                'calibrator',
                'dropwizard'
              ].map((item, index) => (
                <MenuItemOption key={index} value={item} fontSize={'sm'}>
                  {item}
                </MenuItemOption>
              ))}
            </MenuOptionGroup>
          </MenuList>
        </Menu>
      </Box>
      {/* STATUS */}
      <Box width={'fit-content'} position={'relative'}>
        <Menu closeOnSelect={false}>
          {status.length !== 0 && !status.includes('all') && <CheckMark />}
          <MenuHeading title={'Status'} />
          <MenuList>
            <MenuOptionGroup
              type='checkbox'
              value={status}
              onChange={onFilterStatus}
            >
              {[
                'all',
                'sent',
                'bounced',
                'canceled',
                'declined',
                'uploaded'
              ].map((item, index) => (
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

export default Filters
