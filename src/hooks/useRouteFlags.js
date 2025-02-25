import { useLocation } from 'react-router-dom'

function vendorRootCheck(pathname) {
  const match = pathname.match(/^\/vendor(\/*)$/)
  return !!match
}

export const useRouteFlags = () => {
  const { pathname, search } = useLocation()
  const searchParams = new URLSearchParams(search)

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

    isVendorRootPage: pathname === '/vendor' || vendorRootCheck(pathname),

    isGlobalVulnerabilitiesPage:
      pathname.startsWith('/vendor/vulnerabilities') &&
      searchParams.get('tab') === 'productVulnerabilities' &&
      !!searchParams.get('vulnId'),

    isSingleVulnerabilityPage:
      pathname === '/vendor/vulnerabilities' && !!searchParams.get('vulnId')
  }
}
