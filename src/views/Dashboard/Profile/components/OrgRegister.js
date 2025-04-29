import { Button, Heading, useDisclosure } from '@chakra-ui/react'

import Card from 'components/Card/Card'

import OrgModal from './OrgModal'

const OrgRegister = () => {
  const { isOpen, onOpen, onClose } = useDisclosure()

  return (
    <>
      <Card p={20} alignItems={'center'} justifyContent={'center'} height={64}>
        <Heading textAlign={'center'} size='md' fontWeight={'semibold'}>
          Register or join an organization to get started
        </Heading>
        <Button
          mt={10}
          variant='solid'
          colorScheme='blue'
          onClick={onOpen}
          title='Register organization'
        >
          Register Organization
        </Button>
      </Card>

      {isOpen && <OrgModal isOpen={isOpen} onClose={onClose} shouldSwitchOrg />}
    </>
  )
}

export default OrgRegister
