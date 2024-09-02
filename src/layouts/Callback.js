import Cookies from 'js-cookie'
import React, { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { Box } from '@chakra-ui/react'

import useCustomToast from 'hooks/useCustomToast'

const Callback = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { showToast } = useCustomToast()

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search)
    const token = queryParams.get('token')
    const error = queryParams.get('error')
    const success = queryParams.get('success')

    if (success === 'true' && token) {
      Cookies.set('authToken', token)
      localStorage.setItem('loginType', 'social')
      navigate('/vendor/dashboard')
    } else {
      showToast({
        description: error,
        status: 'error'
      })
      navigate('/auth')
    }
  }, [location, navigate, showToast])

  return <Box p={2}>Processing...</Box>
}

export default Callback
