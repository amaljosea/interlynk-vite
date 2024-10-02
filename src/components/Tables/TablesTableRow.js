import React from 'react'

import {
  Avatar,
  Badge,
  Button,
  Flex,
  Td,
  Text,
  Tr,
  useColorModeValue
} from '@chakra-ui/react'

import { useThemeColor } from 'hooks/useThemeColors'

function TablesTableRow(props) {
  const { logo, name, email, subdomain, domain, status, date } = props
  const { inverseSecondaryBgColor } = useThemeColor(['inverseSecondaryBgColor'])
  const bgStatus = useColorModeValue('gray.400', '#1a202c')
  const colorStatus = useColorModeValue('white', 'gray.400')

  return (
    <Tr>
      <Td minWidth={{ sm: '250px' }} pl='0px'>
        <Flex align='center' py='.8rem' minWidth='100%' flexWrap='nowrap'>
          <Avatar src={logo} w='50px' borderRadius='12px' me='18px' />
          <Flex direction='column'>
            <Text fontSize='md' color={inverseSecondaryBgColor} minWidth='100%'>
              {name}
            </Text>
            <Text fontSize='sm' color='gray.400' fontWeight='normal'>
              {email}
            </Text>
          </Flex>
        </Flex>
      </Td>

      <Td>
        <Flex direction='column'>
          <Text fontSize='md' color={inverseSecondaryBgColor} fontWeight='bold'>
            {domain}
          </Text>
          <Text fontSize='sm' color='gray.400' fontWeight='normal'>
            {subdomain}
          </Text>
        </Flex>
      </Td>
      <Td>
        <Badge
          bg={status === 'Online' ? 'green.400' : bgStatus}
          color={status === 'Online' ? 'white' : colorStatus}
          fontSize='16px'
          p='3px 10px'
          borderRadius='8px'
        >
          {status}
        </Badge>
      </Td>
      <Td>
        <Text
          fontSize='md'
          color={inverseSecondaryBgColor}
          fontWeight='bold'
          pb='.5rem'
        >
          {date}
        </Text>
      </Td>
      <Td>
        <Button p='0px' bg='transparent' variant='no-hover'>
          <Text
            fontSize='md'
            color='gray.400'
            fontWeight='bold'
            cursor='pointer'
          >
            Edit
          </Text>
        </Button>
      </Td>
    </Tr>
  )
}

export default TablesTableRow
