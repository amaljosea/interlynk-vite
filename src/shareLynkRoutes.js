// import
import { FaImages } from 'react-icons/fa'
import SBOM from 'views/Sbom'

const ShareLynkRoutes = [
  {
    path: '/',
    name: 'Products',
    icon: <FaImages color='inherit' />,
    component: SBOM,
    layout: '/sharelynk'
  }
]

export default ShareLynkRoutes
