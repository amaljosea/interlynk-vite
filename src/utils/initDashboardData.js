import { setItem } from './localStorageUtils'

export const allActivities = ['recent_imports', 'recent_changes']

export const allProducts = [
  'products_by_lifestages',
  'versions_by_lifestages',
  'products_by_labels'
]

export const allVulns = [
  'critical_vulns_by_status',
  'high_vulns_by_status',
  'kev_vulns_by_status',
  'all_vulns_by_severity',
  'all_vulns_by_status'
]

export const allTrends = [
  'vulns_by_severity',
  'vulns_by_status',
  'defect_density',
  'resolution_age',
  'resotion_velocity',
  'patch_velocity'
]

export const allPolicies = ['policy_results']

export const initializeDashboardData = () => {
  const data = {
    activities: allActivities,
    products: allProducts,
    vulns: allVulns,
    trends: allTrends,
    policies: allPolicies
  }
  setItem('selectedCards', JSON.stringify(data))
}
