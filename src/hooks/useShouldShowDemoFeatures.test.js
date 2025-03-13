import { renderHook } from '@testing-library/react'

import { useGlobalState } from './useGlobalState'
import { useShouldShowDemoFeatures } from './useShouldShowDemoFeatures'

jest.mock('./useGlobalState')

describe('useShouldShowDemoFeatures', () => {
  const mockOrganization = (org) => {
    useGlobalState.mockReturnValue({ organization: org })
  }

  it('returns true if demo features should be shown', () => {
    mockOrganization({ name: 'Interlynk - Demo' })

    const { result } = renderHook(() => useShouldShowDemoFeatures())

    expect(result.current.shouldShowDemoFeatures).toBe(true)
  })

  it('returns false if demo features should not be shown due to different organization name', () => {
    mockOrganization({ name: 'Test Organization' })

    const { result } = renderHook(() => useShouldShowDemoFeatures())

    expect(result.current.shouldShowDemoFeatures).toBe(false)
  })

  it('returns false if organization is undefined', () => {
    mockOrganization(undefined)

    const { result } = renderHook(() => useShouldShowDemoFeatures())

    expect(result.current.shouldShowDemoFeatures).toBe(false)
  })
})
