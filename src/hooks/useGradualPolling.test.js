import { act, render } from '@testing-library/react'
import { useEffect } from 'react'

import { useGradualPolling } from './useGradualPolling'

// Mock functions for testing
const mockStartPolling = jest.fn()
const mockStopPolling = jest.fn()

// Custom hook wrapper for testing
const TestComponent = ({ shouldPoll }) => {
  useGradualPolling({
    initialPollTime: 1000,
    shouldPoll,
    startPolling: mockStartPolling,
    stopPolling: mockStopPolling
  })
  return null
}

describe('useGradualPolling', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should start polling with initial time and increase time gradually', () => {
    jest.useFakeTimers()

    render(<TestComponent shouldPoll={true} />)

    // Initially start polling with 1000ms
    expect(mockStartPolling).toHaveBeenCalledWith(1000)

    // Fast-forward 1000ms
    act(() => {
      jest.advanceTimersByTime(1000)
    })

    // Check if polling time increased and startPolling was called with new time
    expect(mockStartPolling).toHaveBeenCalledWith(2000)

    // Fast-forward 2000ms
    act(() => {
      jest.advanceTimersByTime(2000)
    })

    // Check if polling time increased and startPolling was called with new time
    expect(mockStartPolling).toHaveBeenCalledWith(3000)

    // Fast-forward 20000000 ms
    act(() => {
      jest.advanceTimersByTime(20000000)
    })

    // expect the max to be
    expect(mockStartPolling).toHaveBeenCalledWith(10000)
    // Ensure stopPolling is called
    expect(mockStopPolling).not.toHaveBeenCalled()
  })

  it('should stop polling and reset poll time when shouldPoll is false', () => {
    jest.useFakeTimers()

    // Render with shouldPoll=true
    render(<TestComponent shouldPoll={true} />)
    expect(mockStartPolling).toHaveBeenCalled()

    // Render with shouldPoll=false
    render(<TestComponent shouldPoll={false} />)

    // Fast-forward any remaining timers
    act(() => {
      jest.advanceTimersByTime(5000)
    })

    // Ensure stopPolling is called
    expect(mockStopPolling).toHaveBeenCalled()
  })
})
