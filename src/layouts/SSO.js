import Cookies from 'js-cookie'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import AuthContainer from 'components/AuthContainer'
import SSOForm from 'components/SSO/SSOForm'

export default function SSO() {
  const authToken = Cookies.get('authToken')
  const navigate = useNavigate()

  useEffect(() => {
    if (authToken) {
      navigate('/vendor/dashboard')
    }
  }, [authToken, navigate])

  return (
    <AuthContainer>
      <SSOForm />
    </AuthContainer>
  )
}
