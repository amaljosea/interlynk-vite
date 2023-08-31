// import
import Dashboard from 'views/Dashboard/Dashboard'
import Profile from 'views/Dashboard/Profile'
import Images from 'views/Dashboard/Images'
import Feed from 'views/Dashboard/Feed'
import Products from 'views/Dashboard/Products'
import Connections from 'views/Dashboard/Connections'
import Sharelynk from 'views/Dashboard/Sharelynk'

import {
  FaRegSun,
  FaImages,
  FaPlug,
  FaBullhorn,
  FaWindowMaximize
} from 'react-icons/fa'
import { HomeIcon } from 'components/Icons/Icons'
import { BsFillFolderSymlinkFill } from 'react-icons/bs'

var dashRoutes = [
  {
    path: '/dashboard',
    name: 'Dashboard',
    icon: <HomeIcon color='inherit' />,
    component: Dashboard,
    layout: '/vendor'
  },
  {
    path: '/images',
    name: 'Images',
    icon: <FaImages color='inherit' />,
    component: Images,
    layout: '/vendor'
  },
  {
    path: '/products',
    name: 'Products',
    icon: <FaWindowMaximize color='inherit' />,
    component: Products,
    layout: '/vendor'
  },
  {
    path: '/sharelynk',
    name: 'ShareLynk',
    icon: <BsFillFolderSymlinkFill color='inherit' size={18} />,
    component: Sharelynk,
    layout: '/vendor'
  },
  {
    path: '/feed',
    name: 'Feed',
    icon: <FaBullhorn color='inherit' />,
    component: Feed,
    layout: '/vendor'
  },
  {
    path: '/connections',
    name: 'Connections',
    icon: <FaPlug color='inherit' />,
    component: Connections,
    layout: '/vendor'
  },
  {
    path: '/profiles',
    name: 'Settings',
    icon: <FaRegSun color='inherit' />,
    component: Profile,
    layout: '/vendor'
  }
]

export default dashRoutes
