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
import { CheckIcon } from '@chakra-ui/icons'
import { FaFilter } from 'react-icons/fa'
import { useState } from 'react'
import SearchFilter from 'views/Sbom/components/SearchFilter'

const CheckMark = () => {
  return (
    <CheckIcon
      w={5}
      h={5}
      bg={'white'}
      color={'blue.500'}
      border={'1px solid #4299E1'}
      rounded={'full'}
      p={'4px'}
      position={'absolute'}
      right={-1}
      top={-1}
      zIndex={11}
    />
  )
}

const VulnsFilters = () => {
  const [severity, setSeverity] = useState([])
  const [source, setSource] = useState([])

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
              {['All', 'NVD', 'OSV'].map((item, index) => (
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
          {source.length !== 0 && !source.includes('all') && <CheckMark />}
          <MenuButton
            as={Button}
            colorScheme='blue'
            fontWeight='normal'
            fontSize={'sm'}
            leftIcon={<FaFilter size={14} />}
          >
            Products
          </MenuButton>
          <MenuList>
            <MenuOptionGroup
              type='checkbox'
              value={source}
              onChange={(value) =>
                setSource(value.includes('all') ? [] : value)
              }
            >
              {['All', 'lynk-api', 'lynk-dash-app', 'sbomqs', 'sbomgr'].map(
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
          {source.length !== 0 && !source.includes('all') && <CheckMark />}
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
              value={source}
              onChange={(value) =>
                setSource(value.includes('all') ? [] : value)
              }
            >
              {['All', 'Yes', 'No'].map((item, index) => (
                <MenuItemOption key={index} value={item} fontSize={'sm'}>
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
