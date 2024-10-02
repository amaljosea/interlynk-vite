import React from 'react'

import { Avatar, Flex, Text } from '@chakra-ui/react'

import { ClockIcon } from 'components/Icons/Icons'

import { useThemeColor } from 'hooks/useThemeColors'

export function ItemContent(props) {
  const { inverseSecondaryBgColor, secondaryTextColor, headingTextColor } =
    useThemeColor([
      'inverseSecondaryBgColor',
      'secondaryTextColor',
      'headingTextColor'
    ])

  const spacing = ' '
  return (
    <>
      <Avatar
        name={props.aName}
        src={props.aSrc}
        borderRadius='12px'
        me='16px'
      />
      <Flex flexDirection='column'>
        <Text fontSize='14px' mb='5px' color={headingTextColor}>
          <Text fontWeight='bold' fontSize='14px' as='span'>
            {props.boldInfo}
            {spacing}
          </Text>
          {props.info}
        </Text>
        <Flex alignItems='center'>
          <ClockIcon color={secondaryTextColor} w='13px' h='13px' me='3px' />
          <Text fontSize='xs' lineHeight='100%' color={inverseSecondaryBgColor}>
            {props.time}
          </Text>
        </Flex>
      </Flex>
    </>
  )
}
