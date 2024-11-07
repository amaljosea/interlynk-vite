import SbomUpload from 'views/Requests/SbomUpload'

import { useMediaQuery } from '@chakra-ui/react'

import AuthContainer from 'components/AuthContainer'
import DeviceWarning from 'components/DeviceWarning'

const RequestSbomUpload = () => {
  const [isDesktop] = useMediaQuery('(min-width: 1024px)')

  if (!isDesktop) return <DeviceWarning />
  return (
    <AuthContainer>
      <SbomUpload />
    </AuthContainer>
  )
}

export default RequestSbomUpload
