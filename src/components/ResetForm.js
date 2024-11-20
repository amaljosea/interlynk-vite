import axios from 'axios'
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { validPassword } from 'utils'

import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons'
import {
  Box,
  Button,
  Flex,
  IconButton,
  Stack,
  Text,
  chakra
} from '@chakra-ui/react'
import { Input, InputGroup, InputRightElement } from '@chakra-ui/react'
import {
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel
} from '@chakra-ui/react'

import useCustomToast from 'hooks/useCustomToast'
import useQueryParam from 'hooks/useQueryParam'
import { useThemeColor } from 'hooks/useThemeColors'

import LynkAlert from './LynkAlert'

const ResetForm = () => {
  const navigate = useNavigate()
  const { showToast } = useCustomToast()
  const emailId = useQueryParam('id')
  const token = useQueryParam('reset_password_token')

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

  const { primaryErrorColor, primaryBlueText, headingTextColor } =
    useThemeColor(['primaryErrorColor', 'primaryBlueText', 'headingTextColor'])

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
        const { status } = response
        if (status === 201) {
          setIsLoading(false)
          setSuccess(true)
          showToast({
            description: 'Email sent successfully 👍',
            status: 'success'
          })
          setError('')
        }
      })
      .catch((error) => {
        setIsLoading(false)
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
      .put(`${resetURL}`, {
        user: {
          reset_password_token: token,
          password: password,
          password_confirmation: confirmPassword
        }
      })
      .then((response) => {
        const { status } = response
        if (status === 204) {
          setIsLoading(false)
          showToast({
            description: 'Password changed successfully 👍',
            status: 'success'
          })
          navigate('/auth')
        }
      })
      .catch((error) => {
        showToast({
          description:
            error?.response?.data?.errors?.reset_password_token ||
            error?.response?.data?.errors,
          status: 'error'
        })
        setIsLoading(false)
      })
  }

  const handleChange = () => {
    setEmail('')
    setSuccess(false)
  }

  if (success) {
    return (
      <Flex
        my={10}
        gap={4}
        direction={'column'}
        alignItems={'center'}
        justifyContent={'center'}
      >
        <Text fontSize={'xl'} textAlign={'center'} fontWeight={'medium'}>
          Check your email
        </Text>
        <Text fontSize={'sm'} textAlign={'center'} color={headingTextColor}>
          Thanks! If <chakra.span fontWeight={'medium'}>{email}</chakra.span>{' '}
          matches an email we have on file, then we have sent you an email
          containing further instructions for resetting your password.
        </Text>
        <Text fontSize={'sm'} textAlign={'center'} color={headingTextColor}>
          If you have not received an email in 5 minutes, check your spam or{' '}
          <chakra.span
            color={primaryBlueText}
            cursor={'pointer'}
            fontWeight={'medium'}
            onClick={handleChange}
          >
            try a different email.
          </chakra.span>
        </Text>
      </Flex>
    )
  }

  if (token) {
    return (
      <Flex
        mt={10}
        gap={4}
        width={'100%'}
        direction={'column'}
        alignItems={'flex-start'}
        justifyContent={'center'}
      >
        <Text fontSize={'xl'} fontWeight={'medium'}>
          Reset your password
        </Text>
        <form style={{ width: '100%' }} onSubmit={handleReset}>
          <Stack py={'1rem'} direction={'column'} gap={4} width={'100%'}>
            {/* PASSWORD */}
            <FormControl isRequired>
              <FormLabel htmlFor='password'>New password</FormLabel>
              <InputGroup>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={handlePasswordChange}
                  placeholder='*******'
                  onBlur={handleCheckPassword}
                />
                <InputRightElement width='3.1rem'>
                  <IconButton
                    h='1.75rem'
                    size='sm'
                    bg={'transparent'}
                    onClick={handleTogglePassword}
                    icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                  />
                </InputRightElement>
              </InputGroup>
              {invalidPassword && (
                <FormHelperText color={primaryErrorColor}>
                  <Text mb={1}>
                    Your password must be 8-16 characters contain:
                  </Text>
                  <Text>1. Lower case letters {`(a-z)`}</Text>
                  <Text>2. Upper case letters {`(A-Z)`}</Text>
                  <Text>3. Special characters {`(ex. !@#&$%*)`}</Text>
                  <Text>4. Numbers {`(0-9)`}</Text>
                </FormHelperText>
              )}
            </FormControl>
            {/* CONFIRM PASSWORD */}
            <FormControl mt={3} isRequired isInvalid={passError !== ''}>
              <FormLabel htmlFor='ConfirmPassword'>
                Confirm your password
              </FormLabel>
              <InputGroup>
                <Input
                  type={showConfPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={handleConfirmChange}
                  isDisabled={!validPassword(password)}
                  placeholder='*******'
                />
                <InputRightElement width='3.1rem'>
                  <IconButton
                    h='1.75rem'
                    size='sm'
                    bg={'transparent'}
                    onClick={handleToggleConfirm}
                    icon={showConfPassword ? <ViewOffIcon /> : <ViewIcon />}
                  />
                </InputRightElement>
              </InputGroup>
              {passError !== '' && (
                <FormErrorMessage>{passError}</FormErrorMessage>
              )}
            </FormControl>
            <Button
              width='full'
              type='submit'
              title='Submit'
              colorScheme='blue'
              isLoading={isLoading}
              isDisabled={
                passError !== '' ||
                invalidPassword ||
                password === '' ||
                confirmPassword === ''
              }
            >
              Submit
            </Button>
          </Stack>
        </form>
      </Flex>
    )
  }

  return (
    <Flex
      gap={4}
      mt={[6, 8, 10]}
      direction={'column'}
      alignItems={'flex-start'}
      justifyContent={'center'}
    >
      <Text fontSize={'20px'} fontWeight={'semibold'}>
        Reset your password
      </Text>
      <Text fontSize={'sm'} color={headingTextColor}>
        Enter the email address associated with your account and we will send
        you a link to reset your password.
      </Text>
      {error !== '' && (
        <Box mt={4} width={'100%'}>
          <LynkAlert msg={error} />
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
          <Button
            width='full'
            type='submit'
            title='submit'
            colorScheme='blue'
            isLoading={isLoading}
            isDisabled={email === ''}
          >
            Continue
          </Button>
          <Text fontSize='sm' fontWeight={'medium'} textAlign={'center'}>
            Return to
            <Link to={'/auth'} style={{ color: primaryBlueText }}>
              {' '}
              Login
            </Link>
          </Text>
        </Stack>
      </form>
    </Flex>
  )
}

export default ResetForm
