import React from 'react'

import { Box, Flex, Icon, Text } from '@chakra-ui/react'

import { useThemeColor } from 'hooks/useThemeColors'

function TransactionRow(props) {
  const { inverseSecondaryBgColor, secondaryTextColor } = useThemeColor([
    'inverseSecondaryBgColor',
    'secondaryTextColor'
  ])
  const { key, name, date, logo, price } = props

  return (
    <Flex key={key} my='1rem' justifyContent='space-between'>
      <Flex alignItems='center'>
        <Box
          me='12px'
          borderRadius='50%'
          color={
            price[0] === '+'
              ? 'green.400'
              : price[0] === '-'
                ? 'red.400'
                : secondaryTextColor
          }
          border='1px solid'
          display='flex'
          alignItems='center'
          justifyContent='center'
          w='35px'
          h='35px'
        >
          <Icon as={logo} />
        </Box>
        <Flex direction='column'>
          <Text
            fontSize={{ sm: 'md', md: 'lg', lg: 'md' }}
            color={inverseSecondaryBgColor}
            fontWeight='bold'
          >
            {name}
          </Text>
          <Text
            fontSize={{ sm: 'xs', md: 'sm', lg: 'xs' }}
            color={secondaryTextColor}
            fontWeight='semibold'
          >
            {date}
          </Text>
        </Flex>
      </Flex>
      <Box
        color={
          price[0] === '+'
            ? 'green.400'
            : price[0] === '-'
              ? 'red.400'
              : { inverseSecondaryBgColor }
        }
      >
        <Text fontSize={{ sm: 'md', md: 'lg', lg: 'md' }} fontWeight='bold'>
          {price}
        </Text>
      </Box>
    </Flex>
  )
}

export default TransactionRow
