import { cvssColor } from 'utils/styleUtils'

import { Tag, TagLabel } from '@chakra-ui/react'

import { useThemeColor } from 'hooks/useThemeColors'

const CvssTag = ({ value }) => {
  const { primaryTextColor } = useThemeColor(['primaryTextColor'])

  if (value) {
    return (
      <Tag width={'50px'} color={cvssColor(value)}>
        <TagLabel mx={'auto'}>{value}</TagLabel>
      </Tag>
    )
  }

  return (
    <Tag w={'50px'} color={primaryTextColor}>
      <TagLabel mx={'auto'}>N/A</TagLabel>
    </Tag>
  )
}

export default CvssTag
