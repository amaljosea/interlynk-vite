import Cookies from 'js-cookie'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import AuthContainer from 'components/AuthContainer'
import ResetForm from 'components/ResetForm'

export default function Reset() {
  const authToken = Cookies.get('authToken')
  const navigate = useNavigate()

  useEffect(() => {
    if (authToken) {
      navigate('/vendor/dashboard')
    }
  }, [authToken, navigate])

  return (
    <AuthContainer>
      <ResetForm />
    </AuthContainer>
  )
}
