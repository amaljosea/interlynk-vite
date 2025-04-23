import { ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons'
import { Tag, TagLabel, Tooltip } from '@chakra-ui/react'

import { useThemeColor } from 'hooks/useThemeColors'

const EpssTag = ({ value }) => {
  const { primarySuccessColor, primaryErrorColor } = useThemeColor([
    'primarySuccessColor',
    'primaryErrorColor'
  ])

  if (value?.length > 0) {
    return (
      <Tag width={'100px'} alignItems={'center'} justifyContent={'center'}>
        <TagLabel mr={1}>{`${(value[0] * 100).toFixed(2)} %`}</TagLabel>
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
      </Tag>
    )
  }

  return (
    <Tag w={'100px'}>
      <TagLabel mx={'auto'}>N/A</TagLabel>
    </Tag>
  )
}

export default EpssTag
