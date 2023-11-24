import { useMutation } from '@apollo/client'
import {
  Text,
  FormControl,
  FormLabel,
  Flex,
  Input,
  Button,
  useToast,
  Box,
  FormErrorMessage
} from '@chakra-ui/react'
import { useColorModeValue } from '@chakra-ui/system'
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
  const [error, setError] = useState('')

  useEffect(() => {
    setName(user.name)
    setEmail(user.email)
  }, [user])

  const handleNameChange = (e) => {
    const { value } = e.target
    setName(value)
    if (value.length < 2 || value.length > 256) {
      setError('Input must be between 2 and 256 characters')
    } else if (value.startsWith(' ')) {
      setError('A name must begin with a letter')
    } else {
      setError('')
    }
  }

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
          if (res.data.userUpdate.errors.length == 0) {
            setMessage('Saving....')
            setTimeout(() => {
              setMessage('Update')
              toast({
                description: 'User details updated successfully',
                status: 'success',
                position: 'top',
                duration: 2000
              })
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
          <FormControl isRequired isInvalid={error}>
            <FormLabel>Name</FormLabel>
            <Input value={name} onChange={handleNameChange} />
            <FormErrorMessage>{error}</FormErrorMessage>
          </FormControl>
          {/* EMAIL */}
          <FormControl isRequired>
            <FormLabel>Email</FormLabel>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} />
          </FormControl>
          {/* ACTION */}
          <Button
            variant='solid'
            colorScheme='blue'
            onClick={handleUpdate}
            disabled={
              message === 'Saving....' ||
              !name ||
              !validateEmail(email) ||
              error !== ''
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
