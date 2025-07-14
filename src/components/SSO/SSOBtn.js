import React from 'react'
import { Link } from 'react-router-dom'

import { Button } from '@chakra-ui/react'

import { LuLock } from 'react-icons/lu'

const SSOBtn = () => {
  return (
    <Link to={'/sso'}>
      <Button
        width={'100%'}
        title='SSO'
        variant='outline'
        leftIcon={<LuLock />}
      >
        Log in with Enterprise SSO
      </Button>
    </Link>
  )
}

export default SSOBtn
