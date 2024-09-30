import { useMutation } from '@apollo/client'
import Cookies from 'js-cookie'
import React, { useEffect, useState } from 'react'
import { validPassword, validateEmail } from 'utils'

import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons'
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Grid,
  GridItem,
  IconButton,
  Input,
  InputGroup,
  InputRightElement,
  Text
} from '@chakra-ui/react'
import { useColorModeValue } from '@chakra-ui/system'

import CardBody from 'components/Card/CardBody'
import CardHeader from 'components/Card/CardHeader'

import useCustomToast from 'hooks/useCustomToast'
import { useGlobalState } from 'hooks/useGlobalState'
import { useThemeColor } from 'hooks/useThemeColors'

import { UpdateUserPassword, updateOrgUser } from 'graphQL/Mutation'

const PersonalInfo = () => {
  const { showToast } = useCustomToast()
  const textColor = useColorModeValue('gray.700', 'white')
  const loginType = localStorage.getItem('loginType')

  const { setUserName, organization } = useGlobalState()

  const { currentUser } = organization || ''
  const {
    id: userId,
    name: userName,
    email: userEmail,
    unconfirmedEmail
  } = currentUser || ''

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [oldPassword, setOldPassword] = useState('')
  const [showOldPass, setShowOldPass] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [showNewPass, setShowNewPass] = useState(false)
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showConfPass, setShowConfPass] = useState(false)
  const [invalidPassword, setInvalidPassword] = useState(false)
  const [passError, setPassError] = useState('')

  const [updateUser, { loading }] = useMutation(updateOrgUser)
  const { primaryErrorColor } = useThemeColor(['primaryErrorColor'])
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
    await updateUser({
      variables: { id: userId, name: name }
    }).then((res) => {
      if (res.data.userUpdate.errors.length === 0) {
        setUserName(name)
      }
    })
  }

  const handleUpdatePassword = () => {
    updatePassword({
      variables: {
        currentPassword: oldPassword,
        newPassword: newPassword,
        newPasswordConfirmation: confirmPassword
      }
    }).then((res) => {
      const { errors } = res?.data?.userUpdatePassword || ''
      if (errors?.length > 0) {
        showToast({
          description: errors[0],
          status: 'error'
        })
      } else {
        Cookies.set('authToken', res?.data?.userUpdatePassword?.updatedToken)
        showToast({
          description: 'Password updated successfully',
          status: 'success'
        })
        window.location.href = `/vendor/dashboard`
      }
    })
  }

  useEffect(() => {
    if (currentUser) {
      setName(userName)
      setEmail(userEmail)
    }
  }, [currentUser, userEmail, userName])

  return (
    <Box px={0} mx={0}>
      <CardHeader p='12px 0' mb='12px'>
        <Text fontSize='lg' color={textColor} fontWeight='bold'>
          Personal Details
        </Text>
      </CardHeader>
      <CardBody px='5px'>
        <Grid width={'100%'} templateColumns='repeat(2, 1fr)' gap={12}>
          <GridItem>
            <Flex
              width={'100%'}
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
              <FormControl isRequired isDisabled>
                <FormLabel>Email</FormLabel>
                <Input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                {unconfirmedEmail && (
                  <FormHelperText>
                    {JSON.stringify(unconfirmedEmail)}
                  </FormHelperText>
                )}
              </FormControl>
              {/* ACTION */}
              <Button
                variant='solid'
                colorScheme='blue'
                isLoading={loading}
                onClick={handleUpdate}
                disabled={!name || !validateEmail(email) || error !== ''}
              >
                Update
              </Button>
            </Flex>
          </GridItem>
          <GridItem hidden={loginType === 'social'}>
            <Flex
              width={'100%'}
              flexDirection={'column'}
              alignItems={'flex-start'}
              gap={6}
            >
              {/* OLD PASSWORD */}
              <FormControl>
                <FormLabel>Old Password</FormLabel>
                <InputGroup>
                  <Input
                    type={showOldPass ? 'text' : 'password'}
                    value={oldPassword}
                    onChange={handleOldPassChange}
                    placeholder='*******'
                  />
                  <InputRightElement width='3.1rem'>
                    <IconButton
                      h='1.75rem'
                      size='sm'
                      bg={'transparent'}
                      onClick={onToggleOldPass}
                      icon={showOldPass ? <ViewIcon /> : <ViewOffIcon />}
                    />
                  </InputRightElement>
                </InputGroup>
              </FormControl>
              {/* NEW PASSWORD */}
              <FormControl>
                <FormLabel>New Password</FormLabel>
                <InputGroup>
                  <Input
                    type={showNewPass ? 'text' : 'password'}
                    value={newPassword}
                    onChange={handleNewPassChange}
                    placeholder='*******'
                    onBlur={handleCheckPassword}
                  />
                  <InputRightElement width='3.1rem'>
                    <IconButton
                      h='1.75rem'
                      size='sm'
                      bg={'transparent'}
                      onClick={onToggleNewPass}
                      icon={showNewPass ? <ViewIcon /> : <ViewOffIcon />}
                    />
                  </InputRightElement>
                </InputGroup>
                {newPassword !== '' && invalidPassword && (
                  <FormHelperText color={primaryErrorColor}>
                    <Text mb={1}>
                      Your password must be 8-16 characters contain:
                    </Text>
                    <Text>1. Lower case letters {`(a-z)`}</Text>
                    <Text>2. Upper case letters {`(A-Z)`}</Text>
                    <Text>3. Special characters {`(ex. !@#&$%*.)`}</Text>
                    <Text>4. Numbers {`(0-9)`}</Text>
                  </FormHelperText>
                )}
                {oldPassword !== '' &&
                  newPassword !== '' &&
                  oldPassword === newPassword && (
                    <FormHelperText color={primaryErrorColor}>
                      Old password and new password cannot be same
                    </FormHelperText>
                  )}
              </FormControl>
              {/* CONFIRM PASSWORD */}
              <FormControl isInvalid={passError !== ''}>
                <FormLabel>Confirm Password</FormLabel>
                <InputGroup>
                  <Input
                    type={showConfPass ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={handleConfirmChange}
                    isDisabled={!validPassword(newPassword)}
                    placeholder='*******'
                  />
                  <InputRightElement width='3.1rem'>
                    <IconButton
                      h='1.75rem'
                      size='sm'
                      bg={'transparent'}
                      onClick={onToggleConfirmPass}
                      icon={showConfPass ? <ViewIcon /> : <ViewOffIcon />}
                    />
                  </InputRightElement>
                </InputGroup>
                {passError !== '' && (
                  <FormErrorMessage>{passError}</FormErrorMessage>
                )}
              </FormControl>
              {/* ACTION */}
              <Button
                variant='solid'
                colorScheme='blue'
                isDisabled={
                  oldPassword === '' ||
                  newPassword === '' ||
                  confirmPassword === '' ||
                  newPassword !== confirmPassword ||
                  oldPassword === newPassword
                }
                onClick={handleUpdatePassword}
              >
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
