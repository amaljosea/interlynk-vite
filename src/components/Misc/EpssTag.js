import { Flex, Text, Tooltip } from '@chakra-ui/react'

import { useThemeColor } from 'hooks/useThemeColors'

import { LuChevronDown, LuChevronUp } from 'react-icons/lu'

const EpssTag = ({ value }) => {
  const { primaryTextColor, primarySuccessColor, primaryErrorColor } =
    useThemeColor([
      'primaryTextColor',
      'primarySuccessColor',
      'primaryErrorColor'
    ])

  if (value?.length > 0) {
    return (
      <Flex gap={1} flexWrap={'wrap'} alignItems={'center'}>
        <Text fontSize={14} color={primaryTextColor}>
          {`${(value[0] * 100).toFixed(2)} %`}
        </Text>
        {value?.length > 1 ? (
          value[0] > value[value?.length - 1] ? (
            <Tooltip
              placement='top'
              label={`Up from ${(value[value?.length - 1] * 100).toFixed(3)} % last week`}
            >
              <LuChevronUp w={5} h={5} color={primarySuccessColor} />
            </Tooltip>
          ) : value[0] < value[value?.length - 1] ? (
            <Tooltip
              placement='top'
              label={`Down from ${(value[value?.length - 1] * 100).toFixed(3)} % last week`}
            >
              <LuChevronDown w={5} h={5} color={primaryErrorColor} />
            </Tooltip>
          ) : null
        ) : null}
      </Flex>
    )
  }

  return (
    <Text fontSize={14} color={primaryTextColor}>
      N/A
    </Text>
  )
}

export default EpssTag
