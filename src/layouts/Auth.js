// chakra imports
import {
  Alert,
  AlertDescription,
  AlertIcon,
  Box,
  Button,
  Center,
  ChakraProvider,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Image,
  Input,
  Portal,
  Text
} from '@chakra-ui/react'
import Footer from 'components/Footer/Footer.js'
// core components
import AuthNavbar from 'components/Navbars/AuthNavbar.js'
import React from 'react'
import { Link, Redirect, Route } from 'react-router-dom'
import routes from 'routes.js'
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'
import theme from 'theme/theme.js'
import { InterlynkLogo } from 'components/Icons/Icons'
import { useState } from 'react'

export default function Pages(props) {
  const { ...rest } = props
  // ref for the wrapper div
  const wrapper = React.createRef()
  React.useEffect(() => {
    document.body.style.overflow = 'unset'
    // Specify how to clean up after this effect:
    return function cleanup() {}
  })
  const getActiveRoute = (routes) => {
    let activeRoute = 'Default Brand Text'
    for (let i = 0; i < routes.length; i++) {
      if (routes[i].collapse) {
        let collapseActiveRoute = getActiveRoute(routes[i].views)
        if (collapseActiveRoute !== activeRoute) {
          return collapseActiveRoute
        }
      } else if (routes[i].category) {
        let categoryActiveRoute = getActiveRoute(routes[i].views)
        if (categoryActiveRoute !== activeRoute) {
          return categoryActiveRoute
        }
      } else {
        if (
          window.location.href.indexOf(routes[i].layout + routes[i].path) !== -1
        ) {
          return routes[i].name
        }
      }
    }
    return activeRoute
  }
  const getActiveNavbar = (routes) => {
    let activeNavbar = false
    for (let i = 0; i < routes.length; i++) {
      if (routes[i].category) {
        let categoryActiveNavbar = getActiveNavbar(routes[i].views)
        if (categoryActiveNavbar !== activeNavbar) {
          return categoryActiveNavbar
        }
      } else {
        if (
          window.location.href.indexOf(routes[i].layout + routes[i].path) !== -1
        ) {
          if (routes[i].secondaryNavbar) {
            return routes[i].secondaryNavbar
          }
        }
      }
    }
    return activeNavbar
  }
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
  const [error, setError] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (email === 'demo@interlynk.io' && password === 'demointerlynk0719') {
      setEmail('')
      setPassword('')
      setIsLoggedIn(true)
    } else {
      setError(true)
      setEmail('')
      setPassword('')
    }
  }

  if (isLoggedIn === true) {
    return <Redirect to={'/admin/dashboard'} />
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
                <InterlynkLogo w='48px' h='48px' me='10px' />
                <Heading fontSize={'3xl'}>Interlynk</Heading>
              </Flex>
              <Flex
                direction={'column'}
                gap={2}
                alignItems={'center'}
                justifyContent={'center'}
              >
                <Text fontSize={'xl'} textAlign={'center'}>
                  Welcome
                </Text>
                <Text fontSize={'base'} textAlign={'center'}>
                  Log in to Interlynk to continue to the dashboard.
                </Text>
                {error === true && (
                  <Box mt={4} width={'100%'}>
                    <Alert status='error' borderRadius={4}>
                      <AlertIcon />
                      <AlertDescription>
                        Invalid username or password
                      </AlertDescription>
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
                    Continue
                  </Button>
                </form>
                <Flex gap={2} alignItems={'center'}>
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
                </Flex>
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
