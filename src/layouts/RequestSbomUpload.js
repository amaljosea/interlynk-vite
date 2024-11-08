import { isMobileOrTablet } from 'utils'
import SbomUpload from 'views/Requests/SbomUpload'

import AuthContainer from 'components/AuthContainer'
import DeviceWarning from 'components/DeviceWarning'

const RequestSbomUpload = () => {
  const isMobile = isMobileOrTablet()

  if (isMobile) return <DeviceWarning />

  return (
    <AuthContainer>
      <SbomUpload />
    </AuthContainer>
  )
}

export default RequestSbomUpload
