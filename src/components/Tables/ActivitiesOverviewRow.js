import React from 'react'
import {
  getFullDateAndTime,
  valueToColor,
  valueToIcon,
  valueToText
} from 'utils'

import { Box, Flex, Icon, Stack, Text, Tooltip } from '@chakra-ui/react'

import { useThemeColor } from 'hooks/useThemeColors'

const ActivitiesOverviewRow = (props) => {
  const {
    date,
    index,
    arrLength,
    action,
    changedBy,
    event,
    orig,
    updated,
    setActiveRow,
    onOpen,
    onCpeOpen
  } = props

  const { headingTextColor, grayBorderColor, secondaryTextColor } =
    useThemeColor(['headingTextColor', 'grayBorderColor', 'secondaryTextColor'])

  const handleClick = () => {
    if (event === 'purl' || event === 'cpes') {
      setActiveRow(updated)
      event === 'purl' ? onOpen() : onCpeOpen()
    }
  }

  const tooltipLabel = action?.charAt(0).toUpperCase() + action?.slice(1)
  return (
    <Flex alignItems='flex-start' minH='78px' justifyContent='start' mb='5px'>
      <Flex direction='column' h='100%'>
        <Tooltip label={tooltipLabel} placement='top'>
          <Box>
            <Icon
              as={valueToIcon(action, event, orig, updated)}
              h={'30px'}
              w={'30px'}
              pe={'6px'}
              mx={'-10px'}
              mr={'10px'}
              pb={'6px'}
              zIndex='1'
              color={valueToColor(action, event, orig, updated)}
            />
          </Box>
        </Tooltip>
        <Box
          w='2px'
          bg={grayBorderColor}
          h={index === arrLength - 1 ? '15px' : '100%'}
        />
      </Flex>
      <Stack
        mb={1}
        direction={'column'}
        spacing={0.5}
        cursor={event === 'purl' || event === 'cpes' ? 'pointer' : ''}
        wordBreak={'break-all'}
        onClick={() => handleClick(event)}
      >
        <Text fontSize='sm' color={headingTextColor} fontWeight='normal'>
          {event} by {changedBy}
        </Text>
        <Text
          fontSize='sm'
          color={headingTextColor}
          fontWeight='normal'
          wordBreak={'break-all'}
        >
          {valueToText(action, event, orig, updated)}
        </Text>
        <Text fontSize='xs' color={secondaryTextColor} fontWeight='normal'>
          {getFullDateAndTime(date)}
        </Text>
      </Stack>
    </Flex>
  )
}

export default ActivitiesOverviewRow
