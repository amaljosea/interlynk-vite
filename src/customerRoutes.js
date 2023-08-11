// import
import { FaImages } from 'react-icons/fa'
import Customer from 'views/Customer'

var customerRoutes = [
  {
    path: '/',
    name: 'Images',
    icon: <FaImages color='inherit' />,
    component: Customer,
    layout: '/customer'
  }
]

export default customerRoutes
