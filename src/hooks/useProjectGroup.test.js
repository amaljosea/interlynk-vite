import { useQuery } from '@apollo/client'
import { renderHook } from '@testing-library/react-hooks'

import { GetProjectsCustomer, GetProjectsVendor } from 'graphQL/Queries'

import { checkIfCustomer } from '../utils/url'
import { useProjectGroup } from './useProjectGroup'

jest.mock('@apollo/client', () => ({
  useQuery: jest.fn(),
  gql: jest.fn() // Mock the gql function
}))

jest.mock('../utils/url', () => ({
  checkIfCustomer: jest.fn()
}))

describe('useProjectGroup', () => {
  const projectGroupId = '123'
  const mockDataCustomer = {
    shareLynkQuery: {
      projectGroup: {
        projects: [
          { id: '1', name: 'Project 1' },
          { id: '2', name: 'Project 2' }
        ],
        name: 'Customer Group',
        defaultProject: { id: '1' }
      }
    }
  }

  const mockDataVendor = {
    projectGroup: {
      projects: [{ id: '3', name: 'Vendor Project 1' }],
      name: 'Vendor Group',
      defaultProject: { id: '3' }
    }
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should fetch projects for customer', () => {
    checkIfCustomer.mockReturnValue(true)
    useQuery.mockReturnValue({ data: mockDataCustomer, loading: false })

    const { result } = renderHook(() => useProjectGroup({ projectGroupId }))

    expect(result.current.projects).toEqual(
      mockDataCustomer.shareLynkQuery.projectGroup.projects
    )
    expect(result.current.name).toBe(
      mockDataCustomer.shareLynkQuery.projectGroup.name
    )
    expect(result.current.defaultProjectId).toBe(
      mockDataCustomer.shareLynkQuery.projectGroup.defaultProject.id
    )
    expect(result.current.loading).toBe(false)
    expect(useQuery).toHaveBeenCalledWith(GetProjectsCustomer, {
      skip: false,
      variables: { projectGroupId }
    })
  })

  it('should fetch projects for vendor', () => {
    checkIfCustomer.mockReturnValue(false)
    useQuery.mockReturnValue({ data: mockDataVendor, loading: false })

    const { result } = renderHook(() => useProjectGroup({ projectGroupId }))

    expect(result.current.projects).toEqual(
      mockDataVendor.projectGroup.projects
    )
    expect(result.current.name).toBe(mockDataVendor.projectGroup.name)
    expect(result.current.defaultProjectId).toBe(
      mockDataVendor.projectGroup.defaultProject.id
    )
    expect(result.current.loading).toBe(false)
    expect(useQuery).toHaveBeenCalledWith(GetProjectsVendor, {
      skip: false,
      variables: { projectGroupId }
    })
  })

  it('should indicate loading state', () => {
    checkIfCustomer.mockReturnValue(true)
    useQuery.mockReturnValue({ data: undefined, loading: true })

    const { result } = renderHook(() => useProjectGroup({ projectGroupId }))

    expect(result.current.loading).toBe(true)
  })
})
