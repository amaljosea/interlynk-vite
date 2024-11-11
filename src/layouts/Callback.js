import Cookies from 'js-cookie'
import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import { Box } from '@chakra-ui/react'

import useCustomToast from 'hooks/useCustomToast'
import useQueryParam from 'hooks/useQueryParam'

const Callback = () => {
  const token = useQueryParam('token')
  const error = useQueryParam('error')
  const success = useQueryParam('success')
  const navigate = useNavigate()
  const { showToast } = useCustomToast()

  useEffect(() => {
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
  }, [token, error, success, navigate, showToast])

  return <Box p={2}>Processing...</Box>
}

export default Callback
