import { useMutation } from '@apollo/client'
import axios from 'axios'
import Cookies from 'js-cookie'
import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons'
import {
  Alert,
  AlertDescription,
  AlertIcon,
  Box,
  Button,
  Flex,
  FormControl,
  FormHelperText,
  FormLabel,
  IconButton,
  Input,
  InputGroup,
  InputRightElement,
  Stack,
  Text,
  chakra
} from '@chakra-ui/react'

import useCustomToast from 'hooks/useCustomToast'

import { UserResendConfirmationEmail } from 'graphQL/Mutation'

const LoginForm = () => {
  const { showToast } = useCustomToast()
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const emailId = queryParams.get('id')

  const loginURL = process.env.REACT_APP_VENDOR_LOGIN_URL

  const [email, setEmail] = useState(emailId ? emailId : '')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const [resendInvitation] = useMutation(UserResendConfirmationEmail)

  const handleTogglePassword = () => {
    setShowPassword(!showPassword)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    axios
      .post(`${loginURL}`, { user: { email, password } })
      .then((response) => {
        console.log('response', response)
        const { status } = response.data
        if (status.code === 200) {
          localStorage.setItem('username', status.data.user.name)
          localStorage.setItem('email', status.data.user.email)
          Cookies.set('authToken', response.headers.authorization)
          window.location.href = '/vendor/dashboard'
        }
      })
      .catch((error) => {
        console.log(`Error: ${error}`)
        if (error.response) {
          const { status, data } = error.response
          if (status === 401) {
            setError(data?.error)
          } else if (status === 404) {
            setError(`Internal routing error. Please try again`)
          } else {
            setError(`Internal error. Please try again`)
          }
        } else {
          setError(`Internal error. Please try again`)
        }
      })
  }

  const onResendEmail = async () => {
    await resendInvitation({ variables: { email } }).then((res) => {
      if (res?.data?.userResendConfirmationEmail?.errors?.length > 0) {
        setError(res?.data?.userResendConfirmationEmail?.errors[0])
      } else {
        setEmail('')
        setPassword('')
        setError('')
        showToast({
          description: 'Invitation sent successfully',
          status: 'success'
        })
      }
    })
  }

  return (
    <Flex
      mt={2}
      direction={'column'}
      alignItems={'center'}
      justifyContent={'center'}
    >
      <Text fontSize={'lg'} textAlign={'center'}>
        Welcome
      </Text>
      <Text fontSize={'sm'} textAlign={'center'} color={'#555'}>
        Log in to Interlynk to continue to the dashboard.
      </Text>
      {error !== '' && (
        <Box mt={4} width={'100%'}>
          <Alert status='error' borderRadius={4}>
            <AlertIcon />
            <AlertDescription>
              {error}
              {error ===
                'You have to confirm your email address before continuing.' && (
                <p>
                  Lost invitation link ?{' '}
                  <strong
                    style={{
                      cursor: 'pointer',
                      fontWeight: 500,
                      color: '#3182CE'
                    }}
                    onClick={onResendEmail}
                  >
                    Resend
                  </strong>
                </p>
              )}
            </AlertDescription>
          </Alert>
        </Box>
      )}
      <form style={{ width: '100%' }} onSubmit={handleSubmit}>
        <Stack py={'1rem'} direction={'column'} gap={3} width={'100%'} mt={2}>
          <FormControl>
            <FormLabel htmlFor='email'>Email address</FormLabel>
            <Input
              type='email'
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                setError('')
              }}
              placeholder='abc@example.com'
              autoComplete='off'
              isReadOnly={emailId}
            />
          </FormControl>
          <FormControl>
            <FormLabel htmlFor='password'>Password</FormLabel>
            <InputGroup>
              <Input
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setError('')
                }}
                placeholder='*******'
                type={showPassword ? 'text' : 'password'}
              />
              <InputRightElement width='3.1rem'>
                <IconButton
                  h='1.75rem'
                  size='sm'
                  bg={'transparent'}
                  onClick={handleTogglePassword}
                  icon={showPassword ? <ViewIcon /> : <ViewOffIcon />}
                />
              </InputRightElement>
            </InputGroup>
            <Link to={'/reset_password'}>
              <FormHelperText _hover={{ color: 'blue.500' }}>
                Forgot password ?
              </FormHelperText>
            </Link>
          </FormControl>
          <Button width='full' colorScheme='blue' type='submit'>
            Log in
          </Button>
          <Stack
            alignItems={'center'}
            justifyContent={'center'}
            direction={'row'}
            spacing={2}
          >
            <Text fontSize={'sm'}>{`Don't have an account ?`}</Text>
            <Link to={`/register`}>
              <Text fontSize='sm' color='blue.500' fontWeight={'medium'}>
                Register
              </Text>
            </Link>
          </Stack>
          <Stack>
            <Text fontSize={'xs'} color={'gray.500'} textAlign={'center'}>
              By logging in, you acknowledge that you have read and agree to the
              <chakra.span color={'blue.600'}>
                {' '}
                <Link target='_blank' to={'https://www.interlynk.io/privacy'}>
                  Privary Policy
                </Link>
              </chakra.span>{' '}
              and{' '}
              <chakra.span color={'blue.600'}>
                <Link target='_blank' to={'https://www.interlynk.io/terms'}>
                  Terms of Service
                </Link>
              </chakra.span>
            </Text>
          </Stack>
        </Stack>
      </form>
    </Flex>
  )
}

export default LoginForm
