import { useMutation } from '@apollo/client'
import DOMPurify from 'dompurify'
import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  nameValidation,
  validPassword,
  validateEmail
} from 'utils/formValidationUtils'

import { CheckCircleIcon } from '@chakra-ui/icons'
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Icon,
  Input,
  InputGroup,
  InputRightElement,
  Stack,
  Text
} from '@chakra-ui/react'

import useCustomToast from 'hooks/useCustomToast'
import { useDebounce } from 'hooks/useDebounce'
import useQueryParam from 'hooks/useQueryParam'
import { useThemeColor } from 'hooks/useThemeColors'

import { RegisterUser } from 'graphQL/Mutation'

import DividerWithText from './DividerWithText'
import LynkAlert from './LynkAlert'
import ToggleVisibilityButton from './Misc/ToggleVisibilityButton'
import PolicyTerms from './PolicyTerms'
import SocialLogin from './SocialLogin'

const RegistrationForm = () => {
  const navigate = useNavigate()
  const emailId = useQueryParam('id')
  const { showToast } = useCustomToast()
  const awsToken = useQueryParam('aws_marketplace_token')
  const {
    primaryBlueText,
    primaryErrorColor,
    primarySuccessColor,
    headingTextColor
  } = useThemeColor([
    'primaryBlueText',
    'primaryErrorColor',
    'primarySuccessColor',
    'headingTextColor'
  ])
  const [name, setName] = useState('')
  const [email, setEmail] = useState(emailId?.replace(/\s+/g, '+') || '')
  const [emailError, setEmailError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showConfPassword, setShowConfPassword] = useState(false)
  const [error, setError] = useState('')
  const [invalidPassword, setInvalidPassword] = useState(false)
  const [passError, setPassError] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)
  const [nameError, setNameError] = useState('')

  const [orgRegister, { loading }] = useMutation(RegisterUser)

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
    setError('')
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
    setError('')
  }

  const handleTogglePassword = () => {
    setShowPassword(!showPassword)
  }

  const handleToggleConfirm = () => {
    setShowConfPassword(!showConfPassword)
  }

  const handleSubmit = () => {
    try {
      orgRegister({
        variables: {
          name: name,
          email: email,
          password: password,
          passwordConfirmation: confirmPassword,
          awsRegistrationToken: awsToken || undefined
        }
      }).then((res) => {
        if (res?.data?.userRegistration?.errors?.length > 0) {
          setError(res?.data?.userRegistration?.errors[0])
          awsToken && sessionStorage.setItem('awsToken', awsToken)
          setIsSuccess(false)
        } else {
          showToast({
            status: 'success',
            description: `Registration successful`
          })
          // Trigger Google Tag for Sign-up tracking
          if (window.gtag) {
            window.gtag('event', 'conversion', {
              send_to: 'AW-16659732873/gm2GCKLthOgZEImz_Yc-',
              event_category: 'user_registration',
              event_label: 'User Registration Completion'
            })
          } else {
            console.warn('Google Tag Manager is not loaded yet.')
          }
          if (res.data.userRegistration.confirmationNeeded) {
            setIsSuccess(true)
          } else {
            navigate('/auth')
          }
        }
      })
    } catch (error) {
      setError(JSON.stringify(error))
    }
  }

  // Debounce the name input to avoid throwing the error as soon as user starts typing in
  const debouncedName = useDebounce(name, 2000)

  // Validate the debounced value
  useEffect(() => {
    if (debouncedName.length > 0 && debouncedName.length < 2) {
      if (debouncedName.length < 2) {
        setNameError('Input must be between 2 and 256 characters')
      } else {
        setNameError('')
      }
    }
  }, [debouncedName])

  // Handle name input change
  const handleNameChange = (e) => {
    const { value } = e.target
    const sanitizedValue = DOMPurify.sanitize(value)
    setName(sanitizedValue)
    if (value.length > 256) {
      setNameError('Input must be between 2 and 256 characters')
    } else if (value.startsWith(' ')) {
      setNameError('A name must begin with a letter')
    } else if (!nameValidation.test(value) && value.length > 0) {
      setNameError(
        'Only letters, numbers, spaces, dashes, and underscores are allowed'
      )
    } else {
      setNameError('')
    }
  }

  if (isSuccess) {
    return (
      <Flex
        gap={10}
        direction={'column'}
        alignItems={'center'}
        justifyContent={'center'}
      >
        <Icon color={primarySuccessColor} boxSize={16} as={CheckCircleIcon} />
        <Stack spacing={1}>
          <Text fontSize={'20px'} fontWeight={'semibold'} textAlign={'center'}>
            Registration Successful
          </Text>
          <Text fontSize={'sm'} textAlign={'center'} color={headingTextColor}>
            Please check your email to confirm your account
          </Text>
        </Stack>
        <Text fontSize='sm' fontWeight={'medium'} textAlign={'center'}>
          Return to{' '}
          <Link to={'/auth'} style={{ color: primaryBlueText }}>
            Login
          </Link>
        </Text>
      </Flex>
    )
  }

  return (
    <Flex
      height={'100%'}
      mt={[4, 6, 8, 24]}
      direction={'column'}
      alignItems={'flex-start'}
    >
      <Text fontSize={'20px'} fontWeight={'semibold'} textAlign={'center'}>
        Welcome
      </Text>
      <Text fontSize={'sm'} color={headingTextColor}>
        Register to continue to the dashboard.
      </Text>
      {error !== '' && (
        <Box mt={4} width={'100%'}>
          <LynkAlert msg={error} />
        </Box>
      )}
      <Stack pt={8} direction={'column'} gap={3} width={'100%'}>
        {/* NAME */}
        <FormControl isInvalid={nameError !== ''}>
          <FormLabel htmlFor='organization'>Name</FormLabel>
          <Input
            type='text'
            value={name}
            onChange={handleNameChange}
            placeholder='Enter name'
            autoComplete='off'
          />
          {nameError !== '' && <FormErrorMessage>{nameError}</FormErrorMessage>}
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
              setError('')
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
              <ToggleVisibilityButton
                bg={'transparent'}
                showPassword={showPassword}
                onClick={handleTogglePassword}
              />
            </InputRightElement>
          </InputGroup>
          {invalidPassword && (
            <FormHelperText fontSize={'12px'} color={primaryErrorColor}>
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
              <ToggleVisibilityButton
                bg={'transparent'}
                showPassword={showConfPassword}
                onClick={handleToggleConfirm}
              />
            </InputRightElement>
          </InputGroup>
          {passError !== '' && (
            <FormErrorMessage fontSize={'12px'}>{passError}</FormErrorMessage>
          )}
        </FormControl>
        <Button
          mt={5}
          width='full'
          title='Register'
          colorScheme='blue'
          isLoading={loading}
          onClick={handleSubmit}
          loadingText='Submitting'
          disabled={
            isInvalid || loading || error || nameError || name.length === 1
          }
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
            <Text fontSize='sm' color={primaryBlueText} fontWeight={'medium'}>
              Login
            </Text>
          </Link>
        </Stack>
        <DividerWithText text='Or Register With' />
        <SocialLogin />
        <PolicyTerms />
      </Stack>
    </Flex>
  )
}

export default RegistrationForm
