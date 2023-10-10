import {
  Text,
  FormControl,
  FormLabel,
  Flex,
  Input,
  Button
} from '@chakra-ui/react'
import { useColorModeValue } from '@chakra-ui/system'
import Card from 'components/Card/Card'
import CardBody from 'components/Card/CardBody'
import CardHeader from 'components/Card/CardHeader'
import React, { useState, useEffect } from 'react'

const PersonalInfo = ({ user, refetch }) => {
  const textColor = useColorModeValue('gray.700', 'white')

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')

  useEffect(() => {
    setName(user.name)
    setEmail(user.email)
  }, [user])

  const handleUpdate = async () => {
    console.log('Data updated')
  }

  return (
    <Card>
      <CardHeader p='12px 0' mb='12px'>
        <Text fontSize='lg' color={textColor} fontWeight='bold'>
          Personal Info
        </Text>
      </CardHeader>
      <CardBody px='5px'>
        <Flex
          width={'100%'}
          flexDirection={'column'}
          alignItems={'flex-start'}
          gap={6}
        >
          {/* NAME */}
          <FormControl>
            <FormLabel>Name</FormLabel>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </FormControl>
          {/* EMAIL */}
          <FormControl>
            <FormLabel>Email</FormLabel>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} />
          </FormControl>
          {/* ACTION */}
          <Button variant='solid' colorScheme='blue' onClick={handleUpdate}>
            Update
          </Button>
        </Flex>
      </CardBody>
    </Card>
  )
}

export default PersonalInfo
