import { ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons'
import { Flex, Text, Tooltip } from '@chakra-ui/react'

import { useThemeColor } from 'hooks/useThemeColors'

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
        <Text color={primaryTextColor}>
          {`${(value[0] * 100).toFixed(2)} %`}
        </Text>
        {value?.length > 1 ? (
          value[0] > value[value?.length - 1] ? (
            <Tooltip
              placement='top'
              label={`Up from ${(value[value?.length - 1] * 100).toFixed(3)} % last week`}
            >
              <ChevronUpIcon w={5} h={5} color={primarySuccessColor} />
            </Tooltip>
          ) : value[0] < value[value?.length - 1] ? (
            <Tooltip
              placement='top'
              label={`Down from ${(value[value?.length - 1] * 100).toFixed(3)} % last week`}
            >
              <ChevronDownIcon w={5} h={5} color={primaryErrorColor} />
            </Tooltip>
          ) : null
        ) : null}
      </Flex>
    )
  }

  return <Text color={primaryTextColor}>N/A</Text>
}

export default EpssTag
