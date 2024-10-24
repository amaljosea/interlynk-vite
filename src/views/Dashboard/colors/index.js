/* eslint-disable */
import React, { useState } from 'react'

import {
  Box,
  Button,
  Flex,
  Radio,
  Text,
  Tooltip,
  VStack,
  useColorModeValue
} from '@chakra-ui/react'

import useCustomToast from 'hooks/useCustomToast'
import { useThemeColor } from 'hooks/useThemeColors'

const colorKeys = [
  // Text Colors
  'headingTextColor',
  'headingTextSecondary',
  'primaryTextColor',
  'primaryTextColorWithOpacity',
  'secondaryTextColor',
  'secondaryTextInverse',
  'sameSecondaryText',
  'primaryBlueText',
  'secondaryBlueText',
  'contrastTextColor',

  // Background Colors
  'primaryBgColor',
  'secondaryBgColor',
  'inverseSecondaryBgColor',
  'lightAndDarkBgColor',
  'mainContrastBgColor',
  'lightBlueBg',
  'blurBackground',
  'customLightBlue',
  'customDarkBlue',

  // Border Colors
  'neutralBorder',
  'grayBorderColor',
  'primaryBlueBorder',
  'secondaryBlueBorder',
  'lightTealBorder',
  'semiTransparentBorder',
  'mutedBorder',
  'primaryRedBorder',
  'primaryGreenBorder',
  'secondaryRedBorder',
  'secondaryGreenBorder',

  // Status/Error/Success Colors
  'primaryErrorColor',
  'primarySuccessColor',
  'vibrantBlue'
]

const ColorDisplay = () => {
  const [selectedColors, setSelectedColors] = useState([])
  const themeColors = useThemeColor(colorKeys)
  const { showToast } = useCustomToast()

  const handleSelectColor = (colorKey) => {
    setSelectedColors((prev) =>
      prev.includes(colorKey)
        ? prev.filter((color) => color !== colorKey)
        : [...prev, colorKey]
    )
  }

  const tooltipCustom = () => (
    <Tooltip
      position={{ x: 0, y: 70 }}
      labelStyle={{ color: '#4A5568', fontWeight: 600 }}
      wrapperStyle={{
        zIndex: 9999,
        fontSize: '12px'
      }}
    />
  )

  const handleCopyToClipboard = () => {
    const colorString = `const { ${selectedColors.join(
      ', '
    )} } = useThemeColor([${selectedColors
      .map((color) => `'${color}'`)
      .join(', ')}])`

    navigator.clipboard.writeText(colorString).then(() => {
      showToast({
        title: 'Copied to clipboard!',
        description: colorString,
        status: 'success' // 'success' matches the custom toast logic
      })
    })
  }

  const handleGetImportStatement = () => {
    const importStatement = `import { useThemeColor } from 'hooks/useThemeColors';`
    navigator.clipboard.writeText(importStatement)
    showToast({
      title: 'Import statement copied!',
      description: importStatement,
      status: 'info'
    })
  }

  const handleReset = () => {
    setSelectedColors([])
  }

  const filterText = (item) => {
    return item?.length > 15 ? `${item?.substring(0, 15)}...` : item
  }

  return (
    <Box p={5}>
      <Flex alignItems={'center'} justifyContent={'space-between'} mb={4}>
        <VStack align='flex-start' spacing={1}>
          <Text fontSize='2xl' fontWeight='bold'>
            Color Palette
          </Text>

          <Text fontSize='sm'>
            Select the required colors and click the 'Copy Code' button
          </Text>
        </VStack>

        <Flex gap={4}>
          <Tooltip
            position={{ x: 0, y: 70 }}
            labelStyle={{ color: '#4A5568', fontWeight: 600 }}
            label={'Get import statement for useThemeColor'}
          >
            <Button colorScheme='teal' onClick={handleGetImportStatement}>
              Copy Import Statement
            </Button>
          </Tooltip>

          {/* Copy to clipboard button */}
          <Tooltip label={'Select colors to copy the function'}>
            <Button
              isDisabled={selectedColors.length < 1}
              colorScheme='blue'
              onClick={handleCopyToClipboard}
            >
              Copy code
            </Button>
          </Tooltip>

          {/* Reset Button */}
          <Tooltip label={'Reset selected colors'}>
            <Button
              isDisabled={selectedColors.length < 1}
              colorScheme='red'
              onClick={handleReset}
            >
              Reset
            </Button>
          </Tooltip>
        </Flex>
      </Flex>

      <Flex gap={4} flexWrap='wrap'>
        {colorKeys.map((colorKey) => (
          <Flex
            key={colorKey}
            alignItems='center'
            direction='column'
            border={`1px solid ${themeColors.mutedBorder}`}
            p={4}
            w={'200px'}
            onClick={() => handleSelectColor(colorKey)}
            cursor={'pointer'}
            borderRadius='md'
          >
            {/* Color Box */}
            <Box
              bg={themeColors[colorKey]}
              borderRadius='md'
              boxShadow='md'
              width='100px'
              height='100px'
              minW={'100px'}
            />

            {/* Radio Button and Texts */}
            <Flex direction='row' alignItems='center' mt={3} gap={2}>
              <Radio
                colorScheme='blue'
                isChecked={selectedColors.includes(colorKey)} // Checks the current radio
                onChange={() => handleSelectColor(colorKey)} // Handles radio click
                sx={{
                  border: '2px solid', // Add a thicker border
                  borderColor: themeColors.mutedBorder // Set the border color to be more prominent (use any color from theme)
                }}
              />

              {/* Texts Display */}
              <VStack spacing={1} align='flex-start'>
                {/* colorKey */}
                <Text
                  fontSize={'14px'}
                  width={'100%'}
                  whiteSpace='normal'
                  overflowWrap='break-word'
                  textAlign='left'
                >
                  {filterText(colorKey)}
                </Text>

                {/* Theme Color Value */}
                <Text
                  fontSize={'12px'}
                  width={'100%'}
                  whiteSpace='normal'
                  overflowWrap='break-word'
                  textAlign='left'
                >
                  {useColorModeValue(
                    themeColors[colorKey],
                    themeColors[colorKey]
                  )}
                </Text>
              </VStack>
            </Flex>
          </Flex>
        ))}
      </Flex>
    </Box>
  )
}

export default ColorDisplay
