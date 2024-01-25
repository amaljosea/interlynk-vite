// chakra imports
import {
  Alert,
  AlertDescription,
  AlertIcon,
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Stack,
  Text,
  useToast
} from '@chakra-ui/react'
// core components
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { UserResendConfirmationEmail } from 'graphQL/Mutation'
import { useMutation } from '@apollo/client'
import { useState } from 'react'
import Cookies from 'js-cookie'
import axios from 'axios'

const LoginForm = () => {
  const toast = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const emailId = queryParams.get('id')

  const loginURL = process.env.REACT_APP_VENDOR_LOGIN_URL

  const [email, setEmail] = useState(emailId ? emailId : '')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')


  const [resendInvitation, { loading }] = useMutation(
    UserResendConfirmationEmail
  )

  const handleSubmit = (e) => {
    e.preventDefault()
    axios
      .post(`${loginURL}`, {
        user: {
          email,
          password
        }
      })
      .then((response) => {
        const { status } = response.data
        if (status.code === 200) {
          sessionStorage.removeItem('product')
          sessionStorage.setItem('username', status.data.user.name)
          sessionStorage.setItem('email', status.data.user.email)
          Cookies.set('authToken', response.headers.authorization)
          navigate('/vendor/dashboard')
        }
      })
      .catch((error) => {
        console.log(`Error: ${error}`)
        if (error.response) {
          const { status, data } = error.response
          if (status === 401) {
            setError(data)
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
      console.log(res.data)
      if (res?.data?.userResendConfirmationEmail?.errors?.length > 0) {
        setError(res?.data?.userResendConfirmationEmail?.errors[0])
      } else {
        setEmail('')
        setPassword('')
        setError('')
        toast({
          description: 'Invitation sent successfully',
          status: 'success',
          position: 'top',
          duration: 3000
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
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </Box>
      )}
      <form style={{ width: '100%' }} onSubmit={handleSubmit}>
        <Stack py={'1rem'} direction={'column'} gap={3} width={'100%'} mt={4}>
          <FormControl>
            <FormLabel htmlFor='email'>Email address</FormLabel>
            <Input
              type='email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder='abc@example.com'
              autoComplete='off'
              isReadOnly={emailId}
            />
          </FormControl>
          <FormControl>
            <FormLabel htmlFor='password'>Password</FormLabel>
            <Input
              type='password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder='*******'
            />
          </FormControl>
          {error ===
          'You have to confirm your email address before continuing.' ? (
            <Button
              colorScheme='blue'
              isLoading={loading}
              loadingText='Submitting...'
              onClick={onResendEmail}
            >
              Resend Invitation
            </Button>
          ) : (
            <Button
              width='full'
              colorScheme='blue'
              type='submit'
              isDisabled={error !== ''}
            >
              Log in
            </Button>
          )}
          <Stack
            alignItems={'center'}
            justifyContent={'center'}
            direction={'row'}
            spacing={2}
          >
            <Text fontSize={'sm'}>{`Don't have an account ?`}</Text>
            <Link to={'/register'}>
              <Text fontSize='sm' color='blue.500' fontWeight={'medium'}>
                Register
              </Text>
            </Link>
          </Stack>
        </Stack>
      </form>
    </Flex>
  )
}

export default LoginForm
