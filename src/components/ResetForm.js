import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons'
import { Alert, AlertDescription, AlertIcon, Box, Button, Flex, FormControl, FormErrorMessage, FormHelperText, FormLabel, IconButton, Input, InputGroup, InputRightElement, Stack, Text, useToast } from '@chakra-ui/react'
import axios from 'axios'
import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { validPassword } from 'utils'

const ResetForm = () => {
  const toast = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const emailId = queryParams.get('id')
  const token = queryParams.get('reset_password_token')

  const resetURL = process.env.REACT_APP_VENDOR_RESET_URL

  const [email, setEmail] = useState(emailId ? emailId : '')
  const [showPassword, setShowPassword] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showConfPassword, setShowConfPassword] = useState(false)
  const [invalidPassword, setInvalidPassword] = useState(false)
  const [passError, setPassError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handlePasswordChange = (e) => {
    const { value } = e.target
    setPassword(value)
    if (value !== '' && value !== confirmPassword && confirmPassword !== '') {
      setPassError('Confirm password does not match password')
    } else {
      setPassError('')
    }
    setInvalidPassword(false)
  }

  const handleCheckPassword = () => {
    if (!validPassword(password)) {
      setInvalidPassword(true)
    }
  }

  const handleConfirmChange = (e) => {
    const { value } = e.target
    setConfirmPassword(value)
    if (value !== '' && value !== password && password !== '') {
      setPassError('Confirm password does not match password')
    } else {
      setPassError('')
    }
    setInvalidPassword(false)
  }

  const handleTogglePassword = () => {
    setShowPassword(!showPassword)
  }

  const handleToggleConfirm = () => {
    setShowConfPassword(!showConfPassword)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setIsLoading(true)
    axios
      .post(`${resetURL}`, { user: { email } })
      .then((response) => {
        console.log('response', response)
        const { status } = response
        if (status === 201) {
          setIsLoading(false)
          setSuccess(true)
          toast({ description: 'Email sent successfully 👍', status: 'success', position: 'top', duration: 3000 })
          setError('')
        }
      })
      .catch((error) => {
        setIsLoading(false)
        console.log(`Error: ${error}`)
        if (error.response) {
          const { status, data } = error.response
          if (status === 422) {
            setSuccess(false)
            setError(data?.errors?.email)
          } else if (status === 404) {
            setSuccess(false)
            setError(`Internal routing error. Please try again`)
          }
        }
      })
  }

  const handleReset = (e) => {
    e.preventDefault()
    setIsLoading(true)
    axios
      .put(`${resetURL}`, { user: { reset_password_token: token, password: password, password_confirmation: confirmPassword } })
      .then((response) => {
        console.log('response', response)
        const { status } = response
        if (status === 204) {
          setIsLoading(false)
          toast({ description: 'Password changed successfully 👍', status: 'success', position: 'top', duration: 3000 })
          navigate('/auth')
        }
      })
      .catch((error) => {
        console.log(`Error: ${JSON.stringify(error)}`)
        setIsLoading(false)
      })
  }

  if (success) {
    return (
      <Flex my={10} gap={4} direction={'column'} alignItems={'center'} justifyContent={'center'}>
        <Text fontSize={'xl'} textAlign={'center'} fontWeight={'medium'}>Check your email</Text>
        <Text fontSize={'sm'} textAlign={'center'} color={'#555'}>
          Thanks! If <strong>{email}</strong> matches an email we have on file,
          then we've sent you an email containing further instructions for
          resetting your password.
        </Text>
        <Text fontSize={'sm'} textAlign={'center'} color={'#555'}>
          If you haven't received an email in 5 minutes, check your{' '}
          <strong>spam</strong> or try a <strong>different email</strong>.
        </Text>
      </Flex>
    )
  }

  if (token) {
    return (
      <Flex mt={10} gap={4} direction={'column'} alignItems={'center'} justifyContent={'center'}>
        <Text fontSize={'xl'} textAlign={'center'} fontWeight={'medium'}>Reset your password</Text>
        <form style={{ width: '100%' }} onSubmit={handleReset}>
          <Stack py={'1rem'} direction={'column'} gap={4} width={'100%'}>
            {/* PASSWORD */}
            <FormControl isRequired>
              <FormLabel htmlFor='password'>New password</FormLabel>
              <InputGroup>
                <Input type={showPassword ? 'text' : 'password'} value={password} onChange={handlePasswordChange} placeholder='*******' onBlur={handleCheckPassword} />
                <InputRightElement width='3.1rem'>
                  <IconButton h='1.75rem' size='sm' bg={'transparent'} onClick={handleTogglePassword} icon={showPassword ? <ViewOffIcon /> : <ViewIcon />} />
                </InputRightElement>
              </InputGroup>
              {invalidPassword && (
                <FormHelperText color={'red.500'}>
                  <Text mb={1}>Your password must contain:</Text>
                  <Text>1. Lower case letters {`(a-z)`}</Text>
                  <Text>2. Upper case letters {`(A-Z)`}</Text>
                  <Text>3. Special characters {`(ex. !@#&$%*)`}</Text>
                  <Text>4. Numbers {`(0-9)`}</Text>
                </FormHelperText>
              )}
            </FormControl>
            {/* CONFIRM PASSWORD */}
            <FormControl mt={3} isRequired isInvalid={passError !== ''}>
              <FormLabel htmlFor='ConfirmPassword'>Confirm your password</FormLabel>
              <InputGroup>
                <Input type={showConfPassword ? 'text' : 'password'} value={confirmPassword} onChange={handleConfirmChange} isDisabled={!validPassword(password)} placeholder='*******'/>
                <InputRightElement width='3.1rem'>
                  <IconButton h='1.75rem' size='sm' bg={'transparent'} onClick={handleToggleConfirm} icon={showConfPassword ? <ViewOffIcon /> : <ViewIcon />} />
                </InputRightElement>
              </InputGroup>
              {passError !== '' && <FormErrorMessage>{passError}</FormErrorMessage>}
            </FormControl>
            <Button width='full' colorScheme='blue' type='submit' isLoading={isLoading} isDisabled={ passError !== '' || invalidPassword || password === '' || confirmPassword === ''}>
              Submit
            </Button>
          </Stack>
        </form>
      </Flex>
    )
  }

  return (
    <Flex mt={10} gap={4} direction={'column'} alignItems={'center'} justifyContent={'center'}>
      <Text fontSize={'xl'} textAlign={'center'} fontWeight={'medium'}>Reset your password</Text>
      <Text fontSize={'sm'} textAlign={'center'} color={'#555'}>
        Enter the email address associated with your account and we'll send you
        a link to reset your password.
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
        <Stack py={'1rem'} direction={'column'} gap={4} width={'100%'}>
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
          <Button width='full' colorScheme='blue' type='submit' isLoading={isLoading} isDisabled={email === ''}>
            Continue
          </Button>
          <Link to={'/auth'}>
            <Text fontSize='sm' color='blue.500' fontWeight={'medium'} textAlign={'center'}>
              Return to sign in
            </Text>
          </Link>
        </Stack>
      </form>
    </Flex>
  )
}

export default ResetForm
