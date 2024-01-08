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
  Image,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalOverlay,
  Stack,
  Text
} from '@chakra-ui/react'
// core components
import { Link, useNavigate, useLocation } from 'react-router-dom'
import Cookies from 'js-cookie'
import { InterlynkLogo } from 'components/Icons/Icons'
import DashboardBg from 'assets/img/dashboard.png'
import axios from 'axios'
import { useState, useRef, useEffect } from 'react'

export default function Auth() {
  const navigate = useNavigate()
  const location = useLocation()
  const navRef = useRef()

  const queryParams = new URLSearchParams(location.search)
  const emailId = queryParams.get('id')

  const [email, setEmail] = useState(emailId ? emailId : '')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const loginURL = process.env.REACT_APP_VENDOR_LOGIN_URL

  const authToken = Cookies.get('authToken')

  useEffect(() => {
    if (authToken) {
      navigate('/vendor/dashboard')
    }
  }, [])

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
          localStorage.removeItem('product')
          localStorage.setItem('username', status.data.user.name)
          localStorage.setItem('email', status.data.user.email)
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
        setEmail('')
        setPassword('')
      })
  }

  return (
    <Box ref={navRef} w='100%' height={'100vh'} position={'relative'}>
      <Image
        src={DashboardBg}
        width={'100%'}
        height={'100%'}
        pos={'absolute'}
      />
      <Modal isCentered size={'sm'} isOpen={true}>
        <ModalOverlay bg='blackAlpha.300' backdropFilter='blur(4px)' />
        <ModalContent>
          <ModalBody py={8}>
            <Flex
              width={'100%'}
              alignItems={'center'}
              justifyContent={'center'}
            >
              <InterlynkLogo w='40px' h='40px' me='5px' />
              <Text fontSize={'3xl'} fontWeight={600} mt={2}>
                Interlynk
              </Text>
            </Flex>
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
                <Stack
                  py={'1rem'}
                  direction={'column'}
                  gap={4}
                  width={'100%'}
                  mt={4}
                >
                  <FormControl>
                    <FormLabel htmlFor='email'>Email address</FormLabel>
                    <Input
                      type='email'
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder='abc@example.com'
                      autoComplete='off'
                      isDisabled={emailId}
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
                  <Button
                    width='full'
                    colorScheme='blue'
                    type='submit'
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
                    <Link to={'/register'}>
                      <Text
                        fontSize='sm'
                        color='blue.500'
                        fontWeight={'medium'}
                      >
                        Register
                      </Text>
                    </Link>
                  </Stack>
                </Stack>
              </form>
            </Flex>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  )
}
