import React, { useEffect, useState } from 'react'

import {
  Box,
  Flex,
  Icon,
  Text,
  Tooltip,
  VStack,
  useColorMode
} from '@chakra-ui/react'

import { useThemeColor } from 'hooks/useThemeColors'

const colorKeys = [
  'headingTextColor',
  'headingTextSecondary',
  'primaryTextColor',
  'primaryTextColorWithOpacity',
  'secondaryTextColor',
  'secondaryTextInverse',
  'primaryBlueText',
  'contrastTextColor',
  'primaryBgColor',
  'secondaryBgColor',
  'inverseSecondaryBgColor',
  'lightAndDarkBgColor',
  'lightBlueBg',
  'grayBorderColor',
  'primaryBlueBorder',
  'secondaryBlueBorder',
  'lightTealBorder',
  'semiTransparentBorder',
  'mutedBorder',
  'vibrantBlue',
  'primaryRedBorder',
  'primaryGreenBorder',
  'secondaryRedBorder',
  'secondaryGreenBorder',
  'primaryErrorColor',
  'primarySuccessColor'
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
        {/* headingTextSecondary */}
        <Box
          p={8}
          bg={themeColors.headingTextSecondary}
          borderRadius='md'
          boxShadow='md'
          width='300px'
        >
          <VStack align='start'>
            <Text fontWeight='bold' color={isDark ? 'black' : 'white'}>
              {'headingTextSecondary'}
            </Text>
            <Text
              color={isDark ? 'black' : 'white'}
            >{`Light: #CBD5E0 | gray.300`}</Text>
            <Text
              color={isDark ? 'black' : 'white'}
            >{`Dark: #4A5568 | gray.600`}</Text>
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
        {/* primaryTextColorWithOpacity */}
        <Box
          p={8}
          bg={themeColors.primaryTextColorWithOpacity}
          borderRadius='md'
          boxShadow='md'
          width='300px'
        >
          <VStack align='start'>
            <Text color={isDark ? 'black' : 'white'} fontWeight='bold'>
              {'primaryTextColorWithOpacity'}
            </Text>
            <Text
              color={isDark ? 'black' : 'white'}
            >{`Light: #1A202C | gray.800`}</Text>
            <Text
              color={isDark ? 'black' : 'white'}
            >{`Dark: #FFFFFF99 |  white with 60% opacity`}</Text>
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
        {/* contrastTextColor */}
        <Box
          p={8}
          bg={themeColors.contrastTextColor}
          borderRadius='md'
          boxShadow='md'
          width='300px'
        >
          <VStack align='start'>
            <Text fontWeight='bold'>{'contrastTextColor'}</Text>
            <Text>{`Light: #030303 | very dark gray/black for light mode`}</Text>
            <Text>{`Dark: ##FFFFFFCC | white with 80% opacity for dark mode`}</Text>
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
        {/* lightBlueBg */}
        <Box
          p={8}
          bg={themeColors.lightBlueBg}
          borderRadius='md'
          boxShadow='md'
          width='300px'
        >
          <VStack align='start'>
            <Text fontWeight='bold' color={isDark ? 'white' : 'black'}>
              {'lightBlueBg'}
            </Text>
            <Text
              color={isDark ? 'white' : 'black'}
            >{`Light: #ebf8ff |  blue.50`}</Text>
            <Text
              color={isDark ? 'white' : 'black'}
            >{`Dark: #1A202C |  gray.100`}</Text>
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
        {/* mutedBorder */}
        <Box
          p={8}
          bg={themeColors.mutedBorder}
          borderRadius='md'
          boxShadow='md'
          width='300px'
        >
          <VStack align='start'>
            <Text fontWeight='bold'>{'mutedBorder'}</Text>
            <Text>{`Light: #1A202C29 | dark gray with 16% opacity`}</Text>
            <Text>{`Dark: #ffffff12 |  white with 7% opacity`}</Text>
          </VStack>
        </Box>
        {/* vibrantBlue */}
        <Box
          p={8}
          bg={themeColors.vibrantBlue}
          borderRadius='md'
          boxShadow='md'
          width='300px'
        >
          <VStack align='start'>
            <Text fontWeight='bold'>{'vibrantBlue'}</Text>
            <Text>{`Light: #0D0CEE | vibrant blue for light mode`}</Text>
            <Text>{`Dark: #009bff |  vibrant blue for dark mode`}</Text>
          </VStack>
        </Box>
        {/* primaryRedBorder */}
        <Box
          p={8}
          bg={themeColors.primaryRedBorder}
          borderRadius='md'
          boxShadow='md'
          width='300px'
        >
          <VStack align='start'>
            <Text fontWeight='bold'>{'primaryRedBorder'}</Text>
            <Text>{`Light: #E53E3E | red.500`}</Text>
            <Text>{`Dark: #63171B |  red.900`}</Text>
          </VStack>
        </Box>
        {/* primaryGreenBorder */}
        <Box
          p={8}
          bg={themeColors.primaryGreenBorder}
          borderRadius='md'
          boxShadow='md'
          width='300px'
        >
          <VStack align='start'>
            <Text fontWeight='bold'>{'primaryGreenBorder'}</Text>
            <Text>{`Light: #38A169 | green.500`}</Text>
            <Text>{`Dark: #1C4532 |  green.900`}</Text>
          </VStack>
        </Box>
        {/* secondaryRedBorder */}
        <Box
          p={8}
          bg={themeColors.secondaryRedBorder}
          borderRadius='md'
          boxShadow='md'
          width='300px'
        >
          <VStack align='start'>
            <Text fontWeight='bold'>{'secondaryRedBorder'}</Text>
            <Text>{`Light: #FED7D7 | red.100`}</Text>
            <Text>{`Dark: #1A202C |  gray.800`}</Text>
          </VStack>
        </Box>
        {/* secondaryGreenBorder */}
        <Box
          p={8}
          bg={themeColors.secondaryGreenBorder}
          borderRadius='md'
          boxShadow='md'
          width='300px'
        >
          <VStack align='start'>
            <Text fontWeight='bold'>{'secondaryGreenBorder'}</Text>
            <Text>{`Light: #C6F6D5 | green.100`}</Text>
            <Text>{`Dark: #1A202C |  gray.800`}</Text>
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
      </Flex>
    </Box>
  )
}

export default ColorDisplay
