import { gql, useQuery } from '@apollo/client'
import { useState } from 'react'

import { Box, Menu, Stack } from '@chakra-ui/react'
import { MenuItemOption, MenuList, MenuOptionGroup } from '@chakra-ui/react'

import MenuHeading from 'components/Misc/MenuHeading'

export const GetAllRequests = gql`
  query GetAllRequests(
    $first: Int
    $field: RequestOrderByFields!
    $direction: OrderByDirection!
  ) {
    requests(first: $first, orderBy: { field: $field, direction: $direction }) {
      nodes {
        email
        productName
        status
      }
    }
  }
`

const Filters = ({ setFilters }) => {
  const { data } = useQuery(GetAllRequests, {
    variables: {
      first: 500,
      field: 'REQUESTS_REQUESTED_AT',
      direction: 'DESC'
    }
  })

  const { nodes } = data?.requests || ''
  const emailList = [...new Set(nodes?.map((item) => item?.email))]
  const productList = [...new Set(nodes?.map((item) => item?.productName))]
  const statusList = [...new Set(nodes?.map((item) => item?.status))]

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
        hidden={emailList?.length === 0}
        sx={{ w: 'fit-content', pos: 'relative' }}
      >
        <Menu closeOnSelect={false}>
          <MenuHeading
            title={'Email'}
            active={email.length !== 0 && !email.includes('all')}
          />
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
        hidden={productList?.length === 0}
        sx={{ w: 'fit-content', pos: 'relative' }}
      >
        <Menu closeOnSelect={false}>
          <MenuHeading
            title={'Product'}
            active={product.length !== 0 && !product.includes('all')}
          />
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
        hidden={statusList?.length === 0}
        sx={{ w: 'fit-content', pos: 'relative' }}
      >
        <Menu closeOnSelect={false}>
          <MenuHeading
            title={'Status'}
            active={status.length !== 0 && !status.includes('all')}
          />
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
