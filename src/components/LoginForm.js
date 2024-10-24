import { useMutation } from '@apollo/client'
import axios from 'axios'
import Cookies from 'js-cookie'
import { useState } from 'react'
import { Link } from 'react-router-dom'

import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons'
import {
  AbsoluteCenter,
  Alert,
  AlertDescription,
  AlertIcon,
  Box,
  Button,
  Divider,
  Flex,
  FormControl,
  FormHelperText,
  FormLabel,
  IconButton,
  Input,
  InputGroup,
  InputRightElement,
  Stack,
  Text
} from '@chakra-ui/react'

import useCustomToast from 'hooks/useCustomToast'
import useQueryParam from 'hooks/useQueryParam'
import { useThemeColor } from 'hooks/useThemeColors'

import { UserResendConfirmationEmail } from 'graphQL/Mutation'

import PolicyTerms from './PolicyTerms'
import SocialLogin from './SocialLogin'

const LoginForm = () => {
  const { showToast } = useCustomToast()
  const emailId = useQueryParam('id')
  const {
    primaryBlueText,
    headingTextColor,
    primaryTextColor,
    secondaryTextColor
  } = useThemeColor([
    'primaryBlueText',
    'headingTextColor',
    'primaryTextColor',
    'secondaryTextColor'
  ])

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
        <Box mt={4} width={'100%'}>
          <Alert status='error' borderRadius={4}>
            <AlertIcon />
            <AlertDescription fontSize='sm'>
              {error}
              {error ===
                'You have to confirm your email address before continuing.' && (
                <p>
                  Lost invitation link ?{' '}
                  <strong
                    style={{
                      cursor: 'pointer',
                      fontWeight: 500,
                      color: primaryBlueText
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
            colorScheme='blue'
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
          <Box position='relative' py={1}>
            <Divider />
            <AbsoluteCenter
              px='2'
              bg={'white'}
              fontSize={'xs'}
              color={secondaryTextColor}
            >
              Or Login With
            </AbsoluteCenter>
          </Box>
          <SocialLogin />
          <PolicyTerms />
        </Stack>
      </form>
    </Flex>
  )
}

export default LoginForm
