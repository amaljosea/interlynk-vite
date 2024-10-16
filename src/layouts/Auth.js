import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'

import { useColorMode } from '@chakra-ui/system'

const Auth = () => {
  const { colorMode, setColorMode } = useColorMode()

  useEffect(() => {
    if (colorMode === 'dark') setColorMode('light')
  }, [colorMode, setColorMode])

  return <Outlet />
}

export default Auth
