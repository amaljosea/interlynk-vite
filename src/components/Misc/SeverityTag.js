import { sevColor } from 'utils/styleUtils'

import { Tag, TagLabel, Text } from '@chakra-ui/react'

import { useThemeColor } from 'hooks/useThemeColors'

const SeverityTag = ({ value }) => {
  const { primaryTextColor } = useThemeColor(['primaryTextColor'])

  if (value) {
    return (
      <Tag
        size='md'
        variant='subtle'
        width={'120px'}
        bg={sevColor(value)?.bg}
        textColor={sevColor(value)?.text}
      >
        <TagLabel textTransform='capitalize' mx={'auto'}>
          {value}
        </TagLabel>
      </Tag>
    )
  }

  return (
    <Text w={'120px'} textAlign={'center'} color={primaryTextColor}>
      N/A
    </Text>
  )
}

export default SeverityTag
