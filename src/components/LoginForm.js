import { useMutation } from '@apollo/client'
import axios from 'axios'
import Cookies from 'js-cookie'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons'
import { Button, Flex, IconButton, Stack, Text } from '@chakra-ui/react'
import { Alert, AlertDescription, AlertIcon } from '@chakra-ui/react'
import { FormControl, FormHelperText, FormLabel } from '@chakra-ui/react'
import { Input, InputGroup, InputRightElement } from '@chakra-ui/react'

import useCustomToast from 'hooks/useCustomToast'
import useQueryParam from 'hooks/useQueryParam'
import { useThemeColor } from 'hooks/useThemeColors'

import { UserResendConfirmationEmail } from 'graphQL/Mutation'

import DividerWithText from './DividerWithText'
import PolicyTerms from './PolicyTerms'
import SocialLogin from './SocialLogin'

const LoginForm = () => {
  const navigate = useNavigate()
  const { showToast } = useCustomToast()
  const emailId = useQueryParam('id')
  const { primaryBlueText, headingTextColor, primaryTextColor } = useThemeColor(
    ['primaryBlueText', 'headingTextColor', 'primaryTextColor']
  )

  const loginURL = process.env.REACT_APP_VENDOR_LOGIN_URL

  const [error, setError] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState(emailId ? emailId : '')

  const [resendInvitation] = useMutation(UserResendConfirmationEmail)

  const handleTogglePassword = () => {
    setShowPassword(!showPassword)
  }

  const handleSubmit = (e) => {
    setLoading(true)
    e.preventDefault()
    axios
      .post(`${loginURL}`, { user: { email, password } })
      .then((response) => {
        const { status } = response.data
        if (status.code === 200) {
          setLoading(false)
          Cookies.set('authToken', response.headers.authorization)
          Cookies.set('refreshToken', status?.data?.refresh_token)
          navigate('/vendor/dashboard')
        }
      })
      .catch((error) => {
        setLoading(false)
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

  const alertStyle = {
    cursor: 'pointer',
    fontWeight: 500,
    color: primaryBlueText
  }

  const notConfirmed =
    'You have to confirm your email address before continuing.'

  return (
    <Flex
      height={'100%'}
      mt={[4, 6, 8, 24]}
      direction={'column'}
      alignItems={'flex-start'}
    >
      <Text
        color={primaryTextColor}
        fontSize={'20px'}
        fontWeight={'semibold'}
        textAlign={'center'}
      >
        Welcome
      </Text>
      <Text fontSize={'sm'} color={headingTextColor}>
        Log in to continue to the dashboard
      </Text>
      {error !== '' && (
        <Alert mt={4} status={'error'} borderRadius={4}>
          <AlertIcon />
          <AlertDescription fontSize={'sm'} pr={2}>
            {error === notConfirmed ? (
              <p>
                Lost invitation link ?{' '}
                <strong style={alertStyle} onClick={onResendEmail}>
                  Resend
                </strong>
              </p>
            ) : (
              error
            )}
          </AlertDescription>
        </Alert>
      )}
      <form style={{ width: '100%' }} onSubmit={handleSubmit}>
        <Stack py={'1rem'} direction={'column'} gap={3} width={'100%'} mt={2}>
          <FormControl isRequired>
            <FormLabel htmlFor='email'>Email address</FormLabel>
            <Input
              id='email'
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
          <FormControl isRequired>
            <FormLabel htmlFor='password'>Password</FormLabel>
            <InputGroup>
              <Input
                id='passowrd'
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
              <FormHelperText
                textAlign={'right'}
                _hover={{ color: primaryBlueText }}
              >
                Forgot password ?
              </FormHelperText>
            </Link>
          </FormControl>
          <Button
            width='full'
            type='submit'
            title='Login'
            colorScheme='blue'
            isLoading={loading}
            loadingText='Logging in'
            isDisabled={email === '' || password === ''}
          >
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
              <Text fontSize='sm' color={primaryBlueText} fontWeight={'medium'}>
                Register
              </Text>
            </Link>
          </Stack>
          <DividerWithText text='Or Login With' />
          <SocialLogin />
          <PolicyTerms />
        </Stack>
      </form>
    </Flex>
  )
}

export default LoginForm
