import { sevColor } from 'utils/styleUtils'

import { Circle, HStack, Text } from '@chakra-ui/react'

import { useThemeColor } from 'hooks/useThemeColors'

const SeverityTag = ({ value }) => {
  const { primaryTextColor, secondaryTextInverse } = useThemeColor([
    'primaryTextColor',
    'secondaryTextInverse'
  ])

  if (!value) return <Text color={secondaryTextInverse}>N/A</Text>

  return (
    <HStack>
      <Circle size='2' bg={sevColor(value)?.bg} />
      <Text fontSize='sm' color={primaryTextColor} textTransform={'capitalize'}>
        {value}
      </Text>
    </HStack>
  )
}

export default SeverityTag
