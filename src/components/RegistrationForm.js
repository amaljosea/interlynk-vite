import React, { useState } from 'react'
// chakra imports
import {
  Alert,
  AlertDescription,
  AlertIcon,
  Box,
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Stack,
  Text
} from '@chakra-ui/react'
import { RegisterUser } from 'graphQL/Mutation'
import { useMutation } from '@apollo/client'
import { Link, useNavigate } from 'react-router-dom'
import { validateEmail } from 'utils'

const RegistrationForm = () => {
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState([])
  const [passError, setPassError] = useState('')

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

  const handleCheckPassword = () => {
    if (confirmPassword !== '' && confirmPassword !== password) {
      setPassError('Confirm password does not match password')
    }
  }

  const handleSubmit = () => {
    orgRegister({
      variables: {
        name: name,
        email: email,
        password: password,
        passwordConfirmation: confirmPassword
      }
    }).then((res) => {
      if (res.data.userRegistration.errors.length > 0) {
        setError(res.data.userRegistration.errors)
      } else {
        navigate('/auth')
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

      <Stack py={'1rem'} direction={'column'} gap={2} width={'100%'} mt={4}>
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
          />
          {emailError !== '' && (
            <FormErrorMessage>{emailError}</FormErrorMessage>
          )}
        </FormControl>
        <FormControl isRequired>
          <FormLabel htmlFor='password'>Password</FormLabel>
          <Input
            type='password'
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              setPassError('')
              setError([])
            }}
            placeholder='*******'
            onBlur={handleCheckPassword}
          />
        </FormControl>
        <FormControl mt={3} isRequired isInvalid={passError !== ''}>
          <FormLabel htmlFor='ConfirmPassword'>Confirm Password</FormLabel>
          <Input
            type='password'
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value)
              setPassError('')
              setError([])
            }}
            placeholder='*******'
            onBlur={handleCheckPassword}
          />
          {passError !== '' && <FormErrorMessage>{passError}</FormErrorMessage>}
        </FormControl>
        <Button
          width='full'
          mt={5}
          onClick={handleSubmit}
          colorScheme='blue'
          disabled={isInvalid}
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
