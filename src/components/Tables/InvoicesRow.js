import React from 'react'

import { Box, Button, Flex, Icon, Spacer, Text } from '@chakra-ui/react'

import { useThemeColor } from 'hooks/useThemeColors'

function InvoicesRow(props) {
  const { inverseSecondaryBgColor, secondaryTextColor } = useThemeColor([
    'inverseSecondaryBgColor',
    'secondaryTextColor'
  ])
  const { key, date, code, price, format, logo } = props

  return (
    <Flex key={key} my={{ sm: '1rem', xl: '10px' }} alignItems='center'>
      <Flex direction='column'>
        <Text fontSize='md' color={inverseSecondaryBgColor} fontWeight='bold'>
          {date}
        </Text>
        <Text
          fontSize='sm'
          color={secondaryTextColor}
          fontWeight='semibold'
          me='16px'
        >
          {code}
        </Text>
      </Flex>
      <Spacer />
      <Box me='12px'>
        <Text fontSize='md' color={secondaryTextColor} fontWeight='semibold'>
          {price}
        </Text>
      </Box>
      <Button
        title='Invoice format'
        p='0px'
        bg='transparent'
        variant='no-hover'
      >
        <Flex alignItems='center' p='12px'>
          <Icon as={logo} w='20px' h='auto' me='5px' />
          <Text fontSize='md' color={inverseSecondaryBgColor} fontWeight='bold'>
            {format}
          </Text>
        </Flex>
      </Button>
    </Flex>
  )
}

export default InvoicesRow
