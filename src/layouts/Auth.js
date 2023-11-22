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
import { useHistory } from 'react-router-dom'
import Cookies from 'js-cookie'
import { InterlynkLogo } from 'components/Icons/Icons'
import DashboardBg from 'assets/img/dashboard.png'
import axios from 'axios'
import { useState, useRef } from 'react'

export default function Auth() {
  const history = useHistory()
  const navRef = useRef()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const loginURL = process.env.REACT_APP_VENDOR_LOGIN_URL

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
          console.log('status', status)
          localStorage.setItem('username', status.data.user.name)
          localStorage.setItem('email', status.data.user.email)
          Cookies.set('authToken', response.headers.authorization)
          history.push('/vendor/dashboard')
        }
      })
      .catch((error) => {
        console.log(`Error: ${error}`)
        if (error.response) {
          const { status } = error.response
          console.log('Status code:', status)
          if (status === 401) {
            setError(`Invalid email or password`)
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
                </Stack>
              </form>
            </Flex>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  )
}
