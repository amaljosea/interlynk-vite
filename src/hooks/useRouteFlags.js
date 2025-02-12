import { useLocation } from 'react-router-dom'

export const useRouteFlags = () => {
  const { pathname } = useLocation()

  return {
    isVulnerabilityDetailsPage:
      pathname.includes('products') &&
      pathname.includes('env') &&
      pathname.includes('vulnerability'),

    isProductVersionPage: pathname.includes('version'),

    isProductDetailsPage:
      pathname.includes('products') && pathname.includes('env'),

    isProductsPage: pathname === '/vendor/products',

    isVulnerabilityRelatedPage: pathname.includes('vulnerabilities'),

    isProductsRelatedPage: pathname.includes('products'),

    isDashboardView: pathname === '/vendor/dashboard',

    isVendorPage: pathname.startsWith('/vendor'),

    isVulnerabilitiesPage: pathname === '/vendor/vulnerabilities',

    isVendorRootPage: pathname === '/vendor'
  }
}
