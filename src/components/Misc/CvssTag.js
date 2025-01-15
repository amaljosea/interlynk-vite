import { cvssColor } from 'utils/styleUtils'

import { Tag, TagLabel, Text } from '@chakra-ui/react'

import { useThemeColor } from 'hooks/useThemeColors'

const CvssTag = ({ value }) => {
  const { primaryTextColor } = useThemeColor(['primaryTextColor'])

  if (value) {
    return (
      <Tag
        size='md'
        width={'50px'}
        variant='subtle'
        colorScheme={cvssColor(value)}
      >
        <TagLabel mx={'auto'}>{value}</TagLabel>
      </Tag>
    )
  }

  return (
    <Text w={'50px'} textAlign={'center'} color={primaryTextColor}>
      N/A
    </Text>
  )
}

export default CvssTag
