import { useMutation, useQuery } from '@apollo/client'
import { formatDistanceToNow } from 'date-fns'
import Cookies from 'js-cookie'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { isCustomerView, validPassword } from 'utils'
import OrgModal from 'views/Dashboard/Profile/components/OrgModal'

import {
  AddIcon,
  ChevronDownIcon,
  EditIcon,
  ViewIcon,
  ViewOffIcon
} from '@chakra-ui/icons'
import {
  Avatar,
  Box,
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
  FormLabel,
  IconButton,
  Input,
  InputGroup,
  InputRightElement,
  Menu,
  MenuButton,
  MenuItemOption,
  MenuList,
  MenuOptionGroup,
  Spinner,
  Tag,
  TagLabel,
  Text,
  Tooltip,
  VStack,
  useColorModeValue,
  useDisclosure
} from '@chakra-ui/react'

import Card from 'components/Card/Card.js'
import CardBody from 'components/Card/CardBody.js'
import LynkAlert from 'components/LynkAlert'
import LynkModal from 'components/LynkModal'

import useCustomToast from 'hooks/useCustomToast'
import { useGlobalState } from 'hooks/useGlobalState'
import { useThemeColor } from 'hooks/useThemeColors'

import { SwitchOrganization, UpdateUserPassword } from 'graphQL/Mutation'
import { orgUpdate, UploadProfileImage, updateOrgUser } from 'graphQL/Mutation'
import { AllOrganizations, MyOrganizations } from 'graphQL/Queries'

import { FaExchangeAlt } from 'react-icons/fa'
import { FaCity } from 'react-icons/fa'

