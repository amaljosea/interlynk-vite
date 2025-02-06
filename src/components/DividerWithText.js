import { Box, Divider, Flex, Text } from '@chakra-ui/react'

import { useThemeColor } from 'hooks/useThemeColors'

const DividerWithText = ({ text, color }) => {
  const { secondaryTextColor } = useThemeColor(['secondaryTextColor'])

  return (
    <Box position='relative' py={1}>
      <Flex align='center' justify='center' w='100%'>
        <Divider flex='1' />
        <Text px='2' fontSize='xs' color={color || secondaryTextColor}>
          {text}
        </Text>
        <Divider flex='1' />
      </Flex>
    </Box>
  )
}

export default DividerWithText
