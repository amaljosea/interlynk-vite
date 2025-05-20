import { Button, Stack } from '@chakra-ui/react'

import { FcGoogle } from 'react-icons/fc'
import { LuGithub } from 'react-icons/lu'

const SocialLogin = () => {
  const serverURL = process.env.REACT_APP_SERVER

  const signIn = async (provider, token) => {
    const path = provider === 'google' ? 'google_oauth2' : 'github'
    try {
      const response = await fetch(`${serverURL}/auth/${path}`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': token
        },
        body: JSON.stringify({})
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      if (data.redirect_uri) {
        console.warn('Redirecting to:', data.redirect_uri)
        window.location.href = data.redirect_uri
      }
    } catch (error) {
      console.warn('Sign In', error)
    }
  }

  const onAuth = async (provider) => {
    try {
      const response = await fetch(`${serverURL}/csrf_token`, {
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const token = response.headers.get('x-csrf-token')
      if (token) {
        await signIn(provider, token)
      }
    } catch (error) {
      console.warn('Auth', error)
    }
  }

  return (
    <Stack>
      <Button
        width={'100%'}
        title='Google'
        variant='outline'
        onClick={() => onAuth('google')}
        leftIcon={<FcGoogle fontSize={18} />}
      >
        Google
      </Button>
      <Button
        width={'100%'}
        title='Github'
        variant='outline'
        leftIcon={<LuGithub />}
        onClick={() => onAuth('github')}
      >
        Github
      </Button>
    </Stack>
  )
}

export default SocialLogin
