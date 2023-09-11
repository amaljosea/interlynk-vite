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

import { Route } from 'react-router-dom'
import theme from 'theme/theme.js'
import { InterlynkLogo } from 'components/Icons/Icons'
import { useState } from 'react'

export default function Register(props) {
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

  const [username, setUsername] = useState('')
  const [connectorName, setConnectorName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
  }

  return (
    <ChakraProvider theme={theme} resetCss={false} w='100%'>
      <Box ref={navRef} w='100%' position={'relative'}>
        <Image
          src='https://i.ibb.co/YTJ293m/image.png'
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
                    type='text'
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder='Username'
                  />
                </FormControl>
                <FormControl mt={3} isRequired>
                  <Input
                    type='text'
                    value={connectorName}
                    onChange={(e) => setConnectorName(e.target.value)}
                    placeholder='Connector name'
                  />
                </FormControl>
                <FormControl mt={3} isRequired>
                  <Input
                    type='email'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder='Email address'
                  />
                </FormControl>
                <FormControl mt={3} isRequired>
                  <Input
                    type='password'
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder='*******'
                  />
                </FormControl>
                <Button width='full' mt={4} type='submit' colorScheme='blue'>
                  Continue
                </Button>
              </form>
            </Flex>
          </Flex>
        </Box>
      </Box>
    </ChakraProvider>
  )
}
