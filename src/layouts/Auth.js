import { Outlet } from 'react-router-dom'

import { useMediaQuery } from '@chakra-ui/react'

import DeviceWarning from 'components/DeviceWarning'

const Auth = () => {
  const [isDesktop] = useMediaQuery('(min-width: 1024px)')

  if (!isDesktop) return <DeviceWarning />

  return <Outlet />
}

export default Auth
