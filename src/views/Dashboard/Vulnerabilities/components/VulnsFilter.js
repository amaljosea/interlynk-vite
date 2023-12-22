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
import { useState } from 'react'

const VulnsFilters = () => {
  const [severity, setSeverity] = useState([])
  const [source, setSource] = useState([])
  const [products, setProducts] = useState([])
  const [archived, setArchived] = useState([])

  return (
    <Stack direction={'row'} alignItems={'center'} gap={1}>
      {/* SEVERITY */}
      <Box width={'fit-content'} position={'relative'}>
        <Menu closeOnSelect={true}>
          {severity.length !== 0 && !severity.includes('all') && <CheckMark />}
          <MenuButton
            as={Button}
            colorScheme='blue'
            fontWeight='normal'
            fontSize={'sm'}
            leftIcon={<FaFilter size={14} />}
          >
            Severity
          </MenuButton>
          <MenuList>
            <MenuOptionGroup
              type='checkbox'
              value={severity}
              onChange={(value) =>
                setSeverity(value.includes('all') ? [] : value)
              }
            >
              {['all', 'critical', 'high', 'medium', 'low'].map(
                (item, index) => (
                  <MenuItemOption
                    key={index}
                    value={item}
                    fontSize={'sm'}
                    textTransform={'capitalize'}
                  >
                    {item}
                  </MenuItemOption>
                )
              )}
            </MenuOptionGroup>
          </MenuList>
        </Menu>
      </Box>
      {/* Source */}
      <Box width={'fit-content'} position={'relative'}>
        <Menu closeOnSelect={true}>
          {source.length !== 0 && !source.includes('all') && <CheckMark />}
          <MenuButton
            as={Button}
            colorScheme='blue'
            fontWeight='normal'
            fontSize={'sm'}
            leftIcon={<FaFilter size={14} />}
          >
            Source
          </MenuButton>
          <MenuList>
            <MenuOptionGroup
              type='checkbox'
              value={source}
              onChange={(value) =>
                setSource(value.includes('all') ? [] : value)
              }
            >
              {['all', 'NVD', 'OSV'].map((item, index) => (
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
      {/* Products */}
      <Box width={'fit-content'} position={'relative'}>
        <Menu closeOnSelect={true}>
          {products.length !== 0 && !products.includes('all') && <CheckMark />}
          <MenuButton
            as={Button}
            colorScheme='blue'
            fontWeight='normal'
            fontSize={'sm'}
            leftIcon={<FaFilter size={14} />}
          >
            Versions
          </MenuButton>
          <MenuList>
            <MenuOptionGroup
              type='checkbox'
              value={products}
              onChange={(value) =>
                setProducts(value.includes('all') ? [] : value)
              }
            >
              {['1.0.0', '1.0.1', '1.0.2', '2.0.0', '2.0.1'].map(
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
      {/* Archived */}
      <Box width={'fit-content'} position={'relative'}>
        <Menu closeOnSelect={true}>
          {archived.length !== 0 && !archived.includes('all') && <CheckMark />}
          <MenuButton
            as={Button}
            colorScheme='blue'
            fontWeight='normal'
            fontSize={'sm'}
            leftIcon={<FaFilter size={14} />}
          >
            Archived
          </MenuButton>
          <MenuList>
            <MenuOptionGroup
              type='checkbox'
              value={archived}
              onChange={(value) =>
                setArchived(value.includes('all') ? [] : value)
              }
            >
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

export default VulnsFilters
