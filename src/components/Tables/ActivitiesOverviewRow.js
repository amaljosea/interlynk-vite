import { Box, Flex, Icon, Text, useColorModeValue, Tooltip, Tag } from '@chakra-ui/react'
import React from 'react'
import { getFullDateAndTime } from 'utils'
import { FaPlus, FaMinus, FaEdit, FaHammer, FaRobot, FaUpload, FaDownload, FaTimesCircle } from "react-icons/fa";


const setColor = (type) => {
  switch (type) {
    case 'create':
      return 'green'
    case 'created':
      return 'green'
    case 'update':
      return 'blue'
    case 'updated':
      return 'blue'
    case 'modified':
      return 'pink'
    case 'destroyed':
      return 'red'
    case 'rerun':
      return 'purple'
  }
}

function valueToColor(action, event, orig, updated) {
  if (action == 'updated') {
    if (updated == '[]') {
      return 'red.500'
    } else if (orig == '[]') {
      return 'green.500'
    } else {
      return 'blue.500'
    }
  } else if (action == 'created') {
    if (event == 'auto_check') {
      return 'blue.500'
    } else {
      return 'green.500'
    }
  } else if (action == 'tool') {
    return 'blue.500'
  } else if (action == 'auto_check') {
    return 'purple.500'
  } else if (action == 'download') {
    return 'blue.500'
  } else if (action == 'uploaded') {
    return 'green.500'
  } else if (action == 'failed') {
    return 'pink.500'
  }
}

function valueToIcon(action, event, orig, updated) {
  console.log('ZZZZZ', action)
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
  }
}

function valueToText(action, event, orig, updated) {
  console.log('XXXXX', event)
  console.log('YYYYY', action)
  console.log(orig)
  console.log(updated)
  if (action == 'updated') {
    if (updated == '[]') {
      return `${orig}`
    } else if (orig == '[]') {
      return `${updated}`
    } else {
      return `Modified: ${orig} to ${updated}`
    }
  } else if (action == 'created') {
    return `${updated}`
  } else if (action == 'tool') {
    return `${updated}`
  } else if (action == 'auto_check') {
    return `${updated}`
  } else if (action == 'downloaded') {
    return `${updated}`
  } else if (action == 'uploaded') {
    return `${updated}`
  } else if (action == 'failed') {
    return `${updated}`
  }
}

function ActivitiesOverviewRow(props) {
  const { logo, title, date, color, index, arrLength, action, changedBy, event, orig, updated } = props
  const textColor = useColorModeValue('gray.600', 'white.300')
  const bgIconColor = useColorModeValue('white.300', 'gray.700')

  return (
    <Flex alignItems='center' minH='78px' justifyContent='start' mb='5px'>
      <Flex direction='column' h='100%'>
        <Tooltip placement='top' label={action} textTransform={'capitalize'}>
            <Icon as={valueToIcon(action, event, orig, updated)}
              h={'30px'}
              w={'30px'}
              pe={'6px'}
              mx={'-10px'}
              mr={'10px'}
              pb={'6px'}
              zIndex='1'
              position='relative'
              color={valueToColor(action, event, orig, updated)} />
          </Tooltip>
        <Box
          w='2px'
          bg='gray.200'
          h={index === arrLength - 1 ? '15px' : '100%'}
        ></Box>
      </Flex>
      <Flex direction='column' justifyContent='flex-start' h='100%'>
        <Text fontSize='sm' color={textColor} fontWeight='normal'>
          {event} by {changedBy}
        </Text>
        <Flex direction='row' gap={2}>
        <Text fontSize='sm' color={textColor} fontWeight='normal'>
          {valueToText(action, event, orig, updated)}
        </Text>
        </Flex>
        <Text fontSize='xs' color='gray.400' fontWeight='normal'>
          {getFullDateAndTime(date)}
        </Text>
      </Flex>
    </Flex>
  )
}

export default ActivitiesOverviewRow
