import React, { useEffect, useState } from 'react'

import { Box, Flex, Text, VStack, useColorMode } from '@chakra-ui/react'

import { useThemeColor } from 'hooks/useThemeColors'

const colorKeys = [
  'headingTextColor',
  'primaryTextColor',
  'secondaryTextColor',
  'secondaryTextInverse',
  'primaryBlueText',
  'primaryBgColor',
  'secondaryBgColor',
  'inverseSecondaryBgColor',
  'lightAndDarkBgColor',
  'grayBorderColor',
  'primaryBlueBorder',
  'secondaryBlueBorder',
  'lightTealBorder',
  'semiTransparentBorder',
  'primaryErrorColor',
  'secondaryErrorColor',
  'primarySuccessColor',
  'secondarySuccessColor'
]

const ColorDisplay = () => {
  const [isDark, setIsDark] = useState(false)
  const themeColors = useThemeColor(colorKeys)

  const { colorMode } = useColorMode()
  useEffect(() => {
    if (colorMode === 'dark') {
      setIsDark(true)
    } else {
      setIsDark(false)
    }
  }, [isDark, colorMode])

  return (
    <Box p={5}>
      <Text fontSize='2xl' fontWeight='bold' mb={4}>
        Color Palette
      </Text>

      <Flex gap={4} flexWrap={'wrap'}>
        {/* Heading Text Color */}
        <Box
          p={8}
          bg={themeColors.headingTextColor}
          borderRadius='md'
          boxShadow='md'
          width='300px'
        >
          <VStack align='start'>
            <Text fontWeight='bold' color={isDark ? 'black' : 'white'}>
              {'headingTextColor'}
            </Text>
            <Text
              color={isDark ? 'black' : 'white'}
            >{`Light: #4A5568 | gray.600`}</Text>
            <Text
              color={isDark ? 'black' : 'white'}
            >{`Dark: #E2E8F0 | gray.200`}</Text>
          </VStack>
        </Box>

        {/* Primary Text Color */}
        <Box
          p={8}
          bg={themeColors.primaryTextColor}
          borderRadius='md'
          boxShadow='md'
          width='300px'
        >
          <VStack align='start'>
            <Text color={isDark ? 'black' : 'white'} fontWeight='bold'>
              {'primaryTextColor'}
            </Text>
            <Text
              color={isDark ? 'black' : 'white'}
            >{`Light: #1A202C | gray.800`}</Text>
            <Text
              color={isDark ? 'black' : 'white'}
            >{`Dark: #F7FAFC | gray.50`}</Text>
          </VStack>
        </Box>

        {/* Secondary Text Color */}
        <Box
          p={8}
          bg={themeColors.secondaryTextColor}
          borderRadius='md'
          boxShadow='md'
          width='300px'
        >
          <VStack align='start'>
            <Text fontWeight='bold'>{'secondaryTextColor'}</Text>
            <Text>{`Light: #A0AEC0 | gray.400`}</Text>
            <Text>{`Dark: #718096 | gray.500`}</Text>
          </VStack>
        </Box>
        {/* secondaryTextInverse */}
        <Box
          p={8}
          bg={themeColors.secondaryTextInverse}
          borderRadius='md'
          boxShadow='md'
          width='300px'
        >
          <VStack align='start'>
            <Text fontWeight='bold'>{'secondaryTextInverse'}</Text>
            <Text>{`Light: #718096 | gray.500`}</Text>
            <Text>{`Dark: #A0AEC0 | gray.400`}</Text>
          </VStack>
        </Box>

        {/* Primary Blue Text */}
        <Box
          p={8}
          bg={themeColors.primaryBlueText}
          borderRadius='md'
          boxShadow='md'
          width='300px'
        >
          <VStack align='start'>
            <Text fontWeight='bold'>{'primaryBlueText'}</Text>
            <Text>{`Light: #3182CE | blue.500`}</Text>
            <Text>{`Dark: #5BA3DB | slightly lighter than blue.400`}</Text>
          </VStack>
        </Box>

        {/* Primary Background Color */}
        <Box
          p={8}
          bg={themeColors.primaryBgColor}
          borderRadius='md'
          boxShadow='md'
          width='300px'
        >
          <VStack align='start'>
            <Text fontWeight='bold'>{'primaryBgColor'}</Text>
            <Text>{`Light: #F7FAFC | gray.50`}</Text>
            <Text>{`Dark: #1A202C | gray.800`}</Text>
          </VStack>
        </Box>

        {/* Secondary Background Color */}
        <Box
          p={8}
          bg={themeColors.secondaryBgColor}
          borderRadius='md'
          boxShadow='md'
          width='300px'
        >
          <VStack align='start'>
            <Text fontWeight='bold'>{'secondaryBgColor'}</Text>
            <Text>{`Light: #EDF2F7 | gray.100`}</Text>
            <Text>{`Dark: #2D3748 | gray.700`}</Text>
          </VStack>
        </Box>

        {/* Inverse Secondary Background Color */}
        <Box
          p={8}
          bg={themeColors.inverseSecondaryBgColor}
          borderRadius='md'
          boxShadow='md'
          width='300px'
        >
          <VStack align='start'>
            <Text fontWeight='bold' color={isDark ? 'black' : 'white'}>
              {'inverseSecondaryBgColor'}
            </Text>
            <Text
              color={isDark ? 'black' : 'white'}
            >{`Light: #2D3748 | gray.700`}</Text>
            <Text
              color={isDark ? 'black' : 'white'}
            >{`Dark: #EDF2F7 | gray.100`}</Text>
          </VStack>
        </Box>
        {/*  lightAndDarkBgColor */}
        <Box
          p={8}
          bg={themeColors.lightAndDarkBgColor}
          borderRadius='md'
          boxShadow='md'
          width='300px'
        >
          <VStack align='start'>
            <Text fontWeight='bold' color={isDark ? 'white' : 'black'}>
              {'lightAndDarkBgColor'}
            </Text>
            <Text
              color={isDark ? 'white' : 'black'}
            >{`Light: #fff | white`}</Text>
            <Text
              color={isDark ? 'white' : 'black'}
            >{`Dark: #1f2733 |  dark muted blue-gray`}</Text>
          </VStack>
        </Box>

        {/* Gray Border Color */}
        <Box
          p={8}
          bg={themeColors.grayBorderColor}
          borderRadius='md'
          boxShadow='md'
          width='300px'
        >
          <VStack align='start'>
            <Text fontWeight='bold'>{'grayBorderColor'}</Text>
            <Text>{`Light: #E2E8F0 | gray.200`}</Text>
            <Text>{`Dark: #ffffff29 | custom semi-transparent white`}</Text>
          </VStack>
        </Box>

        {/* Primary Blue Border */}
        <Box
          p={8}
          bg={themeColors.primaryBlueBorder}
          borderRadius='md'
          boxShadow='md'
          width='300px'
        >
          <VStack align='start'>
            <Text fontWeight='bold'>{'primaryBlueBorder'}</Text>
            <Text>{`Light: #3182CE | blue.500`}</Text>
            <Text>{`Dark: #90CDF4 | blue.400 with transparency`}</Text>
          </VStack>
        </Box>

        {/* Secondary Blue Border */}
        <Box
          p={8}
          bg={themeColors.secondaryBlueBorder}
          borderRadius='md'
          boxShadow='md'
          width='300px'
        >
          <VStack align='start'>
            <Text fontWeight='bold'>{'secondaryBlueBorder'}</Text>
            <Text>{`Light: #3182CE66 | blue.500 with transparency`}</Text>
            <Text>{`Dark: #90CDF499 | blue.400 with transparency`}</Text>
          </VStack>
        </Box>
        {/* Semi transparent border */}
        <Box
          p={8}
          bg={themeColors.semiTransparentBorder}
          borderRadius='md'
          boxShadow='md'
          width='300px'
        >
          <VStack align='start'>
            <Text fontWeight='bold'>{'semiTransparentBorder'}</Text>
            <Text>{`Light: #0000001f |  black with 12% opacity`}</Text>
            <Text>{`Dark: #ffffff1A | white with 10% opacity`}</Text>
          </VStack>
        </Box>
        {/* Light Teal Border */}
        <Box
          p={8}
          bg={themeColors.lightTealBorder}
          borderRadius='md'
          boxShadow='md'
          width='300px'
        >
          <VStack align='start'>
            <Text fontWeight='bold'>{'lightTealBorder'}</Text>
            <Text>{`Light: #4FD1C5 | blue.600 with transparency`}</Text>
            <Text>{`Dark: #81E6D9 | blue.400 with transparency`}</Text>
          </VStack>
        </Box>

        {/* Primary Error Color */}
        <Box
          p={8}
          bg={themeColors.primaryErrorColor}
          borderRadius='md'
          boxShadow='md'
          width='300px'
        >
          <VStack align='start'>
            <Text fontWeight='bold'>{'primaryErrorColor'}</Text>
            <Text>{`Light: #E53E3E | red.500`}</Text>
            <Text>{`Dark: #F56565 | red.400`}</Text>
          </VStack>
        </Box>

        {/* Secondary Error Color */}
        <Box
          p={8}
          bg={themeColors.secondaryErrorColor}
          borderRadius='md'
          boxShadow='md'
          width='300px'
        >
          <VStack align='start'>
            <Text fontWeight='bold'>{'secondaryErrorColor'}</Text>
            <Text>{`Light: #FFF5F5 | red.100`}</Text>
            <Text>{`Dark: #4A1F1F | custom dark red for night mode`}</Text>
          </VStack>
        </Box>

        {/* Primary Success Color */}
        <Box
          p={8}
          bg={themeColors.primarySuccessColor}
          borderRadius='md'
          boxShadow='md'
          width='300px'
        >
          <VStack align='start'>
            <Text fontWeight='bold'>{'primarySuccessColor'}</Text>
            <Text>{`Light: #48BB78 | green.400`}</Text>
            <Text>{`Dark: #68D391 | green.300`}</Text>
          </VStack>
        </Box>

        {/* Secondary Success Color */}
        <Box
          p={8}
          bg={themeColors.secondarySuccessColor}
          borderRadius='md'
          boxShadow='md'
          width='300px'
        >
          <VStack align='start'>
            <Text fontWeight='bold'>{'secondarySuccessColor'}</Text>
            <Text>{`Light: #F0FFF4 | green.100`}</Text>
            <Text>{`Dark: #1F4032 | custom dark green for night mode`}</Text>
          </VStack>
        </Box>
      </Flex>
    </Box>
  )
}

export default ColorDisplay
