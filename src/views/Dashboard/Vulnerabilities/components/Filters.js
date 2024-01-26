import {
  Box,
  Menu,
  MenuItemOption,
  MenuList,
  MenuOptionGroup,
  Stack
} from '@chakra-ui/react'
import { useState } from 'react'
import FilterButton from 'components/Misc/FilterButton'
import CheckMark from 'components/Misc/CheckMark'

const Filters = () => {
  const [products, setProducts] = useState([])
  const [versions, setVersions] = useState([])
  const [statuses, setStatuses] = useState([])
  const [envs, setEnvs] = useState([])

  return (
    <Stack direction={'row'} alignItems={'center'} gap={1}>
      {/* PRODUCTS */}
      <Box width={'fit-content'} position={'relative'}>
        <Menu closeOnSelect={true}>
          {products.length !== 0 && !products.includes('all') && <CheckMark />}
          <FilterButton>Product</FilterButton>
          <MenuList
            minHeight={'auto'}
            maxHeight={'300px'}
            overflow={'hidden'}
            overflowY={'scroll'}
          >
            <MenuOptionGroup
              type='checkbox'
              value={products}
              onChange={(value) =>
                setProducts(value.includes('all') ? [] : value)
              }
            >
              {[
                'all',
                'amqp-client',
                'commons-text',
                'guava',
                'h2',
                'http2-hpack',
                'http2-server'
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
      {/* VERSIONS */}
      <Box width={'fit-content'} position={'relative'}>
        <Menu closeOnSelect={true}>
          {versions.length !== 0 && !versions.includes('all') && <CheckMark />}
          <FilterButton>Versions</FilterButton>
          <MenuList
            minHeight={'auto'}
            maxHeight={'300px'}
            overflow={'hidden'}
            overflowY={'scroll'}
          >
            <MenuOptionGroup
              type='checkbox'
              value={versions}
              onChange={(value) =>
                setVersions(value.includes('all') ? [] : value)
              }
            >
              {['1.0.0', '2.3.1', '2.3.2', '2.3.3', '3.0.0', '4.0.0'].map(
                (item, index) => (
                  <MenuItemOption key={index} value={item} fontSize={'sm'}>
                    {item}
                  </MenuItemOption>
                )
              )}
            </MenuOptionGroup>
          </MenuList>
        </Menu>
      </Box>
      {/* ENVIRONMENT */}
      <Box width={'fit-content'} position={'relative'}>
        <Menu closeOnSelect={true}>
          {envs.length !== 0 && !envs.includes('all') && <CheckMark />}
          <FilterButton>Environment</FilterButton>
          <MenuList
            minHeight={'auto'}
            maxHeight={'300px'}
            overflow={'hidden'}
            overflowY={'scroll'}
          >
            <MenuOptionGroup
              type='checkbox'
              value={envs}
              onChange={(value) => setEnvs(value.includes('all') ? [] : value)}
            >
              {[
                'all',
                'default',
                'development',
                'production',
                'feature',
                'improvement'
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
      {/* STATUSES */}
      <Box width={'fit-content'} position={'relative'}>
        <Menu closeOnSelect={true}>
          {statuses.length !== 0 && !statuses.includes('all') && <CheckMark />}
          <FilterButton>Status</FilterButton>
          <MenuList
            minHeight={'auto'}
            maxHeight={'300px'}
            overflow={'hidden'}
            overflowY={'scroll'}
          >
            <MenuOptionGroup
              type='checkbox'
              value={statuses}
              onChange={(value) =>
                setStatuses(value.includes('all') ? [] : value)
              }
            >
              {[
                'All',
                'Unspecified',
                'In Triage',
                'Not Affected',
                'False Positive',
                'Affected',
                'Fixed'
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
