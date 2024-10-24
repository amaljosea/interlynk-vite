import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'

import { useMediaQuery } from '@chakra-ui/react'
import { useColorMode } from '@chakra-ui/system'

import DeviceWarning from 'components/DeviceWarning'

const Auth = () => {
  const [isDesktop] = useMediaQuery('(min-width: 1024px)')
  const { colorMode, setColorMode } = useColorMode()

  useEffect(() => {
    if (colorMode === 'dark') setColorMode('light')
  }, [colorMode, setColorMode])

  if (!isDesktop) return <DeviceWarning />

  return <Outlet />
}

export default Auth
