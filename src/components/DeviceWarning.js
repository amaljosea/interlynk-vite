import InterlynkLogo from 'assets/img/logo.png'

import { Box, Button, Flex, Heading, Img, Text } from '@chakra-ui/react'
import { useColorMode } from '@chakra-ui/react'

import { useThemeColor } from 'hooks/useThemeColors'

const DeviceWarning = () => {
  const { grayBorderColor, headingTextColor, secondaryBlueText } =
    useThemeColor(['grayBorderColor', 'headingTextColor', 'secondaryBlueText'])
  const { colorMode } = useColorMode()
  const isDark = colorMode === 'dark'

  return (
    <Box w='100%' h='100vh' bgGradient='linear(to-br, #4299e1, #1A365D)'>
      <Flex width={'100%'} gap={1} alignItems={'center'} p={5}>
        <Img
          alt='Interlynk'
          src={InterlynkLogo}
          sx={{ w: '40px', h: '40px' }}
          filter={'brightness(0) invert(1)'}
        />
        <Text sx={{ fontSize: '2xl', fontWeight: 600 }} color={'white'}>
          Interlynk
        </Text>
      </Flex>
      <Flex
        justifyContent='center'
        sx={{ mt: 52, p: 8, alignItems: 'center', flexDir: 'column' }}
      >
        <Heading
          textAlign='center'
          sx={{ fontSize: '3xl', fontFamily: 'inherit', opacity: 0.9 }}
          color={isDark ? headingTextColor : grayBorderColor}
        >
          This page is best viewed on Desktop
        </Heading>
        <Text
          fontSize='md'
          textAlign='center'
          sx={{ mt: 6, color: secondaryBlueText }}
          /* sx={{ mt: 6, color: 'blue.200', opacity: 0.9 }} */
        >
          Please switch to a larger screen or enable desktop view in your
          browser settings.
        </Text>
        <Button
          colorScheme='gray'
          sx={{ fontSize: 14, mt: 8 }}
          onClick={() => window.location.reload()}
        >
          Retry
        </Button>
      </Flex>
    </Box>
  )
}

export default DeviceWarning
