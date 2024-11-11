import { useQuery } from '@apollo/client'
import { renderHook } from '@testing-library/react-hooks'
import { getSignedUrlParams, isCustomerView } from 'utils'

import {
  AllOrganizationsTotalCount,
  MyOrganizationsTotalCount
} from 'graphQL/Queries'

import { useFetchOrganizationsCount } from './useFetchOrganizationsCount'
import { useGlobalState } from './useGlobalState'

// Mock the gql function
jest.mock('@apollo/client', () => ({
  useQuery: jest.fn(),
  gql: jest.fn((query) => query) // Mock gql to return the query string
}))

jest.mock('utils', () => ({
  getSignedUrlParams: jest.fn(),
  isCustomerView: jest.fn()
}))

jest.mock('./useGlobalState', () => ({
  useGlobalState: jest.fn()
}))

describe('useFetchOrganizationsCount', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  test('returns total count of all organizations for super admin', () => {
    useGlobalState.mockReturnValue({
      organization: { currentUser: { superAdmin: true } }
    })

    getSignedUrlParams.mockReturnValue(null)
    isCustomerView.mockReturnValue(false)

    useQuery.mockImplementation((query) => {
      if (query === AllOrganizationsTotalCount) {
        return { data: { allOrganizations: { totalCount: 10 } } }
      }
      return { data: null }
    })

    const { result } = renderHook(() => useFetchOrganizationsCount())
    expect(result.current).toBe(10)
  })

  test('returns total count of my organizations for regular user', () => {
    useGlobalState.mockReturnValue({
      organization: { currentUser: { superAdmin: false } }
    })

    getSignedUrlParams.mockReturnValue(null)
    isCustomerView.mockReturnValue(false)

    useQuery.mockImplementation((query) => {
      if (query === MyOrganizationsTotalCount) {
        return { data: { myOrganizations: { totalCount: 5 } } }
      }
      return { data: null }
    })

    const { result } = renderHook(() => useFetchOrganizationsCount())
    expect(result.current).toBe(5)
  })

  test('returns 0 if no organizations are found', () => {
    useGlobalState.mockReturnValue({
      organization: { currentUser: { superAdmin: false } }
    })

    getSignedUrlParams.mockReturnValue(null)
    isCustomerView.mockReturnValue(false)

    useQuery.mockImplementation((query) => {
      if (query === MyOrganizationsTotalCount) {
        return { data: { myOrganizations: { totalCount: 0 } } }
      }
      return { data: null }
    })

    const { result } = renderHook(() => useFetchOrganizationsCount())

    expect(result.current).toBe(0)
  })

  test('does not fetch all organizations count if not super admin', () => {
    useGlobalState.mockReturnValue({
      organization: { currentUser: { superAdmin: false } }
    })

    const { result } = renderHook(() => useFetchOrganizationsCount())

    expect(useQuery).toHaveBeenCalledWith(
      AllOrganizationsTotalCount,
      expect.anything()
    )
  })

  test('does not fetch my organizations count if signed URL params exist or location pathname starts with "/customer"', () => {
    useGlobalState.mockReturnValue({
      organization: { currentUser: { superAdmin: false } }
    })

    getSignedUrlParams.mockReturnValue({})

    useQuery.mockImplementation((query) => {
      if (query === MyOrganizationsTotalCount) {
        return { data: { myOrganizations: { totalCount: 5 } } }
      }
      return { data: null }
    })

    const { result } = renderHook(() => useFetchOrganizationsCount())

    expect(result.current).toBe(5)
  })
})
