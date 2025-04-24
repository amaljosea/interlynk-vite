import { Text } from '@chakra-ui/react'

import { useThemeColor } from 'hooks/useThemeColors'

const CvssTag = ({ value }) => {
  const {
    lynkRedColor,
    lynkOrangeColor,
    lynkYellowColor,
    lynkGreenColor,
    primaryTextColor
  } = useThemeColor([
    'lynkRedColor',
    'lynkOrangeColor',
    'lynkYellowColor',
    'lynkGreenColor',
    'primaryTextColor'
  ])

  const cvssColor = (value) => {
    if (value >= 9.0) {
      return lynkRedColor
    } else if (value >= 7.0) {
      return lynkOrangeColor
    } else if (value >= 6.0) {
      return lynkYellowColor
    } else {
      return lynkGreenColor
    }
  }

  return (
    <Text fontSize={14} color={value ? cvssColor(value) : primaryTextColor}>
      {value || 'N/A'}
    </Text>
  )
}

export default CvssTag
