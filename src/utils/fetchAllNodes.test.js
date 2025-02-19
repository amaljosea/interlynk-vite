import { client } from 'context/ApolloWrapper'
import { fetchNodes } from 'utils'

import fetchAllNodes from './fetchAllNodes'

jest.mock('context/ApolloWrapper', () => ({
  client: {
    query: jest.fn()
  }
}))

describe('fetchNodes', () => {
  it('should correctly traverse object using dot notation', () => {
    const mockResponse = {
      data: {
        users: {
          edges: {
            nodes: [{ id: 1 }, { id: 2 }]
          }
        }
      }
    }

    expect(fetchNodes(mockResponse, 'users.edges')).toEqual({
      nodes: [{ id: 1 }, { id: 2 }]
    })
  })

  it('should return undefined for invalid path', () => {
    const mockResponse = {
      data: {
        users: {}
      }
    }

    expect(fetchNodes(mockResponse, 'users.path')).toBeUndefined()
  })
})

describe('fetchAllNodes', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  const mockQuery = {}
  const mockVariables = { projectGroupIds: '12345' }
  const mockSelector = 'users.edges'

  it('should fetch all nodes when multiple pages exist', async () => {
    // Mock three pages of data
    client.query
      .mockResolvedValueOnce({
        data: {
          users: {
            edges: {
              nodes: [{ id: 1 }, { id: 2 }],
              pageInfo: {
                hasNextPage: true,
                endCursor: 'cursor1'
              }
            }
          }
        }
      })
      .mockResolvedValueOnce({
        data: {
          users: {
            edges: {
              nodes: [{ id: 3 }, { id: 4 }],
              pageInfo: {
                hasNextPage: true,
                endCursor: 'cursor2'
              }
            }
          }
        }
      })
      .mockResolvedValueOnce({
        data: {
          users: {
            edges: {
              nodes: [{ id: 5 }],
              pageInfo: {
                hasNextPage: false,
                endCursor: null
              }
            }
          }
        }
      })

    const result = await fetchAllNodes({
      query: mockQuery,
      variables: mockVariables,
      selector: mockSelector
    })

    expect(result).toHaveLength(5)
    expect(result).toEqual([
      { id: 1 },
      { id: 2 },
      { id: 3 },
      { id: 4 },
      { id: 5 }
    ])

    // Verify correct pagination parameters were used
    expect(client.query).toHaveBeenCalledTimes(3)
    expect(client.query).toHaveBeenNthCalledWith(1, {
      query: mockQuery,
      variables: {
        ...mockVariables,
        first: 200,
        after: undefined
      },
      fetchPolicy: 'no-cache'
    })
    expect(client.query).toHaveBeenNthCalledWith(2, {
      query: mockQuery,
      variables: {
        ...mockVariables,
        first: 200,
        after: 'cursor1'
      },
      fetchPolicy: 'no-cache'
    })
    expect(client.query).toHaveBeenNthCalledWith(3, {
      query: mockQuery,
      variables: {
        ...mockVariables,
        first: 200,
        after: 'cursor2'
      },
      fetchPolicy: 'no-cache'
    })
  })

  it('should handle empty response data', async () => {
    client.query.mockResolvedValueOnce({
      data: {
        users: {
          edges: {
            nodes: [],
            pageInfo: {
              hasNextPage: false,
              endCursor: null
            }
          }
        }
      }
    })

    const result = await fetchAllNodes({
      query: mockQuery,
      variables: mockVariables,
      selector: mockSelector
    })

    expect(result).toEqual([])
    expect(client.query).toHaveBeenCalledTimes(1)
  })

  it('should handle API errors', async () => {
    const mockError = new Error('API Error')
    client.query.mockRejectedValueOnce(mockError)

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

    const result = await fetchAllNodes({
      query: mockQuery,
      variables: mockVariables,
      selector: mockSelector
    })

    expect(result).toEqual([])
    expect(consoleSpy).toHaveBeenCalledWith('Error fetching nodes:', mockError)
    expect(client.query).toHaveBeenCalledTimes(1)

    consoleSpy.mockRestore()
  })

  it('should handle missing pageInfo', async () => {
    client.query.mockResolvedValueOnce({
      data: {
        users: {
          edges: {
            nodes: [{ id: 1 }]
          }
          // No pageInfo
        }
      }
    })

    const result = await fetchAllNodes({
      query: mockQuery,
      variables: mockVariables,
      selector: mockSelector
    })

    expect(result).toEqual([{ id: 1 }])
    expect(client.query).toHaveBeenCalledTimes(1)
  })

  it('should handle null response data', async () => {
    client.query.mockResolvedValueOnce({
      data: null
    })

    const result = await fetchAllNodes({
      query: mockQuery,
      variables: mockVariables,
      selector: mockSelector
    })

    expect(result).toEqual([])
    expect(client.query).toHaveBeenCalledTimes(1)
  })
})
