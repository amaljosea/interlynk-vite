// example icons
import { useMemo } from 'react'
import { lazyImport } from 'utils/lazyImport.js'

import Licenses from 'components/Licenses'

import {
  LuBookOpen,
  LuBox,
  LuBug,
  LuChartNoAxesCombined,
  LuFolderDown,
  LuGitCompare,
  LuHeartHandshake,
  LuHouse,
  LuPackage,
  LuScale,
  LuSettings,
  LuShieldCheck
} from 'react-icons/lu'

const CustomerProducts = lazyImport(() => import('views/Customer/Products'))
const Dashboard = lazyImport(() => import('views/Dashboard/Dashboard'))
const Package = lazyImport(() => import('views/Dashboard/Package'))
const Policies = lazyImport(() => import('views/Dashboard/Policies'))
const Products = lazyImport(() => import('views/Dashboard/Products'))
const Profile = lazyImport(() => import('views/Dashboard/Profile'))
const Support = lazyImport(() => import('views/Dashboard/Support'))
const Vulnerabilities = lazyImport(
  () => import('views/Dashboard/Vulnerabilities')
)

export function useRoutes() {
  const vendorRoutes = useMemo(
    () => [
      {
        path: '/dashboard',
        name: 'Dashboard',
        icon: <LuHouse size={20} />,
        component: Dashboard,
        layout: '/vendor'
      },
      {
        path: '/products',
        name: 'Products',
        icon: <LuBox size={20} />,
        component: Products,
        layout: '/vendor'
      },
      {
        path: '/requests',
        name: 'Requests',
        icon: <LuFolderDown size={20} />,
        component: () => 'Requests',
        layout: '/vendor'
      },
      {
        path: '/vulnerabilities',
        name: 'Vulnerabilities',
        icon: <LuBug size={20} />,
        component: Vulnerabilities,
        layout: '/vendor'
      },
      {
        path: '/licenses',
        name: 'Licenses',
        icon: <LuScale size={20} />,
        component: Licenses,
        layout: '/vendor'
      },
      {
        path: '/package',
        name: 'Package',
        icon: <LuPackage size={20} />,
        component: Package,
        layout: '/vendor'
      },
      {
        path: '/analytics',
        name: 'Analytics',
        icon: <LuChartNoAxesCombined size={20} />,
        component: () => 'Analytics',
        layout: '/vendor'
      },
      {
        path: '/tools',
        name: 'Tools',
        icon: <LuGitCompare size={20} />,
        component: () => 'Tool',
        layout: '/vendor'
      },
      {
        path: '/support',
        name: 'Support',
        icon: <LuHeartHandshake size={20} />,
        component: Support,
        layout: '/vendor'
      },
      {
        path: '/policies',
        name: 'Policies',
        icon: <LuShieldCheck size={20} />,
        component: Policies,
        layout: '/vendor'
      },
      {
        path: '/settings?tab=users',
        name: 'Settings',
        icon: <LuSettings size={20} />,
        component: Profile,
        layout: '/vendor'
      },
      {
        path: 'http://docs.interlynk.io/',
        name: 'Documentation',
        icon: <LuBookOpen size={20} />,
        component: () => null,
        layout: ''
      }
    ],
    []
  )

  const customerRoutes = useMemo(
    () => [
      {
        path: '/products',
        name: 'Products',
        icon: <LuBox size={20} />,
        component: CustomerProducts,
        layout: '/customer'
      }
    ],
    []
  )

  return { vendor: vendorRoutes, customer: customerRoutes }
}
