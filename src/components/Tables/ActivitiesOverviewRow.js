import React from 'react'
import { getFullDateAndTime } from 'utils'

import { Box, Flex, Icon, Stack, Text, Tooltip } from '@chakra-ui/react'

import { useThemeColor } from 'hooks/useThemeColors'

import { BsBack } from 'react-icons/bs'
import {
  FaDownload,
  FaEdit,
  FaHammer,
  FaMinus,
  FaPlus,
  FaRobot,
  FaTimesCircle,
  FaUpload
} from 'react-icons/fa'
import { FaArrowsRotate } from 'react-icons/fa6'

function valueToColor(action, event, orig, updated) {
  if (action == 'updated') {
    if (updated == '[]') {
      // eslint-disable-next-line
      return 'red.500'
    } else if (orig == '[]') {
      // eslint-disable-next-line
      return 'green.500'
    } else {
      // eslint-disable-next-line
      return 'blue.500'
    }
  } else if (action == 'created') {
    if (event == 'auto_check') {
      // eslint-disable-next-line
      return 'blue.500'
    } else {
      // eslint-disable-next-line
      return 'green.500'
    }
  } else if (
    action == 'tool' ||
    action === 'retracted' ||
    action === 'restored' ||
    action === 'replaced'
  ) {
    // eslint-disable-next-line
    return 'blue.500'
  } else if (action == 'auto_check') {
    // eslint-disable-next-line
    return 'purple.500'
  } else if (action == 'download') {
    // eslint-disable-next-line
    return 'blue.500'
  } else if (action == 'uploaded') {
    // eslint-disable-next-line
    return 'green.500'
  } else if (action == 'failed') {
    // eslint-disable-next-line
    return 'pink.500'
  } else if (action == 'destroyed') {
    // eslint-disable-next-line
    return 'pink.500'
  }
}

function valueToIcon(action, event, orig, updated) {
  if (action == 'updated') {
    if (updated == '[]') {
      return FaMinus
    } else if (orig == '[]') {
      return FaPlus
    } else {
      return FaEdit
    }
  } else if (action == 'created') {
    return FaHammer
  } else if (action == 'replaced') {
    return FaArrowsRotate
  } else if (action == 'retracted' || action == 'restored') {
    return BsBack
  } else if (action == 'tool') {
    return FaHammer
  } else if (action == 'auto_check') {
    return FaRobot
  } else if (action == 'download') {
    return FaDownload
  } else if (action == 'uploaded') {
    return FaUpload
  } else if (action == 'failed') {
    return FaTimesCircle
  } else if (action == 'destroyed') {
    return FaMinus
  }
}

function valueToText(action, event, orig, updated) {
  if (action == 'updated') {
    if (updated == '[]') {
      return `${orig}`
    } else if (orig == '[]') {
      return `${updated}`
    } else if (event === 'primary') {
      return `Modified: ${orig === 'f' ? 'False' : 'True'} to ${
        updated === 't' ? 'True' : 'False'
      }`
    } else {
      return `Modified: ${orig} to ${updated}`
    }
  } else if (action == 'created') {
    return `${updated}`
  } else if (action == 'retracted' || action == 'restored') {
    return `${orig}`
  } else if (action == 'tool') {
    return `${updated}`
  } else if (action == 'auto_check') {
    return `${updated}`
  } else if (action == 'downloaded') {
    return `${updated}`
  } else if (action == 'uploaded') {
    return `${updated}`
  } else if (action == 'failed') {
    return `${updated?.substring(0, 100)}...`
  }
}

function ActivitiesOverviewRow(props) {
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

  const handleClick = (event) => {
    if (event === 'purl') {
      setActiveRow(updated)
      onOpen()
    } else if (event === 'cpes') {
      setActiveRow(updated)
      onCpeOpen()
    } else {
      return null
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
        ></Box>
      </Flex>
      <Stack
        mb={1}
        direction={'column'}
        spacing={0.5}
        cursor={'pointer'}
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
