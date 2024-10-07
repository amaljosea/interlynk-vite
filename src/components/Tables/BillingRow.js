import React from 'react'

import { Box, Button, Flex, Icon, Text } from '@chakra-ui/react'

import { useThemeColor } from 'hooks/useThemeColors'

import { FaPencilAlt, FaTrashAlt } from 'react-icons/fa'

function BillingRow(props) {
  const {
    primaryErrorColor,
    inverseSecondaryBgColor,
    primaryBgColor,
    secondaryTextColor
  } = useThemeColor([
    'primaryErrorColor',
    'inverseSecondaryBgColor',
    'primaryBgColor',
    'secondaryTextColor'
  ])

  const { key, name, company, email, number } = props

  return (
    <Box key={key} p='24px' bg={primaryBgColor} my='22px' borderRadius='12px'>
      <Flex justify='space-between' w='100%'>
        <Flex direction='column' maxWidth='70%'>
          <Text
            color={inverseSecondaryBgColor}
            fontSize='md'
            fontWeight='bold'
            mb='10px'
          >
            {name}
          </Text>
          <Text color={secondaryTextColor} fontSize='sm' fontWeight='semibold'>
            Company Name:{' '}
            <Text as='span' color='gray.500'>
              {company}
            </Text>
          </Text>
          <Text color={secondaryTextColor} fontSize='sm' fontWeight='semibold'>
            Email Address:{' '}
            <Text as='span' color='gray.500'>
              {email}
            </Text>
          </Text>
          <Text color={secondaryTextColor} fontSize='sm' fontWeight='semibold'>
            VAT Number:{' '}
            <Text as='span' color='gray.500'>
              {number}
            </Text>
          </Text>
        </Flex>
        <Flex
          direction={{ sm: 'column', md: 'row' }}
          align='flex-start'
          p={{ md: '24px' }}
        >
          <Button
            p='0px'
            bg='transparent'
            mb={{ sm: '10px', md: '0px' }}
            me={{ md: '12px' }}
          >
            <Flex
              color={primaryErrorColor}
              cursor='pointer'
              align='center'
              p='12px'
            >
              <Icon as={FaTrashAlt} me='4px' />
              <Text fontSize='sm' fontWeight='semibold'>
                DELETE
              </Text>
            </Flex>
          </Button>
          <Button p='0px' bg='transparent'>
            <Flex
              color={inverseSecondaryBgColor}
              cursor='pointer'
              align='center'
              p='12px'
            >
              <Icon as={FaPencilAlt} me='4px' />
              <Text fontSize='sm' fontWeight='semibold'>
                EDIT
              </Text>
            </Flex>
          </Button>
        </Flex>
      </Flex>
    </Box>
  )
}

export default BillingRow
