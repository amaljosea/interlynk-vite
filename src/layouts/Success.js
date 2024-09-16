import { useLocation } from 'react-router-dom'
import Confirmation from 'views/Auth/Confirmation'
import Invitation from 'views/Auth/Invitation'

import AuthContainer from 'components/AuthContainer'

const Success = () => {
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const confirmation = queryParams.get('confirmation_token')

  return (
    <AuthContainer>
      {confirmation ? <Confirmation /> : <Invitation />}
    </AuthContainer>
  )
}

export default Success
