import Confirmation from 'views/Auth/Confirmation'
import Invitation from 'views/Auth/Invitation'

import AuthContainer from 'components/AuthContainer'

import useQueryParam from 'hooks/useQueryParam'

const Success = () => {
  const confirmation = useQueryParam('confirmation_token')

  return (
    <AuthContainer>
      {confirmation ? <Confirmation /> : <Invitation />}
    </AuthContainer>
  )
}

export default Success
