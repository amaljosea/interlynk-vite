import { Outlet } from 'react-router-dom'
import { isMobileOrTablet } from 'utils'

import DeviceWarning from 'components/DeviceWarning'

const Auth = () => {
  const isMobile = isMobileOrTablet()

  if (isMobile) return <DeviceWarning />

  return <Outlet />
}

export default Auth
