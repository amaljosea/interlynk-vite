// chakra imports
import {
  Alert,
  AlertDescription,
  AlertIcon,
  Box,
  Button,
  ChakraProvider,
  Flex,
  FormControl,
  Image,
  Input,
  Text
} from '@chakra-ui/react'
// core components
import { Redirect, Route } from 'react-router-dom'
import Cookies from 'js-cookie'
import theme from 'theme/theme.js'
import { InterlynkLogo } from 'components/Icons/Icons'
import axios from 'axios'
import { useContext, useState } from 'react'
import GlobalContext from 'context/GlobalContext'

// import { getActiveNavbar, getActiveRoute } from '../utils'

export default function Pages(props) {
  const { isAuthenticate, setIsAuthenticate } = useContext(GlobalContext)

  const getRoutes = (routes) => {
    return routes.map((prop, key) => {
      console.log('Prop: ' + prop + ' Key: ' + key)
      if (prop.collapse) {
        return getRoutes(prop.views)
      }
      if (prop.category === 'account') {
        return getRoutes(prop.views)
      }
      if (prop.layout === '/auth') {
        return (
          <Route
            path={prop.layout + prop.path}
            component={prop.component}
            key={key}
          />
        )
      } else {
        return null
      }
    })
  }

  const navRef = React.useRef()
  document.documentElement.dir = 'ltr'

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
        // console.log('response', response)
        const { status } = response.data
        if (status.code === 200) {
          setEmail('')
          setPassword('')
          localStorage.setItem('username', status.data.user.name)
          localStorage.setItem('email', status.data.user.email)
          Cookies.set('authToken', response.headers.authorization, {
            expires: 1
          })
          setIsAuthenticate(true)
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

  if (isAuthenticate || localStorage.getItem(`username`)) {
    return <Redirect to={'/vendor/dashboard'} />
  } else {
    return (
      <ChakraProvider theme={theme} resetCss={false} w='100%'>
        <Box ref={navRef} w='100%' position={'relative'}>
          <Image
            src='https://i.ibb.co/Xzn16F3/dashboard.png'
            width={'100%'}
            pos={'absolute'}
          />
          <Box
            w='100%'
            h='100vh'
            backdropFilter='auto'
            backdropBlur='6px'
            as={Flex}
            alignItems={'center'}
            justifyContent={'center'}
          >
            <Flex
              width={'450px'}
              px={8}
              py={10}
              rounded={'lg'}
              bg={'white'}
              gap={5}
              boxShadow={'2xl'}
              direction={'column'}
            >
              <Flex
                width={'100%'}
                alignItems={'center'}
                justifyContent={'center'}
              >
                <InterlynkLogo w='40px' h='40px' me='10px' />
                <Text fontSize={'3xl'} fontWeight={600}>
                  Interlynk
                </Text>
              </Flex>
              <Flex
                direction={'column'}
                gap={2}
                alignItems={'center'}
                justifyContent={'center'}
              >
                <Text fontSize={'lg'} textAlign={'center'}>
                  Welcome
                </Text>
                <Text fontSize={'sm'} textAlign={'center'}>
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
                <form
                  style={{ width: '100%', padding: '1rem 0' }}
                  onSubmit={handleSubmit}
                >
                  <FormControl isRequired>
                    <Input
                      type='email'
                      size='lg'
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder='Email address'
                    />
                  </FormControl>
                  <FormControl mt={3} isRequired>
                    <Input
                      type='password'
                      size='lg'
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder='*******'
                    />
                  </FormControl>
                  <Button
                    width='full'
                    size='lg'
                    mt={4}
                    type='submit'
                    colorScheme='blue'
                  >
                    Log in
                  </Button>
                </form>
                {/* <Flex gap={2} alignItems={'center'}>
                <Text>Don't have an account ?</Text>
                <Link to={'#'}>
                  <Text color={'blue.500'}>Sign up</Text>
                </Link>
              </Flex>
              <Flex width={'100%'} alignItems={'center'} gap={4} py={3}>
                <Box width={'100%'} height={0.5} bg={'blackAlpha.200'}></Box>
                <Text>OR</Text>
                <Box width={'100%'} height={0.5} bg={'blackAlpha.200'}></Box>
              </Flex>
              <Flex
                direction={'column'}
                width={'100%'}
                alignItems={'center'}
                gap={4}
                py={3}
              >
                <Flex
                  cursor={'pointer'}
                  bg={'blackAlpha.50'}
                  rounded={'lg'}
                  fontWeight={'medium'}
                  alignItems={'center'}
                  gap={3}
                  width={'100%'}
                  p={4}
                >
                  <Image
                    width='6'
                    height='6'
                    src='https://img.icons8.com/fluency/48/google-logo.png'
                    alt='google-logo'
                  />
                  <Text>Continue with Google</Text>
                </Flex>
                <Flex
                  cursor={'pointer'}
                  bg={'blackAlpha.50'}
                  rounded={'lg'}
                  fontWeight={'medium'}
                  alignItems={'center'}
                  gap={3}
                  width={'100%'}
                  p={4}
                >
                  <Image
                    width='6'
                    height='6'
                    src='https://img.icons8.com/fluency/48/github.png'
                    alt='github'
                  />
                  <Text>Continue with Github</Text>
                </Flex>
              </Flex> */}
              </Flex>
            </Flex>
          </Box>
          {/* <Portal containerRef={navRef}>
        <AuthNavbar secondary={getActiveNavbar(routes)} logoText='Interlynk DASHBOARD' />
      </Portal>
      <Box w='100%'>
        <Box ref={wrapper} w='100%'>
          <Switch>
            {getRoutes(routes)}
            <Redirect from='/auth' to='/auth/login-page' />
          </Switch>
        </Box>
      </Box>
      <Box px='24px' mx='auto' width='1044px' maxW='100%'>
        <Footer />
      </Box> */}
        </Box>
      </ChakraProvider>
    )
  }
}
