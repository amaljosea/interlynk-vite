import { renderHook } from '@testing-library/react-hooks'

/* eslint-disable */
import { useColorModeValue, useTheme } from '@chakra-ui/react'

import { useThemeColor } from './useThemeColors'

jest.mock('@chakra-ui/react', () => ({
  useTheme: jest.fn(),
  useColorModeValue: jest.fn()
}))

describe('useThemeColor', () => {
  const mockTheme = {
    colors: {
      primary: { light: 'blue.200', dark: 'blue.800' },
      secondary: { light: 'red.200', dark: 'red.800' }
    }
  }

  beforeEach(() => {
    jest.clearAllMocks()
    useTheme.mockReturnValue(mockTheme)
  })

  it('should return the correct light colors based on the color mode', () => {
    useColorModeValue.mockImplementation((light) => light)

    const { result } = renderHook(() => useThemeColor(['primary', 'secondary']))

    expect(result.current).toEqual({
      primary: 'blue.200',
      secondary: 'red.200'
    })
  })

  it('should return dark colors when color mode is dark', () => {
    // Mock useColorModeValue to return dark colors
    useColorModeValue.mockImplementation((_, dark) => dark)

    const { result } = renderHook(() => useThemeColor(['primary', 'secondary']))

    expect(result.current).toEqual({
      primary: 'blue.800',
      secondary: 'red.800'
    })
  })

  it('should warn if a color key is not found in the theme', () => {
    console.warn = jest.fn() // Mock console.warn

    const { result } = renderHook(() =>
      useThemeColor(['primary', 'secondary', 'nonExistentColor'])
    )

    expect(console.warn).toHaveBeenCalledWith(
      'Color key "nonExistentColor" not found in theme.colors'
    )
  })

  it('should return an empty object if no valid color keys are provided', () => {
    const { result } = renderHook(() => useThemeColor([]))

    expect(result.current).toEqual({})
  })
})
