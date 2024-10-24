import { renderHook } from '@testing-library/react-hooks'
import { MemoryRouter } from 'react-router-dom'

import useQueryParam from './useQueryParam'

describe('useQueryParam', () => {
  it('should return the correct query parameter value', () => {
    const wrapper = ({ children }) => (
      <MemoryRouter initialEntries={['/?myParam=value']}>
        {children}
      </MemoryRouter>
    )

    const { result } = renderHook(() => useQueryParam('myParam'), { wrapper })

    expect(result.current).toBe('value')
  })

  it('should return null if the query parameter is not present', () => {
    const wrapper = ({ children }) => (
      <MemoryRouter initialEntries={['/?anotherParam=value']}>
        {children}
      </MemoryRouter>
    )

    const { result } = renderHook(() => useQueryParam('myParam'), { wrapper })

    expect(result.current).toBeNull()
  })

  it('should return null for non-existent parameters', () => {
    const wrapper = ({ children }) => (
      <MemoryRouter initialEntries={['/?myParam=value']}>
        {children}
      </MemoryRouter>
    )

    const { result } = renderHook(() => useQueryParam('nonExistentParam'), {
      wrapper
    })

    expect(result.current).toBeNull()
  })
})
