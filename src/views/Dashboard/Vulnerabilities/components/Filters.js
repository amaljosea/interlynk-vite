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

const Filters = () => {
  const [components, setComponents] = useState([])
  const [statuses, setStatuses] = useState([])

  return (
    <Stack direction={'row'} alignItems={'center'} gap={1}>
      {/* PRODUCTS */}
      <Box width={'fit-content'} position={'relative'}>
        <Menu closeOnSelect={true}>
          {components.length !== 0 && !components.includes('all') && (
            <CheckMark />
          )}
          <MenuButton
            as={Button}
            colorScheme='blue'
            fontWeight='normal'
            fontSize={'sm'}
            leftIcon={<FaFilter size={14} />}
          >
            Components
          </MenuButton>
          <MenuList>
            <MenuOptionGroup
              type='checkbox'
              value={components}
              onChange={(value) =>
                setComponents(value.includes('all') ? [] : value)
              }
            >
              {[
                'all',
                'amqp-client',
                'commons-text',
                'guava',
                'h2',
                'http2-hpack',
                'http2-server',
                'jackson-databind',
                'jersey-common',
                'jetty-http',
                'jetty-server',
                'jetty-servlets',
                'liquibase-core',
                'logback-classic',
                'logback-core',
                'snakeyaml'
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
          {statuses.length !== 0 && !statuses.includes('all') && <CheckMark />}
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
              value={statuses}
              onChange={(value) =>
                setStatuses(value.includes('all') ? [] : value)
              }
            >
              {[
                'all',
                'in-triage',
                'false-positive',
                'no-affected',
                'affected',
                'fixed'
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
