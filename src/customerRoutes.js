// import
import { FaImages, FaWindowMaximize } from 'react-icons/fa'
import Customer from 'views/Customer'

var customerRoutes = [
  {
    path: '/images',
    name: 'Images',
    icon: <FaImages color='inherit' />,
    component: Customer,
    layout: '/customer'
  },
  {
    path: '/products',
    name: 'Products',
    icon: <FaWindowMaximize color='inherit' />,
    component: Customer,
    layout: '/customer'
  }
]

export default customerRoutes
