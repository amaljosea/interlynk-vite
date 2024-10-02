import React from 'react'

import { Button, Flex, Icon, Progress, Td, Text, Tr } from '@chakra-ui/react'

import { useThemeColor } from 'hooks/useThemeColors'

import { FaEllipsisV } from 'react-icons/fa'

function DashboardTableRow(props) {
  const { logo, name, status, budget, progression } = props
  const { inverseSecondaryBgColor } = useThemeColor(['inverseSecondaryBgColor'])

  return (
    <Tr>
      <Td minWidth={{ sm: '250px' }} pl='0px'>
        <Flex alignItems='center' py='.8rem' minWidth='100%' flexWrap='nowrap'>
          <Icon as={logo} h={'24px'} w={'24px'} me='18px' />
          <Text fontSize='md' color={inverseSecondaryBgColor} minWidth='100%'>
            {name}
          </Text>
        </Flex>
      </Td>
      <Td>
        <Text fontSize='md' color={inverseSecondaryBgColor} pb='.5rem'>
          {budget}
        </Text>
      </Td>
      <Td>
        <Text fontSize='md' color={inverseSecondaryBgColor} pb='.5rem'>
          {status}
        </Text>
      </Td>
      <Td>
        <Flex direction='column'>
          <Text
            fontSize='md'
            color='teal.300'
            fontWeight='bold'
            pb='.2rem'
          >{`${progression}%`}</Text>
          <Progress
            colorScheme={progression === 100 ? 'teal' : 'cyan'}
            size='xs'
            value={progression}
            borderRadius='15px'
          />
        </Flex>
      </Td>
      <Td>
        <Button p='0px' bg='transparent'>
          <Icon as={FaEllipsisV} color='gray.400' cursor='pointer' />
        </Button>
      </Td>
    </Tr>
  )
}

export default DashboardTableRow
