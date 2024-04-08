// Vendor pages
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
import { FaHandshakeSimple, FaToolbox } from 'react-icons/fa6'
import { MdPolicy } from 'react-icons/md'

export const dashRoutes = [
  {
    path: '/dashboard',
    name: 'Dashboard',
    icon: <HomeIcon color='inherit' />,
    component: Dashboard,
    layout: '/vendor'
  },
  {
    path: '/products',
    name: 'Products',
    icon: <FaWindowMaximize color='inherit' />,
    component: Products,
    layout: '/vendor'
  },
  /*
  { path: '/SAG', name: 'SAG', icon: <FaHandshakeSimple color='inherit' size={18} />, component: Products, layout: '/vendor'
  },
  */
  {
    path: '/vulnerabilities',
    name: 'Vulnerabilities',
    icon: <FaBug color='inherit' />,
    component: Vulnerabilities,
    layout: '/vendor'
  },
  {
    path: '/licenses',
    name: 'Licenses',
    icon: <FaBalanceScale color='inherit' />,
    component: Licenses,
    layout: '/vendor'
  },
  // {
  //   path: '/sharelynk',
  //   name: 'ShareLynk',
  //   icon: <BsFillFolderSymlinkFill color='inherit' size={18} />,
  //   component: Sharelynk,
  //   layout: '/vendor'
  // },
  // {
  //   path: '/feed',
  //   name: 'Feed',
  //   icon: <FaBullhorn color='inherit' />,
  //   component: Feed,
  //   layout: '/vendor'
  // },
  {
    path: '/tools',
    name: 'Tools',
    icon: <FaToolbox color='inherit' />,
    component: () => 'Tool',
    layout: '/vendor'
  },
  {
    path: '/support',
    name: 'Support',
    icon: <FaHeartbeat color='inherit' />,
    component: Support,
    layout: '/vendor'
  },
  {
    path: '/policies',
    name: 'Policies',
    icon: <MdPolicy color='inherit' />,
    component: Policies,
    layout: '/vendor'
  },
  {
    path: '/settings',
    name: 'Settings',
    icon: <FaRegSun color='inherit' />,
    component: Profile,
    layout: '/vendor'
  }
]

export const customerRoutes = [
  {
    path: '/products',
    name: 'Products',
    icon: <FaWindowMaximize color='inherit' />,
    component: CustomerProducts,
    layout: '/customer'
  }
]
