// Vendor pages
import Dashboard from 'views/Dashboard/Dashboard'
import Profile from 'views/Dashboard/Profile'
import Images from 'views/Dashboard/Images'
import Feed from 'views/Dashboard/Feed'
import Products from 'views/Dashboard/Products'
import Connections from 'views/Dashboard/Connections'
import Sharelynk from 'views/Dashboard/Sharelynk'

// Customer pages
import CustomerImages from 'views/Customer/Images'
import CustomerProducts from 'views/Customer/Products'

import {
  FaRegSun,
  FaImages,
  FaPlug,
  FaBullhorn,
  FaWindowMaximize,
  FaExchangeAlt,
  FaBug
} from 'react-icons/fa'
import { HomeIcon } from 'components/Icons/Icons'
import { BsFillFolderSymlinkFill } from 'react-icons/bs'
import Automation from 'views/Dashboard/Automation'
import { TbSettingsAutomation } from 'react-icons/tb'
import ChangeLog from 'views/Dashboard/Changelog'
import Vulnerabilities from 'views/Dashboard/Vulnerabilities'

export const dashRoutes = [
  {
    path: '/dashboard',
    name: 'Dashboard',
    icon: <HomeIcon color='inherit' />,
    component: Dashboard,
    layout: '/vendor'
  },
  // {
  //   path: '/images',
  //   name: 'Images',
  //   icon: <FaImages color='inherit' />,
  //   component: Images,
  //   layout: '/vendor'
  // },
  {
    path: '/products',
    name: 'Products',
    icon: <FaWindowMaximize color='inherit' />,
    component: Products,
    layout: '/vendor'
  },
  {
    path: '/vulnerabilities',
    name: 'Vulnerabilities',
    icon: <FaBug color='inherit' />,
    component: Vulnerabilities,
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
  // {
  //   path: '/connections',
  //   name: 'Connections',
  //   icon: <FaPlug color='inherit' />,
  //   component: Connections,
  //   layout: '/vendor'
  // },
  {
    path: '/profiles',
    name: 'Settings',
    icon: <FaRegSun color='inherit' />,
    component: Profile,
    layout: '/vendor'
  },
  {
    path: '/autofix',
    name: 'Settings',
    icon: <TbSettingsAutomation color='inherit' />,
    component: Automation,
    layout: '/vendor'
  },
  {
    path: '/changelog',
    name: 'Change Log',
    icon: <FaExchangeAlt color='inherit' />,
    component: ChangeLog,
    layout: '/vendor'
  }
]

export const customerRoutes = [
  {
    path: '/images',
    name: 'Images',
    icon: <FaImages color='inherit' />,
    component: CustomerImages,
    layout: '/customer'
  },
  {
    path: '/products',
    name: 'Products',
    icon: <FaWindowMaximize color='inherit' />,
    component: CustomerProducts,
    layout: '/customer'
  }
]
