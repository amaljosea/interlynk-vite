import { Button, Heading } from '@chakra-ui/react'
import Card from 'components/Card/Card'
import { Link } from 'react-router-dom'

const OrgRegister = () => {
  return (
    <Card p={20} alignItems={'center'} justifyContent={'center'}>
      <Heading
        textAlign={'center'}
        size='md'
        fontFamily={'inherit'}
        fontWeight={'semibold'}
      >
        Register or join an Organization to get started
      </Heading>
      <Link to={'/vendor/settings?tab=organization'}>
        <Button mt={10} variant='solid' colorScheme='blue'>
          Create Organiaztion
        </Button>
      </Link>
    </Card>
  )
}

export default OrgRegister
