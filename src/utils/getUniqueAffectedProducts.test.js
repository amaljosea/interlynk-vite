import { renderHook } from '@testing-library/react'

import { getUniqueAffectedProducts } from './getUniqueAffectedProducts'

describe('statusResults hook', () => {
  test('returns unique project group nodes sorted by updatedAt', () => {
    const inputNodes = [
      {
        id: 1,
        updatedAt: '2025-04-01T10:00:00Z',
        component: {
          sbom: {
            project: {
              projectGroup: { name: 'Group A' }
            }
          }
        }
      },
      {
        id: 2,
        updatedAt: '2025-04-02T10:00:00Z',
        component: {
          sbom: {
            project: {
              projectGroup: { name: 'Group B' }
            }
          }
        }
      },
      {
        id: 3,
        updatedAt: '2025-04-03T10:00:00Z',
        component: {
          sbom: {
            project: {
              projectGroup: { name: 'Group A' }
            }
          }
        }
      },
      {
        id: 4,
        updatedAt: '2025-04-04T10:00:00Z',
        component: {
          sbom: {
            project: {
              projectGroup: { name: 'Group C' }
            }
          }
        }
      },
      {
        id: 4,
        updatedAt: '2025-04-05T10:00:00Z',
        component: {
          sbom: {
            project: {
              projectGroup: { name: 'Group C' }
            }
          }
        }
      }
    ]

    const { result } = renderHook(() => getUniqueAffectedProducts(inputNodes))

    expect(result.current).toHaveLength(3)
    expect(result.current[0].component.sbom.project.projectGroup.name).toBe(
      'Group C'
    )
    expect(result.current[1].component.sbom.project.projectGroup.name).toBe(
      'Group B'
    )
    expect(result.current[2].component.sbom.project.projectGroup.name).toBe(
      'Group A'
    )
  })

  test('returns empty array if nodes is undefined', () => {
    const { result } = renderHook(() => getUniqueAffectedProducts(undefined))
    expect(result.current).toEqual([])
  })
})
