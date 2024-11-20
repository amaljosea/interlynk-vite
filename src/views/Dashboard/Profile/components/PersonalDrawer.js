import { useMutation } from '@apollo/client'
import Cookies from 'js-cookie'
import { useEffect, useState } from 'react'
import { validPassword } from 'utils'

import { EditIcon, ViewIcon, ViewOffIcon } from '@chakra-ui/icons'
import {
  Avatar,
  Button,
  Divider,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  IconButton,
  Input,
  InputGroup,
  InputRightElement,
  Text,
  Tooltip
} from '@chakra-ui/react'

import useCustomToast from 'hooks/useCustomToast'
import { useGlobalState } from 'hooks/useGlobalState'
import { useThemeColor } from 'hooks/useThemeColors'

import { UpdateUserPassword, updateOrgUser } from 'graphQL/Mutation'

const PersonalDrawer = ({ isOpen, onClose, inputRef }) => {
  const SERVER_URL = process.env.REACT_APP_SERVER

  const [updateUser, { loading: userLoading }] = useMutation(updateOrgUser)
  const [updatePassword, { loading: passLoading }] =
    useMutation(UpdateUserPassword)

  const { showToast } = useCustomToast()
  const { organization: orgData } = useGlobalState()
  const { id, name, profileImage: dp } = orgData?.currentUser || ''

  const { primaryErrorColor, secondaryTextInverse } = useThemeColor([
    'primaryErrorColor',
    'secondaryTextInverse'
  ])

  const [newUserName, setNewUserName] = useState('')
  const [nameError, setNameError] = useState('')
  const [oldPassword, setOldPassword] = useState('')
  const [showOldPass, setShowOldPass] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [showNewPass, setShowNewPass] = useState(false)
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showConfPass, setShowConfPass] = useState(false)
  const [invalidPassword, setInvalidPassword] = useState(false)
  const [passError, setPassError] = useState('')
  const [isPasswordEdit, setIsPasswordEdit] = useState(false)
  const [isSaveDisabled, setIsSaveDisabled] = useState(false)

  const onProfileClick = () => inputRef?.current?.click()

  const handleClose = () => {
    resetStates()
    onClose()
  }

  const resetStates = () => {
    setNameError('')
    setIsPasswordEdit(false)
    setOldPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setShowOldPass(false)
    setShowNewPass(false)
    setShowConfPass(false)
    setPassError('')
    setIsSaveDisabled(false)
  }

  const handleNameChange = (e) => {
    const { value } = e.target
    setNewUserName(value)
    if (value.length < 2 || value.length > 256) {
      setNameError('Input must be between 2 and 256 characters')
    } else if (value.startsWith(' ')) {
      setNameError('A name must begin with a letter')
    } else {
      setNameError('')
    }
  }

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

  const handleUpdateName = async () => {
    if (orgData?.currentUser?.name === newUserName) {
      return
    }
    await updateUser({
      variables: { id: id, name: newUserName }
    }).then((res) => {
      if (res.data.userUpdate.errors.length === 0) {
        showToast({
          description: 'User Name updated successfully',
          status: 'success'
        })
      }
    })
  }

  const handleUpdatePassword = async () => {
    await updatePassword({
      refetchQueries: [],
      variables: {
        currentPassword: oldPassword,
        newPassword: newPassword,
        newPasswordConfirmation: confirmPassword
      }
    }).then((res) => {
      const { errors } = res?.data?.userUpdatePassword || ''
      if (errors?.length > 0) {
        showToast({
          description: `Failed to update password ${errors[0]}`,
          status: 'error'
        })
      } else {
        Cookies.set('authToken', res?.data?.userUpdatePassword?.updatedToken)
        showToast({
          description: 'Password updated successfully',
          status: 'success'
        })
      }
    })
  }

  const handleSave = async () => {
    if (nameError === '' && newUserName.trim() !== '' && newUserName !== name) {
      // Check if there's a valid change to the name and no errors
      await handleUpdateName()
    }

    // If password editing is enabled and there are no password errors
    if (
      isPasswordEdit &&
      passError === '' &&
      oldPassword &&
      newPassword &&
      confirmPassword
    ) {
      await handleUpdatePassword()
    }

    // Close the modal after saving changes
    onClose()
  }

  useEffect(() => {
    if (isPasswordEdit) {
      if (
        newPassword &&
        !invalidPassword &&
        oldPassword &&
        newPassword &&
        oldPassword !== newPassword &&
        newPassword === confirmPassword
      ) {
        setIsSaveDisabled(false)
      } else {
        setIsSaveDisabled(true)
      }
    }
  }, [
    isPasswordEdit,
    invalidPassword,
    oldPassword,
    newPassword,
    confirmPassword
  ])

  useEffect(() => {
    if (orgData) {
      setNewUserName(orgData?.currentUser?.name)
    } else {
      setNewUserName('')
    }
  }, [orgData])

  return (
    <Drawer
      isOpen={isOpen}
      placement='right'
      onClose={handleClose}
      size='md'
      closeOnOverlayClick={false}
    >
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton mt={1} />
        <DrawerHeader fontWeight='500' borderBottomWidth='1px'>
          Edit Profile
        </DrawerHeader>

        <DrawerBody overflowX={'hidden'} padding={'20px'}>
          {/* Modal Body Content */}
          <Text fontSize='12px' mb='12px' textColor={secondaryTextInverse}>
            Profile picture
          </Text>
          <Flex alignItems='center' mb={4} height={'48px'}>
            <Avatar
              ml='10px'
              name={name}
              src={`${SERVER_URL}/${dp?.url}`}
              ignoreFallback={dp?.url ? true : false}
            />
            {/* Only show Avatar when there's an image */}
            <Flex ml='auto' gap={2}>
              <Tooltip label='Upload Profile Picture'>
                <IconButton
                  icon={<EditIcon />}
                  aria-label='Edit Profile Picture'
                  variant='outline'
                  onClick={onProfileClick}
                />
              </Tooltip>
            </Flex>
          </Flex>

          {/* Name Input */}
          <FormControl id='name' mb={6} isRequired isInvalid={nameError !== ''}>
            <FormLabel fontSize='13px'>Name</FormLabel>
            <Input
              onChange={handleNameChange}
              placeholder='Enter your name'
              value={newUserName}
              borderColor={nameError ? primaryErrorColor : 'inherit'}
            />
            <FormErrorMessage>{nameError}</FormErrorMessage>
          </FormControl>

          {/* Password Edit */}
          {!isPasswordEdit && (
            <Flex alignItems={'flex-end'} gap={2}>
              <FormControl id='password'>
                <FormLabel fontSize='13px'>Edit Password</FormLabel>
                <Input
                  type='password'
                  isDisabled={true}
                  placeholder='************'
                />
              </FormControl>
              <Tooltip label='Edit Password'>
                <IconButton
                  variant='outline'
                  icon={<EditIcon />}
                  aria-label='Edit Password'
                  onClick={() => setIsPasswordEdit(true)}
                  isDisabled={!orgData?.currentUser?.isPasswordSet}
                />
              </Tooltip>
            </Flex>
          )}

          {/* Conditionally Render Password Edit Fields */}
          {isPasswordEdit && (
            <Flex flexDirection={'column'} gap={6}>
              {/* Old Password */}
              <FormControl>
                <FormLabel fontSize='13px'>Current Password</FormLabel>
                <InputGroup>
                  <Input
                    type={showOldPass ? 'text' : 'password'}
                    value={oldPassword}
                    onChange={handleOldPassChange}
                    placeholder='*******'
                  />
                  <InputRightElement width='3.1rem'>
                    <IconButton
                      size='sm'
                      onClick={onToggleOldPass}
                      sx={{ h: '1.75rem', bg: 'transparent' }}
                      icon={showOldPass ? <ViewOffIcon /> : <ViewIcon />}
                    />
                  </InputRightElement>
                </InputGroup>
              </FormControl>

              {/* New Password */}
              <FormControl
                isInvalid={
                  oldPassword !== '' &&
                  newPassword !== '' &&
                  (newPassword === oldPassword || !validPassword(newPassword))
                }
              >
                <FormLabel fontSize='13px'>New Password</FormLabel>
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
                      size='sm'
                      onClick={onToggleNewPass}
                      sx={{ h: '1.75rem', bg: 'transparent' }}
                      icon={showNewPass ? <ViewOffIcon /> : <ViewIcon />}
                    />
                  </InputRightElement>
                </InputGroup>

                {newPassword !== '' && invalidPassword && (
                  <Text color={primaryErrorColor}>
                    <Text mb={1}>
                      Your password must be 8-16 characters and contain:
                    </Text>
                    <Text>1. Lower case letters {`(a-z)`}</Text>
                    <Text>2. Upper case letters {`(A-Z)`}</Text>
                    <Text>3. Special characters {`(ex. !@#&$%*.)`}</Text>
                    <Text>4. Numbers {`(0-9)`}</Text>
                  </Text>
                )}
                {oldPassword !== '' &&
                  newPassword !== '' &&
                  oldPassword === newPassword && (
                    <Text fontSize='sm' color={primaryErrorColor}>
                      Old password and new password cannot be the same
                    </Text>
                  )}
              </FormControl>

              {/* Confirm Password */}
              <FormControl isInvalid={passError !== ''}>
                <FormLabel fontSize='13px'>Confirm Password</FormLabel>
                <InputGroup>
                  <Input
                    type={showConfPass ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={handleConfirmChange}
                    isDisabled={
                      !validPassword(newPassword) || oldPassword === newPassword
                    }
                    placeholder='*******'
                  />
                  <InputRightElement width='3.1rem'>
                    <IconButton
                      size='sm'
                      onClick={onToggleConfirmPass}
                      sx={{ h: '1.75rem', bg: 'transparent' }}
                      icon={showConfPass ? <ViewOffIcon /> : <ViewIcon />}
                    />
                  </InputRightElement>
                </InputGroup>
                {passError !== '' && (
                  <Text fontSize='sm' color={primaryErrorColor}>
                    {passError}
                  </Text>
                )}
              </FormControl>
            </Flex>
          )}
        </DrawerBody>
        <Divider />
        <DrawerFooter>
          <Flex gap={1}>
            <Button
              title='Cancel'
              fontWeight={400}
              color={secondaryTextInverse}
              variant='ghost'
              onClick={handleClose}
            >
              Cancel
            </Button>
            <Button
              title='Save'
              colorScheme='blue'
              onClick={handleSave}
              isDisabled={isSaveDisabled}
              isLoading={userLoading || passLoading}
            >
              Save
            </Button>
          </Flex>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

export default PersonalDrawer
