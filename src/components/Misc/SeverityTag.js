import { sevColor } from 'utils/styleUtils'

import { Circle, HStack, Text } from '@chakra-ui/react'

import { useThemeColor } from 'hooks/useThemeColors'

const SeverityTag = ({ value }) => {
  const { primaryTextColor } = useThemeColor(['primaryTextColor'])

  if (value) {
    return (
      <HStack>
        <Circle size='2' bg={sevColor(value)?.bg} />
        <Text
          fontSize='sm'
          color={primaryTextColor}
          textTransform={'capitalize'}
        >
          {value}
        </Text>
      </HStack>
    )
  }

  return <Text color={primaryTextColor}>N/A</Text>
}

export default SeverityTag
