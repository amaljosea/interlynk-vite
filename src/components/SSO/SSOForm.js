import React, { useState } from 'react'
import { Link } from 'react-router-dom'

import {
  Button,
  Divider,
  FormControl,
  FormLabel,
  Input,
  Spacer,
  Stack,
  Text
} from '@chakra-ui/react'

import PolicyTerms from 'components/PolicyTerms'

import { useThemeColor } from 'hooks/useThemeColors'

import { LuLogIn } from 'react-icons/lu'

const serverURL = process.env.REACT_APP_SERVER

const SSOForm = () => {
  const { headingTextColor, primaryTextColor } = useThemeColor([
    'headingTextColor',
    'primaryTextColor'
  ])

  const [tenant, setTenant] = useState('')

  const handleChange = (event) => {
    setTenant(event?.target?.value)
  }

  const SAML_URL = `${serverURL}/auth/saml?tenant=${tenant}`

  return (
    <Stack w={'400px'} spacing={8}>
      <Stack spacing={0}>
        <Text
          color={primaryTextColor}
          fontSize={'20px'}
          fontWeight={'semibold'}
          textAlign={'center'}
        >
          Welcome
        </Text>
        <Text fontSize={'sm'} textAlign={'center'} color={headingTextColor}>
          Log in to continue to the dashboard
        </Text>
      </Stack>
      <Spacer />
      <form style={{ width: '100%' }} action={SAML_URL} method='POST'>
        <Stack spacing={4} width={'100%'}>
          <FormControl isRequired>
            <FormLabel htmlFor='email'>Tenant Name</FormLabel>
            <Input
              id='tenant'
              value={tenant}
              autoComplete='off'
              onChange={handleChange}
              placeholder='Enter name'
            />
          </FormControl>
          <Button
            width='full'
            type='submit'
            title='Login'
            colorScheme='blue'
            isDisabled={tenant === ''}
          >
            Log in with SSO
          </Button>
          <PolicyTerms />
        </Stack>
      </form>
      <Stack>
        <Divider />
        <Link to={'/auth'}>
          <Button w={'100%'} variant={'ghost'} leftIcon={<LuLogIn />}>
            Login with different way
          </Button>
        </Link>
      </Stack>
    </Stack>
  )
}

export default SSOForm
