import { renderHook } from '@testing-library/react'

import { useGlobalState } from 'hooks/useGlobalState'

import { useHasPermission } from './useHasPermission'

// Mock the useGlobalState hook
jest.mock('hooks/useGlobalState')

describe('useHasPermission', () => {
  const mockUserPermissions = (permissions) => {
    useGlobalState.mockReturnValue({ userPermissions: permissions })
  }

  it('returns true if the parent permission is true', () => {
    mockUserPermissions([{ key: 'parentKey', value: true }])

    const { result } = renderHook(() =>
      useHasPermission({ parentKey: 'parentKey' })
    )

    expect(result.current).toBe(true)
  })

  it('returns false if the parent permission is false', () => {
    mockUserPermissions([{ key: 'parentKey', value: false }])

    const { result } = renderHook(() =>
      useHasPermission({ parentKey: 'parentKey' })
    )

    expect(result.current).toBe(false)
  })

  it('returns true if the child permission is true', () => {
    mockUserPermissions([
      {
        key: 'parentKey',
        supersededBy: [{ key: 'childKey', value: true }],
        value: true
      }
    ])

    const { result } = renderHook(() =>
      useHasPermission({ parentKey: 'parentKey', childKey: 'childKey' })
    )

    expect(result.current).toBe(true)
  })

  it('returns false if the child permission is false', () => {
    mockUserPermissions([
      {
        key: 'parentKey',
        supersededBy: [{ key: 'childKey', value: false }],
        value: true
      }
    ])

    const { result } = renderHook(() =>
      useHasPermission({ parentKey: 'parentKey', childKey: 'childKey' })
    )

    expect(result.current).toBe(false)
  })

  it('returns false if the parent permission does not exist', () => {
    mockUserPermissions([])

    const { result } = renderHook(() =>
      useHasPermission({ parentKey: 'parentKey' })
    )

    expect(result.current).toBe(false)
  })
})
