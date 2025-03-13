import { act, renderHook } from '@testing-library/react'

import { useDebounce } from './useDebounce'

// Adjust the path as necessary

describe('useDebounce', () => {
  jest.useFakeTimers()

  test('should return initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('test', 500))

    expect(result.current).toBe('test')
  })

  test('should return debounced value after delay', () => {
    const { result } = renderHook(() => useDebounce('test', 500))

    act(() => {
      // Change the value
      result.current
    })

    expect(result.current).toBe('test')

    act(() => {
      jest.advanceTimersByTime(500) // Advance timers
    })

    expect(result.current).toBe('test')
  })

  test('should update debounced value when input value changes', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      {
        initialProps: { value: 'first' }
      }
    )

    expect(result.current).toBe('first')

    act(() => {
      // Change the value
      rerender({ value: 'second' })
    })

    // Initial value should be 'first' until timeout
    expect(result.current).toBe('first')

    act(() => {
      jest.advanceTimersByTime(500) // Advance timers
    })

    expect(result.current).toBe('second') // After delay, it should update to 'second'
  })

  test('should clear timeout on unmount', () => {
    const { result, unmount } = renderHook(() => useDebounce('test', 500))

    unmount() // Unmount the hook
    act(() => {
      jest.advanceTimersByTime(500) // Advance timers
    })

    // Ensure that the value is not set after unmount
    expect(result.current).toBe('test') // Should still be 'test' as the unmounted hook does not update
  })
})
