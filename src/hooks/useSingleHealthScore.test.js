import { useQuery } from '@apollo/client'
import { renderHook } from '@testing-library/react'

import { QUERY, useSingleHealthScore } from './useSingleHealthScore'

jest.mock('@apollo/client', () => ({
  useQuery: jest.fn(),
  gql: jest.fn() // Mock the gql function
}))

const mockCalculateHealthScore = jest.fn()

// Mock the calculateHealthScore function
jest.mock('./useSbomScores', () => ({
  calculateHealthScore: (data) => mockCalculateHealthScore(data)
}))

describe('useSingleHealthScore', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return loading true while the query is loading', () => {
    useQuery.mockReturnValue({
      loading: true,
      data: undefined,
      error: undefined
    })
    const { result } = renderHook(() =>
      useSingleHealthScore({ projectId: '123', sbomId: '456' })
    )

    expect(result.current.loading).toBe(true)
    expect(result.current.healthScore).toBe(0) // Assuming default healthScore is 0
    expect(result.current.error).toBeUndefined()
  })

  it('should return health score when query is successful', () => {
    useQuery.mockReturnValue({
      loading: false,
      data: {
        sbom: {}
      },
      error: undefined
    })

    mockCalculateHealthScore.mockReturnValue({ healthScore: 85 }) // Mock return value for health score

    const { result } = renderHook(() =>
      useSingleHealthScore({ projectId: '123', sbomId: '456' })
    )

    expect(result.current.loading).toBe(false)
    expect(result.current.healthScore).toBe(85) // Expected health score
    expect(result.current.error).toBeUndefined()
  })

  it('should return error when query fails', () => {
    const errorMessage = new Error('Query failed')
    useQuery.mockReturnValue({
      loading: false,
      data: undefined,
      error: errorMessage
    })

    const { result } = renderHook(() =>
      useSingleHealthScore({ projectId: '123', sbomId: '456' })
    )

    expect(result.current.loading).toBe(false)
    expect(result.current.healthScore).toBe(0) // Assuming default healthScore is 0
    expect(result.current.error).toEqual(errorMessage)
  })

  // it('should skip query if sbomId is not provided', () => {
  //   const { result } = renderHook(() =>
  //     useSingleHealthScore({ projectId: '123', sbomId: undefined })
  //   )

  //   expect(useQuery).toHaveBeenCalledWith(QUERY, {
  //     skip: true,
  //     variables: { projectId: '123', sbomId: undefined }
  //   })
  // })
})
