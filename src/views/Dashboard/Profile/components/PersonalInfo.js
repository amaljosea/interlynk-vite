import { useMutation } from '@apollo/client'
import { Text, FormControl, FormLabel, Flex, Input, Button, useToast, Box, FormErrorMessage, FormHelperText, Grid, GridItem } from '@chakra-ui/react'
import { useColorModeValue } from '@chakra-ui/system'
import CardBody from 'components/Card/CardBody'
import CardHeader from 'components/Card/CardHeader'
import { updateOrgUser } from 'graphQL/Mutation'
import { useGlobalState } from 'hooks/useGlobalState'
import React, { useState, useEffect } from 'react'
import { validateEmail } from 'utils'

const PersonalInfo = ({ user, refetch }) => {
  const textColor = useColorModeValue('gray.700', 'white')
  const toast = useToast()

  const { setUserName } = useGlobalState()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('Update')
  const [error, setError] = useState('')
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  useEffect(() => {
    if (user) {
      setName(user.name)
      setEmail(user.email)
    }
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
          if (res.data.userUpdate.errors.length === 0) {
            setMessage('Saving....')
            setUserName(name)
            localStorage.setItem('username', name)
            localStorage.setItem('email', email)
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
        <Text fontSize='lg' color={textColor} fontWeight='bold'>Personal Details</Text>
      </CardHeader>
      <CardBody px='5px'>
        <Grid width={'100%'} templateColumns='repeat(2, 1fr)' gap={12}>
          <GridItem>
            <Flex width={'100%'} flexDirection={'column'} alignItems={'flex-start'} gap={6}>
              {/* NAME */}
              <FormControl isRequired isInvalid={error}>
                <FormLabel>Name</FormLabel>
                <Input value={name} onChange={handleNameChange} />
                <FormErrorMessage>{error}</FormErrorMessage>
              </FormControl>
              {/* EMAIL */}
              <FormControl isRequired>
                <FormLabel>Email</FormLabel>
                <Input value={email} onChange={(e) => setEmail(e.target.value)}/>
                {user?.unconfirmedEmail && <FormHelperText>{JSON.stringify(user?.unconfirmedEmail)}</FormHelperText>}
              </FormControl>
              {/* ACTION */}
              <Button variant='solid' colorScheme='blue' onClick={handleUpdate} disabled={ message === 'Saving....' || !name || !validateEmail(email) || error !== '' }>
                {message}
              </Button>
            </Flex>
          </GridItem>
          <GridItem>
            <Flex width={'100%'} flexDirection={'column'} alignItems={'flex-start'} gap={6}>
              {/* OLD PASSWORD */}
              <FormControl>
                <FormLabel>Old Password</FormLabel>
                <Input type='password' value={oldPassword} onChange={(e) => setOldPassword(e.target.value)}/>
              </FormControl>
              {/* NEW PASSWORD */}
              <FormControl>
                <FormLabel>New Password</FormLabel>
                <Input type='password' value={newPassword} onChange={(e) => setNewPassword(e.target.value)}/>
              </FormControl>
               {/* CONFIRM PASSWORD */}
               <FormControl>
                <FormLabel>Confirm Password</FormLabel>
                <Input type='password' value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}/>
              </FormControl>
              {/* ACTION */}
              <Button variant='solid' colorScheme='blue'>Change Password</Button>
            </Flex>
          </GridItem>
        </Grid>
      </CardBody>
    </Box>
  )
}

export default PersonalInfo
