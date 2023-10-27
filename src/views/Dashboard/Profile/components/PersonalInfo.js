import { useMutation } from '@apollo/client'
import {
  Text,
  FormControl,
  FormLabel,
  Flex,
  Input,
  Button,
  useToast,
  FormErrorMessage,
  Box
} from '@chakra-ui/react'
import { useColorModeValue } from '@chakra-ui/system'
import Card from 'components/Card/Card'
import CardBody from 'components/Card/CardBody'
import CardHeader from 'components/Card/CardHeader'
import { updateOrgUser } from 'graphQL/Mutation'
import React, { useState, useEffect } from 'react'

const PersonalInfo = ({ user, refetch }) => {
  const textColor = useColorModeValue('gray.700', 'white')
  const toast = useToast()

  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/
    return emailRegex.test(email)
  }

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('Update')

  useEffect(() => {
    setName(user.name)
    setEmail(user.email)
  }, [user])

  const [updateUser] = useMutation(updateOrgUser)

  const handleUpdate = async () => {
    try {
      await updateUser({
        variables: {
          id: user.id,
          name: name,
          email: email
        }
      })
        .then((res) => {
          if (res) {
            setMessage('Saving....')
            setTimeout(() => {
              setMessage('Update')
            }, 2000)
          }
        })
        .finally(() => {
          refetch()
        })
    } catch (error) {
      console.log(`Error`, error)
    }
  }

  return (
    <Box px={0} mx={0}>
      <CardHeader p='12px 0' mb='12px'>
        <Text fontSize='lg' color={textColor} fontWeight='bold'>
          Personal Details
        </Text>
      </CardHeader>
      <CardBody px='5px'>
        <Flex
          width={'40%'}
          flexDirection={'column'}
          alignItems={'flex-start'}
          gap={6}
        >
          {/* NAME */}
          <FormControl isInvalid={!name}>
            <FormLabel>Name</FormLabel>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
            <FormErrorMessage>Name is required</FormErrorMessage>
          </FormControl>
          {/* EMAIL */}
          <FormControl isInvalid={!validateEmail(email)}>
            <FormLabel>Email</FormLabel>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} />
            {email === '' ? (
              <FormErrorMessage>Email is required</FormErrorMessage>
            ) : (
              !validateEmail(email) && (
                <FormErrorMessage>Email is invalid</FormErrorMessage>
              )
            )}
          </FormControl>
          {/* ACTION */}
          <Button
            variant='solid'
            colorScheme='blue'
            onClick={handleUpdate}
            disabled={
              message === 'Saving....' || !name || !validateEmail(email)
            }
          >
            {message}
          </Button>
        </Flex>
      </CardBody>
    </Box>
  )
}

export default PersonalInfo
