// example icons
import { useMemo } from 'react'
import CustomerProducts from 'views/Customer/Products'
import Dashboard from 'views/Dashboard/Dashboard'
import Package from 'views/Dashboard/Package'
import Policies from 'views/Dashboard/Policies'
import Products from 'views/Dashboard/Products'
import Profile from 'views/Dashboard/Profile'
import Support from 'views/Dashboard/Support'
import Vulnerabilities from 'views/Dashboard/Vulnerabilities'

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
