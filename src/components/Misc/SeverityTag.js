import { sevColor } from 'utils/styleUtils'

import { Tag, TagLabel } from '@chakra-ui/react'

const SeverityTag = ({ value }) => {
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
    <Tag w={'120px'}>
      <TagLabel mx={'auto'}>N/A</TagLabel>
    </Tag>
  )
}

export default SeverityTag
