import { Button, ButtonGroup } from '@chakra-ui/react'

import { FaGithub } from 'react-icons/fa6'
import { FcGoogle } from 'react-icons/fc'

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
        console.log('Redirecting to:', data.redirect_uri)
        window.location.href = data.redirect_uri
      }
    } catch (error) {
      console.log('Sign In', error)
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
      console.log('Auth', error)
    }
  }

  return (
    <ButtonGroup>
      <Button
        width={'100%'}
        title='Google'
        variant='outline'
        colorScheme='blue'
        onClick={() => onAuth('google')}
        leftIcon={<FcGoogle fontSize={18} />}
      >
        Google
      </Button>
      <Button
        width={'100%'}
        title='Github'
        variant='outline'
        colorScheme='blue'
        leftIcon={<FaGithub />}
        onClick={() => onAuth('github')}
      >
        Github
      </Button>
    </ButtonGroup>
  )
}

export default SocialLogin
