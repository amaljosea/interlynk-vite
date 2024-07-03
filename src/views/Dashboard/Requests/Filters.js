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

const Filters = ({ setFilters, data }) => {
  const emailList = [...new Set(data?.map((item) => item.email))]
  const productList = [...new Set(data?.map((item) => item.productName))]
  const statusList = [...new Set(data?.map((item) => item.status))]

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
      <Box
        width={'fit-content'}
        position={'relative'}
        hidden={emailList?.length === 0}
      >
        <Menu closeOnSelect={false}>
          {email.length !== 0 && !email.includes('all') && <CheckMark />}
          <MenuHeading title={'Email'} />
          <MenuList>
            <MenuOptionGroup
              type='checkbox'
              value={email}
              onChange={onFilterEmail}
            >
              {emailList?.map((item, index) => (
                <MenuItemOption key={index} value={item} fontSize={'sm'}>
                  {item}
                </MenuItemOption>
              ))}
            </MenuOptionGroup>
          </MenuList>
        </Menu>
      </Box>
      {/* PRODUCTS */}
      <Box
        width={'fit-content'}
        position={'relative'}
        hidden={productList?.length === 0}
      >
        <Menu closeOnSelect={false}>
          {product.length !== 0 && !product.includes('all') && <CheckMark />}
          <MenuHeading title={'Product'} />
          <MenuList>
            <MenuOptionGroup
              type='checkbox'
              value={product}
              onChange={onFilterProduct}
            >
              {productList?.map((item, index) => (
                <MenuItemOption key={index} value={item} fontSize={'sm'}>
                  {item ? item : '(Blanks)'}
                </MenuItemOption>
              ))}
            </MenuOptionGroup>
          </MenuList>
        </Menu>
      </Box>
      {/* STATUS */}
      <Box
        width={'fit-content'}
        position={'relative'}
        hidden={statusList?.length === 0}
      >
        <Menu closeOnSelect={false}>
          {status.length !== 0 && !status.includes('all') && <CheckMark />}
          <MenuHeading title={'Status'} />
          <MenuList>
            <MenuOptionGroup
              type='checkbox'
              value={status}
              onChange={onFilterStatus}
            >
              {statusList?.map((item, index) => (
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