const Header = ({ selectedTab, setSelectedTab, tabs }) => {
  const location = useLocation()
  const customerView = isCustomerView()
  const [profileImage, setProfileImage] = useState(null)
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
  const [activeRow, setActiveRow] = useState(null)
  const [orgName, setOrgName] = useState('')
  const [dpLoading, setDpLoading] = useState(false)
  const [isSaveDisabled, setIsSaveDisabled] = useState(false)
  const { showToast } = useCustomToast()
  const navigate = useNavigate()
  const {
    primaryTextColor,
    secondaryBgColor,
    primaryErrorColor,
    primaryBlueText
  } = useThemeColor([
    'primaryTextColor',
    'secondaryBgColor',
    'primaryErrorColor',
    'primaryBlueText'
  ])

  const switchIconColor = useColorModeValue('gray.500', 'white')
  const switchBgColor = useColorModeValue('white', '#2D3748')

  const cityIconColor = useColorModeValue('#3182CE', '#3182CE')

  const [updateOrg, { loading: updateLoading }] = useMutation(orgUpdate)

  const { isOpen, onOpen, onClose } = useDisclosure()
  const { organization: orgData } = useGlobalState()

  const isSuperAdmin = orgData?.currentUser?.superAdmin
  const { id, name, profileImage: dp } =  orgData?.currentUser || ''
  const activeOrgId = orgData?.id
  const activeOrgTier = orgData?.tier
  const lastUpdated = orgData?.updatedAt
  const timeAgo =
    lastUpdated &&
    formatDistanceToNow(new Date(lastUpdated), {
      addSuffix: true
    })

  const { data: allOrgs } = useQuery(AllOrganizations, {
    skip: isSuperAdmin === true ? false : true,
    variables: { first: 100, status: 'approved' }
  })
  const { data: myOrgs } = useQuery(MyOrganizations, {
    skip: isSuperAdmin === true || customerView ? true : false,
    variables: { invitationStatuses: ['ACCEPTED', 'INVITED'] }
  })
  const { nodes: allOrgList } = allOrgs?.allOrganizations || ''
  const { nodes: myOrgList } = myOrgs?.myOrganizations || ''

  const organisationList = isSuperAdmin ? allOrgList : myOrgList

  const [updateUser, { loading: userLoading }] = useMutation(updateOrgUser)
  const [updatePassword, { loading: passLoading }] =
    useMutation(UpdateUserPassword)
  const [switchOrg] = useMutation(SwitchOrganization)
  const [uploadProfile] = useMutation(UploadProfileImage)

  const inputRef = useRef(null)
  const SERVER_URL = process.env.REACT_APP_SERVER

  const {
    isOpen: isPersonalModalOpen,
    onOpen: onPersonalModalOpen,
    onClose: onPersonalModalClose
  } = useDisclosure()
  const {
    isOpen: isOrgModalOpen,
    onOpen: onOrgModalOpen,
    onClose: onOrgModalClose
  } = useDisclosure()

  const {
    isOpen: isWarningOpen,
    onOpen: onWarningOpen,
    onClose: onWarningClose
  } = useDisclosure()

  const {
    isOpen: isOrgInfoOpen,
    onOpen: onOrgInfoOpen,
    onClose: onOrgInfoClose
  } = useDisclosure()

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

  //Function to switch organization
  const onSwitchOrg = async (id, name) => {
    await switchOrg({
      variables: {
        orgId: id
      }
    })
      .then((res) => {
        if (res.data) {
          Cookies.set('authToken', res.data.organizationSwitch.token)
          showToast({
            description: `Logged into ${name} successfully`,
            status: 'success'
          })
        }
      })
      .finally(() => {
        navigate('/vendor/dashboard')
        window.location.reload()
      })
  }

  //Function to change tab (org <> personal)
  const handleTabChange = (name) => {
    setSelectedTab(name)
    if (name === 'PERSONAL') {
      if (activeOrgTier === 'free') {
        navigate('/vendor/settings?tab=integrations')
      } else {
        navigate('/vendor/settings?tab=security tokens')
      }
    } else {
      navigate('/vendor/settings?tab=users')
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

  const handleEditProfileClick = () => {
    onPersonalModalOpen()
  }

  const handleEditOrgClick = () => {
    onOrgInfoOpen()
  }

  const switchOrgClick = useCallback(() => {
    onOrgModalOpen()
  }, [onOrgModalOpen]) // Include onOrgModalOpen in the dependencies array

  const isValidFileType = (file) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    return allowedTypes.includes(file.type)
  }

  const isValidFileSize = (file) => {
    const maxSize = 5 * 1024 * 1024
    return file.size <= maxSize
  }

  const onImageChange = async (file) => {
    setDpLoading(true)
    await uploadProfile({
      variables: {
        userId: id,
        profileImage: file
      }
    })
      .then((res) => {
        if (res.data) {
          setProfileImage(
            `${SERVER_URL}/${res.data.userUploadProfileImage.user.profileImage.url}`
          )
        }
      })
      .finally(() => {
        showToast({
          description: 'Profile Picture uploaded successfully',
          status: 'success'
        })
        setTimeout(() => {
          setDpLoading(false)
        }, 1000)
      })
  }

  const onProfileClick = () => {
    inputRef.current.click()
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (isValidFileType(file) && isValidFileSize(file)) {
        setProfileImage(file)
        onImageChange(file)
      } else {
        showToast({
          title: 'Something went wrong 😕',
          description: 'The file is too large. Allowed maximum size is 5MB',
          status: 'error'
        })
      }
    }
  }

  const handleUpdateOrgName = async () => {
    if (orgData?.name === orgName) {
      onOrgInfoClose()
      return
    }
    await updateOrg({
      variables: {
        name: orgName
      }
    }).then((res) => {
      if (res?.data?.organizationUpdate?.errors.length === 0) {
        showToast({
          description: 'Organization name updated successfully',
          status: 'success'
        })
        onOrgInfoClose()
      }
    })
  }

  const handleSave = async () => {
    if (
      nameError === '' &&
      newUserName.trim() !== '' &&
      newUserName !== name
    ) {
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
    onPersonalModalClose()
    resetStates()
  }

  const isOrg =  selectedTab === 'ORGANIZATION'
  const isPersonal =  selectedTab === 'PERSONAL'

  useEffect(() => {
    if (dp) {
      setDpLoading(true)
      if (dp?.url) {
        setProfileImage(`${SERVER_URL}/${dp?.url}`)
      } else {
        setProfileImage(null)
      }
    }
    setTimeout(() => {
      setDpLoading(false)
    }, 1000)
  }, [SERVER_URL, dp])

  useEffect(() => {
    if(orgData) {
      setOrgName(orgData?.name)
      setNewUserName(orgData?.currentUser?.name)
    }
  }, [orgData])

  useEffect(() => {
    if (location.state?.openOrgListDrawer) {
      switchOrgClick()
    }
  }, [location.state, switchOrgClick])

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

  if (!orgData) return <LynkAlert msg={'An internal error occured. Please retry later'} />

  return (
    <>
      <Flex justify='space-between' align='center' mb={5}>
        <Text fontWeight='semibold' fontSize={20}>
          Settings
        </Text>
        <Menu>
          <MenuButton
            as={Button}
            colorScheme='blue'
            display={!orgData ? 'none' : 'block'}
            sx={{fontSize:'sm', fontWeight:'medium',textTransform:'capitalize'}}
          >
            <Flex align='center'>
              {/* Left Icon */}
              {tabs
                .filter((tab) => tab.name === selectedTab)
                .map((tab, index) => (
                  <tab.icon
                    key={index}
                    w='20px'
                    h='20px'
                    color={secondaryBgColor}
                    style={{ marginRight: '8px' }}
                  />
                ))}

              {/* Text */}
              <Text fontSize='sm'>{selectedTab.toLowerCase()}</Text>
              {/* Right Icon */}
              <ChevronDownIcon ml='4px' boxSize='20px' />
            </Flex>
          </MenuButton>
          <MenuList>
            {tabs.map((tab, index) => (
              <MenuOptionGroup key={index} value={selectedTab} type='radio'>
                <MenuItemOption
                  value={tab.name}
                  onClick={() => {
                    setSelectedTab(tab.name)
                    handleTabChange(tab.name)
                  }}
                  fontSize='sm'
                  textTransform={'capitalize'}
                >
                  {tab.name.toLowerCase()}
                </MenuItemOption>
              </MenuOptionGroup>
            ))}
          </MenuList>
        </Menu>
      </Flex>
      <Card mb={5}>
        <CardBody>
          {/* USER INFO */}
          <Flex
            gap={4}
            align='center'
            w={{ sm: '100%' }}
            mb={{ sm: '10px', md: '0px' }}
            direction={{ sm: 'column', md: 'row' }}
            textAlign={{ sm: 'center', md: 'start' }}
          >
            {/* PROFILE IMAGE */}
            {isPersonal && (
              <Box
                borderRadius='full'
                sx={{w:'80px', h:'80px', overflow:'hidden', position:'relative'}}
              >
                {dpLoading ? (
                  <Spinner width='80px' height='80px' />
                ) : (
                  <Avatar
                    me={{ md: '22px' }}
                    src={profileImage}
                    name={name}
                    ignoreFallback={dp || profileImage ? true : false}
                    sx={{w:'80px',h:'80px', objectFit:'cover', borderRadius:'full'}}
                  />
                )}

                <Input
                  type='file'
                  ref={inputRef}
                  cursor='pointer'
                  position='absolute'
                  isDisabled={!orgData}
                  onChange={handleFileChange}
                  accept='.jpg,.jpeg,.png,.webp'
                  sx={{ w: '80px', h: '80px', top: 0, left: 0, opacity: 0, zIndex: -1 }}
                />
                <Box
                  position='absolute'
                  borderRadius='full'
                  bg='rgba(0,0,0,0.2)'
                  onClick={onProfileClick}
                  transition='opacity 0.3s'
                  _hover={{ opacity: orgData ? 1 : 0 }}
                  sx={{ w: '80px', h: '80px', top: 0, left: 0, opacity: 0, cursor: 'pointer' }}
                />
              </Box>
            )}
            {/*  CityIcon for org page */}
            { isOrg && <FaCity size='80px' style={{ color: cityIconColor }} /> }

            <Flex direction='column' maxWidth='100%' my={{ sm: '14px' }}>
              <Box display={'flex'} gap={'10px'} alignItems={'center'}>
                <Text
                  ms={{ sm: '8px', md: '0px' }}
                  sx={{fontWeight:'semibold', fontSize:22, color: primaryTextColor}}
                >
                  {isPersonal ? orgData?.currentUser?.name : orgData?.name}
                </Text>
                {isPersonal && (
                  <Tag
                    size={'sm'}
                    variant='solid'
                    colorScheme='blue'
                    sx={{ w: 'fit-content', pt: 0.8 }}
                  >
                    <TagLabel textTransform={'capitalize'}>
                      {orgData?.currentUser?.role?.name}
                    </TagLabel>
                  </Tag>
                )}
              </Box>
              <Text
                sx={{ fontSize:'sm', wordBreak:'break-all' }}
                textTransform={'capitalize'}
              >
                {isOrg ? `${activeOrgTier} · Updated ${timeAgo}` : orgData?.name}
              </Text>
            </Flex>
          </Flex>
          <Flex gap={2}>
            <Tooltip
              label={ isPersonal ? 'Switch Organization' : 'Edit Organization' }
              placement={'left'}
            >
              <IconButton
                variant='solid'
                aria-label='Edit'
                colorScheme='blue'
                icon={isPersonal ? <FaExchangeAlt /> : <EditIcon />}
                onClick={isPersonal ? switchOrgClick : handleEditOrgClick}
              />
            </Tooltip>

            {isPersonal && (
              <Tooltip label='Edit Profile'>
                <IconButton
                  aria-label='Edit'
                  icon={<EditIcon />}
                  colorScheme='blue'
                  variant='solid'
                  onClick={handleEditProfileClick}
                />
              </Tooltip>
            )}
          </Flex>
        </CardBody>
      </Card>

      {/* Personal Drawer */}
      <Drawer
        isOpen={isPersonalModalOpen}
        placement='right'
        onClose={() => {
          onPersonalModalClose()
          resetStates()
        }}
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
            <Text fontSize='12px' mb='12px' textColor={'gray.500'}>
              Profile picture
            </Text>
            <Flex alignItems='center' mb={4} height={'48px'}>
              {dpLoading ? (
                <Spinner />
              ) : (
                <Avatar
                  ml='10px'
                  name={name}
                  src={profileImage}
                  ignoreFallback={dp || profileImage ? true : false}
                />
              )}{' '}
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
            <FormControl id='name' mb={6} isRequired>
              <FormLabel fontSize='13px'>Name</FormLabel>
              <Input
                onChange={handleNameChange}
                placeholder='Enter your name'
                value={newUserName}
                borderColor={nameError ? primaryErrorColor : 'inherit'}
              />
              {nameError && <Text color={primaryErrorColor}>{nameError}</Text>}
            </FormControl>

            {/* Password Edit */}
            {!isPasswordEdit && (
              <FormControl id='password'>
                <FormLabel fontSize='13px'>Edit Password</FormLabel>
                <Flex>
                  <Input
                    type='password'
                    placeholder='************'
                    disabled={true}
                  />
                  <Tooltip label='Edit Password'>
                    <IconButton
                      onClick={() => setIsPasswordEdit(true)}
                      icon={<EditIcon />}
                      aria-label='Edit Password'
                      variant='outline'
                      ml={2}
                    />
                  </Tooltip>
                </Flex>
              </FormControl>
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
                        !validPassword(newPassword) ||
                        oldPassword === newPassword
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
                fontWeight={400}
                color={'#60686F'}
                variant='ghost'
                onClick={() => {
                  onPersonalModalClose()
                  resetStates()
                }}
              >
                Cancel
              </Button>
              <Button
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

      {/* Org Drawer */}
      <Drawer
        isOpen={isOrgModalOpen}
        placement='right'
        onClose={onOrgModalClose}
        size='md'
        closeOnOverlayClick={false}
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton mt={1} />
          <DrawerHeader fontWeight='500' borderBottomWidth='1px'>
            Organization
          </DrawerHeader>

          <DrawerBody>
            <Text fontSize='16px' mb='20px' textColor={'gray.500'}>
              My organization
            </Text>

            {organisationList?.map((org, index) => (
              <Box
                key={index}
                mb={4}
                display={'flex'}
                alignItems={'center'}
                justifyContent={'space-between'}
              >
                <VStack align='start' spacing={0}>
                  {/* Display name and admin on the same row */}
                  <Box display={'flex'} alignItems={'center'} gap={1}>
                    <Text fontSize={'14px'} display='inline' mr={2}>
                      {org.name}
                    </Text>
                    {org.id === activeOrgId && (
                      <Tag
                        variant='subtle'
                        colorScheme='white'
                        borderColor={primaryBlueText}
                        sx={{w:'fit-content', borderWidth:'1px', textTransform:'capitalize'}}
                      >
                        <TagLabel
                          fontSize={'12px'}
                          color={primaryBlueText}
                          mx='auto'
                        >
                          {'Active'}
                        </TagLabel>{' '}
                      </Tag>
                    )}
                  </Box>
                  {/* Display tier below the name and admin */}
                  <Text
                    textColor={'gray.500'}
                    sx={{fontSize:'12px', textTransform:'capitalize'}}
                  >
                    {org.tier}
                  </Text>
                </VStack>
                {activeOrgId !== org.id && (
                  <Tooltip placement={'left'} label={`Switch to ${org.name}`}>
                    <IconButton
                      variant='solid'
                      aria-label='Switch'
                      icon={<FaExchangeAlt color={switchIconColor} />}
                      sx={{border:'1px', borderColor:'gray.200', bg: switchBgColor}}
                      onClick={() => {
                        setActiveRow({ id: org.id, name: org.name })
                        onWarningOpen()
                      }}
                    />
                  </Tooltip>
                )}
              </Box>
            ))}
            <Button
              onClick={onOpen}
              colorScheme='white'
              leftIcon={<AddIcon />}
              borderColor={primaryBlueText}
              aria-label='Add Organization'
              sx={{ fontWeight:'500', textColor: primaryBlueText, border:'1px', mt:'10px' }}
            >
              Add Organization
            </Button>
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      {/* Edit organisation Drawer */}
      <Drawer
        isOpen={isOrgInfoOpen}
        placement='right'
        onClose={onOrgInfoClose}
        size='md'
        closeOnOverlayClick={false}
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton mt={1} />
          <DrawerHeader fontWeight='500' borderBottomWidth='1px'>
            Edit Organization
          </DrawerHeader>

          <DrawerBody>
            <FormControl mb={4}>
              <FormLabel fontSize='16px' mb='8px' textColor={'gray.500'}>
                Name
              </FormLabel>
              <Input
                placeholder='Enter organization name'
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
              />
            </FormControl>

            <Button
              colorScheme='blue'
              isLoading={updateLoading}
              onClick={handleUpdateOrgName}
            >
              Update
            </Button>
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      {isOpen && (
        <OrgModal
          isOpen={isOpen}
          onClose={onClose}
          org={activeOrgId}
          onSwitch={onSwitchOrg}
        />
      )}

      {isWarningOpen && (
        <LynkModal
          isOpen={isWarningOpen}
          onClose={onWarningClose}
          onSubmit={() => onSwitchOrg(activeRow.id, activeRow.name)}
          title={'Switch Organization'}
          Icon={FaExchangeAlt}
          buttonText='Continue'
        >
          <Text>
            You are about to swich to Organization:{' '}
            <strong>{activeRow.name}</strong>
          </Text>
          <Text mt={6}>Click Continue to confirm</Text>
        </LynkModal>
      )}
    </>
  )
}

export default Header
