import { useEffect } from 'react'
import SbomUpload from 'views/Requests/SbomUpload'

import { useMediaQuery } from '@chakra-ui/react'
import { useColorMode } from '@chakra-ui/system'

import AuthContainer from 'components/AuthContainer'
import DeviceWarning from 'components/DeviceWarning'

const RequestSbomUpload = () => {
  const [isDesktop] = useMediaQuery('(min-width: 1024px)')
  const { colorMode, setColorMode } = useColorMode()

  useEffect(() => {
    if (colorMode === 'dark') setColorMode('light')
  }, [colorMode, setColorMode])
  if (!isDesktop) return <DeviceWarning />
  return (
    <AuthContainer>
      <SbomUpload />
    </AuthContainer>
  )
}

export default RequestSbomUpload
