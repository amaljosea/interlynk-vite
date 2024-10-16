import { useEffect } from 'react'

import { useColorMode } from '@chakra-ui/system'

import AuthContainer from 'components/AuthContainer'
import RegistrationForm from 'components/RegistrationForm'

export default function Register() {
  const { colorMode, setColorMode } = useColorMode()

  useEffect(() => {
    if (colorMode === 'dark') {
      setColorMode('light')
    }
  }, [colorMode, setColorMode])

  return (
    <AuthContainer>
      <RegistrationForm />
    </AuthContainer>
  )
}
