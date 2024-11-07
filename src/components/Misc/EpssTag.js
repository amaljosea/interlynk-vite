import { ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons'
import { Flex, Tag, TagLabel, Text, Tooltip } from '@chakra-ui/react'

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
      <Flex alignItems='center' gap='0'>
        <Tag
          size='md'
          width={'100px'}
          variant='subtle'
          alignItems='center'
          justifyContent='center'
        >
          <TagLabel>{`${(value[0] * 100).toFixed(3)} %`}</TagLabel>
        </Tag>
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

  return (
    <Text w={'100px'} textAlign={'center'} color={primaryTextColor}>
      N/A
    </Text>
  )
}

export default EpssTag
