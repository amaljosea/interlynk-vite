// import
import { FaCode } from 'react-icons/fa'
import Customer from 'views/Dashboard/Customer'

var customerRoutes = [
  {
    path: '/signed_url_params',
    name: 'SBOM',
    icon: <FaCode color='inherit' />,
    component: Customer,
    layout: '/customer'
  }
]

export default customerRoutes
