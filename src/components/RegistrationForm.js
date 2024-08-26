import { useMutation } from '@apollo/client'
import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { validPassword, validateEmail } from 'utils'

import { CheckCircleIcon, ViewIcon, ViewOffIcon } from '@chakra-ui/icons'
import {
  Alert,
  AlertDescription,
  AlertIcon,
  Box,
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Icon,
  IconButton,
  Input,
  InputGroup,
  InputRightElement,
  Stack,
  Text
} from '@chakra-ui/react'

import useQueryParam from 'hooks/useQueryParam'

import { RegisterUser } from 'graphQL/Mutation'

const RegistrationForm = () => {
  const navigate = useNavigate()
  const emailId = useQueryParam('id')
  const awsToken = useQueryParam('aws_marketplace_token')

  const [name, setName] = useState('')
  const [email, setEmail] = useState(emailId?.replace(/\s+/g, '+') || '')
  const [emailError, setEmailError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showConfPassword, setShowConfPassword] = useState(false)
  const [error, setError] = useState([])
  const [invalidPassword, setInvalidPassword] = useState(false)
  const [passError, setPassError] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const [orgRegister] = useMutation(RegisterUser)

  const isInvalid =
    email === '' ||
    password === '' ||
    confirmPassword === '' ||
    emailError !== '' ||
    password !== confirmPassword

  const handleCheckEmail = () => {
    if (!validateEmail(email)) {
      setEmailError('Email is invalid')
    }
  }

  const handlePasswordChange = (e) => {
    const { value } = e.target
    setPassword(value)
    if (value !== '' && value !== confirmPassword && confirmPassword !== '') {
      setPassError('Confirm password does not match password')
    } else {
      setPassError('')
    }
    setInvalidPassword(false)
    setError([])
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
    setError([])
  }

  const handleTogglePassword = () => {
    setShowPassword(!showPassword)
  }

  const handleToggleConfirm = () => {
    setShowConfPassword(!showConfPassword)
  }

  const handleSubmit = () => {
    setIsLoading(true)
    orgRegister({
      variables: {
        name: name,
        email: email,
        password: password,
        passwordConfirmation: confirmPassword,
        awsRegistrationToken: awsToken || undefined
      }
    }).then((res) => {
      if (res.data.userRegistration.errors.length > 0) {
        setError(res.data.userRegistration.errors)
        awsToken && sessionStorage.setItem('awsToken', awsToken)
        setIsLoading(false)
        setIsSuccess(false)
      } else {
        if (res.data.userRegistration.confirmationNeeded) {
          setIsSuccess(true)
          setIsLoading(false)
        } else {
          navigate('/auth')
        }
      }
    })
  }

  if (isSuccess) {
    return (
      <Flex
        mt={2}
        direction={'column'}
        alignItems={'center'}
        justifyContent={'center'}
      >
        <Icon mt={5} color={'green.400'} boxSize={16} as={CheckCircleIcon} />
        <Text fontSize={'lg'} textAlign={'center'} mt={4}>
          Registration Successful
        </Text>
        <Text fontSize={'sm'} textAlign={'center'} color={'#555'}>
          Please check your email to confirm your account or{' '}
          <Link to='/auth' style={{ color: '#3182CE' }}>
            click here{' '}
          </Link>{' '}
          to login.
        </Text>
      </Flex>
    )
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
        Register to continue to the dashboard.
      </Text>
      {error.length > 0 && (
        <Box mt={4} width={'100%'}>
          <Alert status='error' borderRadius={4}>
            <AlertIcon />
            <AlertDescription>
              {error.map((item, index) => (
                <Text fontSize={'sm'} key={index}>
                  {item}
                </Text>
              ))}
            </AlertDescription>
          </Alert>
        </Box>
      )}

      <Stack py={'1rem'} direction={'column'} gap={2} width={'100%'}>
        {/* NAME */}
        <FormControl>
          <FormLabel htmlFor='organization'>Name</FormLabel>
          <Input
            type='text'
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder='Enter name'
            autoComplete='off'
          />
        </FormControl>
        {/* EMAIL */}
        <FormControl isRequired isInvalid={emailError !== ''}>
          <FormLabel htmlFor='email'>Email address</FormLabel>
          <Input
            type='email'
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              setEmailError('')
              setError([])
            }}
            placeholder='Enter email address'
            autoComplete='off'
            onBlur={handleCheckEmail}
            isReadOnly={emailId}
            disabled={emailId ? true : false}
          />
          {emailError !== '' && (
            <FormErrorMessage>{emailError}</FormErrorMessage>
          )}
        </FormControl>
        {/* PASSWORD */}
        <FormControl isRequired>
          <FormLabel htmlFor='password'>Password</FormLabel>
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
            <FormHelperText color={'red.500'}>
              <Text mb={1}>Your password must be 8-16 characters contain:</Text>
              <Text>1. Lower case letters {`(a-z)`}</Text>
              <Text>2. Upper case letters {`(A-Z)`}</Text>
              <Text>3. Special characters {`(ex. !@#&$%*)`}</Text>
              <Text>4. Numbers {`(0-9)`}</Text>
            </FormHelperText>
          )}
        </FormControl>
        {/* CONFIRM PASSWORD */}
        <FormControl mt={3} isRequired isInvalid={passError !== ''}>
          <FormLabel htmlFor='ConfirmPassword'>Confirm Password</FormLabel>
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
          {passError !== '' && <FormErrorMessage>{passError}</FormErrorMessage>}
        </FormControl>
        <Button
          width='full'
          mt={5}
          onClick={handleSubmit}
          colorScheme='blue'
          disabled={isInvalid || isLoading}
          isLoading={isLoading}
          loadingText='Submitting'
        >
          Register
        </Button>
        <Stack
          mt={4}
          alignItems={'center'}
          justifyContent={'center'}
          direction={'row'}
          spacing={2}
        >
          <Text fontSize={'sm'}>{`Already have an account ?`}</Text>
          <Link to={'/auth'}>
            <Text fontSize='sm' color='blue.500' fontWeight={'medium'}>
              Login
            </Text>
          </Link>
        </Stack>
      </Stack>
    </Flex>
  )
}

export default RegistrationForm
