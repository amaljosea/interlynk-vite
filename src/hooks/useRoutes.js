// example icons
import { useMemo } from 'react'
import CustomerProducts from 'views/Customer/Products'
import Dashboard from 'views/Dashboard/Dashboard'
import Policies from 'views/Dashboard/Policies'
import Products from 'views/Dashboard/Products'
import Profile from 'views/Dashboard/Profile'
import Support from 'views/Dashboard/Support'
import Vulnerabilities from 'views/Dashboard/Vulnerabilities'

import { HomeIcon } from 'components/Icons/Icons'
import Licenses from 'components/Licenses'

import {
  FaBalanceScale,
  FaBug,
  FaHeartbeat,
  FaRegSun,
  FaWindowMaximize
} from 'react-icons/fa'
import { FaFileImport, FaFileLines, FaToolbox } from 'react-icons/fa6'
import { IoMdAnalytics } from 'react-icons/io'
import { MdPolicy } from 'react-icons/md'

export function useRoutes() {
  const vendorRoutes = useMemo(
    () => [
      {
        path: '/dashboard',
        name: 'Dashboard',
        icon: <HomeIcon />,
        component: Dashboard,
        layout: '/vendor'
      },
      {
        path: '/products',
        name: 'Products',
        icon: <FaWindowMaximize />,
        component: Products,
        layout: '/vendor'
      },
      {
        path: '/requests',
        name: 'Requests',
        icon: <FaFileImport />,
        component: () => 'Requests',
        layout: '/vendor'
      },
      {
        path: '/vulnerabilities',
        name: 'Vulnerabilities',
        icon: <FaBug />,
        component: Vulnerabilities,
        layout: '/vendor'
      },
      {
        path: '/licenses',
        name: 'Licenses',
        icon: <FaBalanceScale />,
        component: Licenses,
        layout: '/vendor'
      },
      {
        path: '/analytics',
        name: 'Analytics',
        icon: <IoMdAnalytics />,
        component: () => 'Analytics',
        layout: '/vendor'
      },
      {
        path: '/tools',
        name: 'Tools',
        icon: <FaToolbox />,
        component: () => 'Tool',
        layout: '/vendor'
      },
      {
        path: '/support',
        name: 'Support',
        icon: <FaHeartbeat />,
        component: Support,
        layout: '/vendor'
      },
      {
        path: '/policies',
        name: 'Policies',
        icon: <MdPolicy />,
        component: Policies,
        layout: '/vendor'
      },
      {
        path: '/settings?tab=users',
        name: 'Settings',
        icon: <FaRegSun />,
        component: Profile,
        layout: '/vendor'
      },
      {
        path: 'http://docs.interlynk.io/',
        name: 'Documentation',
        icon: <FaFileLines />,
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
        icon: <FaWindowMaximize />,
        component: CustomerProducts,
        layout: '/customer'
      }
    ],
    []
  )

  return { vendor: vendorRoutes, customer: customerRoutes }
}
