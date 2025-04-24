import { cvssColor } from 'utils/styleUtils'

import { Text } from '@chakra-ui/react'

import { useThemeColor } from 'hooks/useThemeColors'

const CvssTag = ({ value }) => {
  const { primaryTextColor } = useThemeColor(['primaryTextColor'])

  return (
    <Text fontSize={14} color={value ? cvssColor(value) : primaryTextColor}>
      {value || 'N/A'}
    </Text>
  )
}

export default CvssTag
