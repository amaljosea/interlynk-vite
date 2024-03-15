import { useMutation } from '@apollo/client'
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons'
import { Text, FormControl, FormLabel, Flex, Input, Button, useToast, Box, FormErrorMessage, FormHelperText, Grid, GridItem, InputRightElement, IconButton, InputGroup, Alert, AlertIcon, AlertDescription } from '@chakra-ui/react'
import { useColorModeValue } from '@chakra-ui/system'
import CardBody from 'components/Card/CardBody'
import CardHeader from 'components/Card/CardHeader'
import { UpdateUserPassword, updateOrgUser } from 'graphQL/Mutation'
import { useGlobalState } from 'hooks/useGlobalState'
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { validPassword, validateEmail } from 'utils'
import Cookies from 'js-cookie'


const PersonalInfo = ({ user, refetch }) => {
  const textColor = useColorModeValue('gray.700', 'white')
  const toast = useToast()
  const navigate = useNavigate()

  const { setUserName } = useGlobalState()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('Update')
  const [error, setError] = useState('')
  const [oldPassword, setOldPassword] = useState('')
  const [showOldPass, setShowOldPass] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [showNewPass, setShowNewPass] = useState(false)
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showConfPass, setShowConfPass] = useState(false)
  const [invalidPassword, setInvalidPassword] = useState(false)
  const [passError, setPassError] = useState('')

  const [updateUser] = useMutation(updateOrgUser)
  const [updatePassword] = useMutation(UpdateUserPassword)

  const handleOldPassChange = (e) => {
    const { value } = e.target
    setOldPassword(value)
  }

  const onToggleOldPass = () => {
    setShowOldPass(!showOldPass)
  }

  const handleNewPassChange = (e) => {
    const { value } = e.target
    setNewPassword(value)
    if (value !== '' && value !== confirmPassword && confirmPassword !== '') {
      setPassError('Confirm password does not match password')
    } else {
      setPassError('')
    }
    setInvalidPassword(false)
  }

  const onToggleNewPass = () => {
    setShowNewPass(!showNewPass)
  }

  const handleCheckPassword = () => {
    if (!validPassword(newPassword)) {
      setInvalidPassword(true)
    }
  }

  const handleConfirmChange = (e) => {
    const { value } = e.target
    setConfirmPassword(value)
    if (value !== '' && value !== newPassword && newPassword !== '') {
      setPassError('Confirm password does not match password')
    } else {
      setPassError('')
    }
    setInvalidPassword(false)
  }

  const onToggleConfirmPass = () => {
    setShowConfPass(!showConfPass)
  }

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

  const handleUpdate = async () => {
    try {
      await updateUser({ variables: { id: user.id, name: name, email: email }})
        .then((res) => {
          if (res.data.userUpdate.errors.length === 0) {
            setMessage('Saving....')
            setUserName(name)
            localStorage.setItem('username', name)
            localStorage.setItem('email', email)
            setTimeout(() => {
              setMessage('Update')
              toast({ description: 'User details updated successfully', status: 'success', position: 'top', duration: 2000 })
            }, 2000)
          }
        })
        .finally(() => refetch())
    } catch (error) {
      console.log(`Error`, error)
    }
  }

  const handleUpdatePassword = async () => {
    await updatePassword({ variables: { currentPassword: oldPassword, newPassword: newPassword, newPasswordConfirmation: confirmPassword } })
      .then((res) => {
        if (res?.data) {
          console.log(res?.data)
          Cookies.set('authToken', res?.data?.userUpdatePassword?.updatedToken)
          toast({description:'Password updated successfully',status:'success',position:'top',duration:3000})
        }
      })
      .then(() => {
        setTimeout(() => {
          window.location.href = `/vendor/dashboard`
        }, 1000);
      })
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
                <Input value={email} onChange={(e) => setEmail(e.target.value)} />
                {user?.unconfirmedEmail && (
                  <FormHelperText>{JSON.stringify(user?.unconfirmedEmail)}</FormHelperText>
                )}
              </FormControl>
              {/* ACTION */}
              <Button variant='solid' colorScheme='blue' onClick={handleUpdate} disabled={ message === 'Saving....' || !name || !validateEmail(email) || error !== ''} >
                {message}
              </Button>
            </Flex>
          </GridItem>
          <GridItem>
            <Flex width={'100%'} flexDirection={'column'} alignItems={'flex-start'} gap={6}>
              {/* OLD PASSWORD */}
              <FormControl>
                <FormLabel>Old Password</FormLabel>
                <InputGroup>
                  <Input type={showOldPass ? 'text' : 'password'} value={oldPassword} onChange={handleOldPassChange} placeholder='*******' />
                  <InputRightElement width='3.1rem'>
                    <IconButton h='1.75rem' size='sm' bg={'transparent'} onClick={onToggleOldPass} icon={showOldPass ? <ViewOffIcon /> : <ViewIcon />} />
                  </InputRightElement>
                </InputGroup>
              </FormControl>
              {/* NEW PASSWORD */}
              <FormControl>
                <FormLabel>New Password</FormLabel>
                <InputGroup>
                  <Input type={showNewPass ? 'text' : 'password'} value={newPassword} onChange={handleNewPassChange} placeholder='*******' onBlur={handleCheckPassword} />
                  <InputRightElement width='3.1rem'>
                    <IconButton h='1.75rem' size='sm' bg={'transparent'} onClick={onToggleNewPass} icon={showNewPass ? <ViewOffIcon /> : <ViewIcon />} />
                  </InputRightElement>
                </InputGroup>
                {invalidPassword && (
                  <FormHelperText color={'red.500'}>
                    <Text mb={1}>Your password must contain:</Text>
                    <Text>1. Lower case letters {`(a-z)`}</Text>
                    <Text>2. Upper case letters {`(A-Z)`}</Text>
                    <Text>3. Special characters {`(ex. !@#&$%*)`}</Text>
                    <Text>4. Numbers {`(0-9)`}</Text>
                  </FormHelperText>
                )}
                {oldPassword !== '' && newPassword !== '' && oldPassword === newPassword && (
                  <FormHelperText color={'red.500'}>Old password and new password cannot be same</FormHelperText>
                )}
              </FormControl>
              {/* CONFIRM PASSWORD */}
              <FormControl isInvalid={passError !== ''}>
                <FormLabel>Confirm Password</FormLabel>
                <InputGroup>
                  <Input type={showConfPass ? 'text' : 'password'} value={confirmPassword} onChange={handleConfirmChange} isDisabled={!validPassword(newPassword)} placeholder='*******' />
                  <InputRightElement width='3.1rem'>
                    <IconButton h='1.75rem' size='sm' bg={'transparent'} onClick={onToggleConfirmPass} icon={showConfPass ? <ViewOffIcon /> : <ViewIcon />} />
                  </InputRightElement>
                </InputGroup>
                {passError !== '' && <FormErrorMessage>{passError}</FormErrorMessage>}
              </FormControl>
              {/* ACTION */}
              <Button variant='solid' colorScheme='blue' isDisabled={ oldPassword === '' || newPassword === '' || confirmPassword === '' ||  newPassword !== confirmPassword || oldPassword === newPassword } onClick={handleUpdatePassword}>
                Update
              </Button>
            </Flex>
          </GridItem>
        </Grid>
      </CardBody>
    </Box>
  )
}

export default PersonalInfo
