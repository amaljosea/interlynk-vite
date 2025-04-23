import { cvssColor } from 'utils/styleUtils'

import { Text } from '@chakra-ui/react'

import { useThemeColor } from 'hooks/useThemeColors'

const CvssTag = ({ value }) => {
  const { primaryTextColor } = useThemeColor(['primaryTextColor'])

  if (value) {
    return <Text color={cvssColor(value)}>{value}</Text>
  }

  return <Text color={primaryTextColor}>N/A</Text>
}

export default CvssTag
