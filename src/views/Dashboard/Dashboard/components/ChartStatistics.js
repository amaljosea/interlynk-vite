import React from 'react'

import { Flex, Progress, Text } from '@chakra-ui/react'

import IconBox from 'components/Icons/IconBox'

import { useThemeColor } from 'hooks/useThemeColors'

const ChartStatistics = ({ title, amount, icon, percentage }) => {
  const { lightTealBorder, inverseSecondaryBgColor, secondaryTextColor } =
    useThemeColor([
      'lightTealBorder',
      'inverseSecondaryBgColor',
      'secondaryTextColor'
    ])

  return (
    <Flex direction='column'>
      <Flex alignItems='center'>
        <IconBox h={'30px'} w={'30px'} bg={lightTealBorder} me='6px'>
          {icon}
        </IconBox>
        <Text fontSize='sm' color={secondaryTextColor} fontWeight='semibold'>
          {title}
        </Text>
      </Flex>
      <Text
        fontSize='lg'
        color={inverseSecondaryBgColor}
        fontWeight='bold'
        mb='6px'
        my='6px'
      >
        {amount}
      </Text>
      <Progress
        colorScheme='teal'
        borderRadius='12px'
        h='5px'
        value={percentage}
      />
    </Flex>
  )
}

export default ChartStatistics
