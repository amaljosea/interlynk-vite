import { useQuery } from '@apollo/client'
import { act, renderHook } from '@testing-library/react-hooks'

import { usePaginatedQuery } from './usePaginatedQuery'

jest.mock('@apollo/client', () => ({
  useQuery: jest.fn()
}))

const mockQuery = jest.fn()

describe('usePaginatedQuery', () => {
  const mockData = {
    resource: {
      pageInfo: {
        hasNextPage: true,
        hasPreviousPage: false,
        endCursor: 'cursor1',
        startCursor: 'cursor0'
      },
      nodes: [{ id: '1' }, { id: '2' }],
      totalCount: 100
    }
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should initialize with default values', () => {
    useQuery.mockReturnValue({
      data: undefined,
      loading: false,
      error: undefined
    })

    const { result } = renderHook(() =>
      usePaginatedQuery(mockQuery, { skip: false, selector: 'resource' })
    )

    expect(result.current.nodes).toBeUndefined()
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeUndefined()
    expect(result.current.paginationProps.pageIndex).toBe(1)
    expect(result.current.paginationProps.totalRows).toBe(25)
  })

  it('should execute query and return data', () => {
    useQuery.mockReturnValue({
      data: mockData,
      loading: false,
      error: undefined,
      previousData: undefined
    })

    const { result } = renderHook(() =>
      usePaginatedQuery(mockQuery, { skip: false, selector: 'resource' })
    )

    expect(result.current.nodes).toEqual(mockData.resource.nodes)
    expect(result.current.paginationProps.totalCount).toBe(
      mockData.resource.totalCount
    )
    expect(result.current.paginationProps.hasNextPage).toBe(true)
    expect(result.current.paginationProps.hasPreviousPage).toBe(false)
  })

  it('should handle pagination correctly', () => {
    useQuery.mockReturnValue({
      data: mockData,
      loading: false,
      error: undefined
    })

    const { result } = renderHook(() =>
      usePaginatedQuery(mockQuery, { skip: false, selector: 'resource' })
    )

    // Simulate going to the next page
    act(() => {
      result.current.paginationProps.onNextPage()
    })

    expect(result.current.paginationProps.pageIndex).toBe(2)
    expect(result.current.paginationProps.hasNextPage).toBe(true)

    // Simulate going to the previous page
    act(() => {
      result.current.paginationProps.onPreviousPage()
    })

    expect(result.current.paginationProps.pageIndex).toBe(1)
    expect(result.current.paginationProps.hasPreviousPage).toBe(false)
  })

  it('should handle changing the page size', () => {
    useQuery.mockReturnValue({
      data: mockData,
      loading: false,
      error: undefined
    })

    const { result } = renderHook(() =>
      usePaginatedQuery(mockQuery, { skip: false, selector: 'resource' })
    )

    act(() => {
      result.current.paginationProps.onSetRow({ target: { value: '50' } })
    })

    expect(result.current.paginationProps.totalRows).toBe(50)
    expect(result.current.paginationProps.pageIndex).toBe(1) // Should reset to page 1
  })

  it('should reset pagination state', () => {
    useQuery.mockReturnValue({
      data: mockData,
      loading: false,
      error: undefined
    })

    const { result } = renderHook(() =>
      usePaginatedQuery(mockQuery, { skip: false, selector: 'resource' })
    )

    act(() => {
      result.current.reset()
    })

    expect(result.current.paginationProps.pageIndex).toBe(1)
    expect(result.current.paginationProps.totalRows).toBe(25) // Default page size
  })
})
