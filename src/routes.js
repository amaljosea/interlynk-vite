// import
import Dashboard from 'views/Dashboard/Dashboard'
import Products from 'views/Dashboard/Products'
import Activities from 'views/Dashboard/Activities'
import Profile from 'views/Dashboard/Profile'
import SBOMs from 'views/Dashboard/SBOMs'
import Images from 'views/Dashboard/Images'
import { HomeIcon } from 'components/Icons/Icons'

import {
  FaWindowMaximize,
  FaRegChartBar,
  FaRegSun,
  FaCode,
  FaImages,
  FaPlug
} from 'react-icons/fa'
import Connections from 'views/Dashboard/Connections'

var dashRoutes = [
  {
    path: '/dashboard',
    name: 'Dashboard',
    icon: <HomeIcon color='inherit' />,
    component: Dashboard,
    layout: '/admin'
  },
  {
    path: '/images',
    name: 'Images',
    icon: <FaImages color='inherit' />,
    component: Images,
    layout: '/admin'
  },
  {
    path: '/products',
    name: 'Products',
    icon: <FaWindowMaximize color='inherit' />,
    component: Products,
    layout: '/admin'
  },
  {
    path: '/sboms',
    name: 'SBOM',
    icon: <FaCode color='inherit' />,
    component: SBOMs,
    layout: '/admin'
  },
  {
    path: '/activities',
    name: 'Activities',
    icon: <FaRegChartBar color='inherit' />,
    component: Activities,
    layout: '/admin'
  },
  {
    path: '/connections',
    name: 'Connections',
    icon: <FaPlug color='inherit' />,
    component: Connections,
    layout: '/admin'
  },
  {
    path: '/profiles',
    name: 'Settings',
    icon: <FaRegSun color='inherit' />,
    component: Profile,
    layout: '/admin'
  }
]

export default dashRoutes
