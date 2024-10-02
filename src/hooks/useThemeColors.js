import { useColorModeValue, useTheme } from '@chakra-ui/react'

export const useThemeColor = (colorKeys) => {
  const theme = useTheme()

  const colors = colorKeys.reduce((acc, colorKey) => {
    const color = theme.colors[colorKey]
    if (color) {
      // eslint-disable-next-line
      acc[colorKey] = useColorModeValue(color?.light, color?.dark)
    } else {
      console.warn(`Color key "${colorKey}" not found in theme.colors`)
    }
    return acc
  }, {})

  return colors
}
