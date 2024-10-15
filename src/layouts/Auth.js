import Cookies from 'js-cookie'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import { useMediaQuery } from '@chakra-ui/react'

import AuthContainer from 'components/AuthContainer'
import DeviceWarning from 'components/DeviceWarning'
import LoginForm from 'components/LoginForm'

export default function Auth() {
  const [isDesktop] = useMediaQuery('(min-width: 1024px)')
  const authToken = Cookies.get('authToken')
  const navigate = useNavigate()

  useEffect(() => {
    if (authToken) {
      navigate('/vendor/dashboard')
    }
  }, [authToken, navigate])

  if (!isDesktop) return <DeviceWarning />

  return (
    <AuthContainer>
      <LoginForm />
    </AuthContainer>
  )
}
