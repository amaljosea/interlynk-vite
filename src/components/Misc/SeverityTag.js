import { sevColor } from 'utils/styleUtils'

import { Circle, HStack, Text } from '@chakra-ui/react'

import { useThemeColor } from 'hooks/useThemeColors'

const SeverityTag = ({ value }) => {
  const { primaryTextColor } = useThemeColor(['primaryTextColor'])

  if (!value)
    return (
      <Text fontSize={14} color={primaryTextColor}>
        N/A
      </Text>
    )

  return (
    <HStack>
      <Circle size='2' bg={sevColor(value)?.bg} />
      <Text fontSize={14} color={primaryTextColor} textTransform={'capitalize'}>
        {value}
      </Text>
    </HStack>
  )
}

export default SeverityTag
