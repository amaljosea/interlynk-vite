import Cookies from 'js-cookie'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { isMobileOrTablet } from 'utils'

import DeviceWarning from 'components/DeviceWarning'

const Auth = () => {
  const location = useLocation()
  const isMobile = isMobileOrTablet()
  const authToken = Cookies.get('authToken')

  if (authToken) {
    return (
      <Navigate to='/vendor/dashboard' state={{ from: location }} replace />
    )
  }

  if (isMobile) return <DeviceWarning />

  return <Outlet />
}

export default Auth
