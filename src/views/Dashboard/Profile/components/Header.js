import { gql, useMutation, useQuery } from '@apollo/client'
import { refetchActiveQueries } from 'context/ApolloWrapper'
import { formatDistanceToNow } from 'date-fns'
import Cookies from 'js-cookie'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { validPassword } from 'utils'
import OrgModal from 'views/Dashboard/Profile/components/OrgModal'

import {
  AddIcon,
  ArrowBackIcon,
  ArrowForwardIcon,
  ChevronDownIcon,
  EditIcon,
  RepeatIcon,
  ViewIcon,
  ViewOffIcon
} from '@chakra-ui/icons'
import {
  Avatar,
  Box,
  Button,
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
  Heading,
  IconButton,
  Input,
  InputGroup,
  InputRightElement,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Skeleton,
  Tag,
  TagLabel,
  Text,
  VStack,
  useColorModeValue,
  useDisclosure
} from '@chakra-ui/react'

import Card from 'components/Card/Card.js'
import CardBody from 'components/Card/CardBody.js'
import LynkModal from 'components/LynkModal'

import useCustomToast from 'hooks/useCustomToast'
import { useGlobalQueryContext } from 'hooks/useGlobalQueryContext'

import {
  SwitchOrganization,
  UpdateUserPassword,
  UploadProfileImage,
  updateOrgUser
} from 'graphQL/Mutation'
import { orgUpdate } from 'graphQL/Mutation'
import { AllOrganizations, GetRoles, MyOrganizations } from 'graphQL/Queries'

import { FaBuilding, FaCity } from 'react-icons/fa'
import { MdDeleteOutline } from 'react-icons/md'

const GetCurrentUser = gql`
  query GetCurrentUser {
    organization {
      currentUser {
        id
        name
        email
        superAdmin
        profileImage {
          filename
          url
        }
      }
    }
  }
`

const GetOrganization = gql`
  query GetOrganization {
    organization {
      id
      name
      tier
      updatedAt
      currentUser {
        superAdmin
        role {
          id
          name
        }
      }
    }
  }
`

const Header = ({ selectedTab, setSelectedTab, tabs }) => {
  const userName = localStorage.getItem('username')
  const [profileImage, setProfileImage] = useState(null)
  const [newUserName, setNewUserName] = useState(userName)
  const [nameError, setNameError] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const [oldPassword, setOldPassword] = useState('')
  const [showOldPass, setShowOldPass] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [showNewPass, setShowNewPass] = useState(false)
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showConfPass, setShowConfPass] = useState(false)
  const [invalidPassword, setInvalidPassword] = useState(false)
  const [passError, setPassError] = useState('')
  const [isPasswordEdit, setIsPasswordEdit] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [activeRow, setActiveRow] = useState(null)
  const [orgName, setOrgName] = useState('')
  const { showToast } = useCustomToast()
  const navigate = useNavigate()
  const textColor = useColorModeValue('#1A202C', '#F7FAFC')
  const iconColor = useColorModeValue('#EDF2F7', '#2D3748')

  const cityIconColor = useColorModeValue('#3182CE', '#3182CE')

  const [updateOrg] = useMutation(orgUpdate)

  const { isOpen, onOpen, onClose } = useDisclosure()

  const { orgView } = useGlobalQueryContext()

  const { data } = useQuery(GetCurrentUser, {
    skip: !orgView
  })
  const isSuperAdmin = data?.organization?.currentUser?.superAdmin
  const { organization } = data || ''
  const { id, name, profileImage: dp } = organization?.currentUser || ''

  const { data: org, loading: orgLoading } = useQuery(GetOrganization, {
    skip: !orgView
  })

  const userOrganization = org?.organization?.name
  const activeOrgId = org?.organization?.id
  const activeOrgTier = org?.organization?.tier
  const lastUpdated = org?.organization?.updatedAt
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
    skip: isSuperAdmin === true ? true : false,
    variables: { invitationStatuses: ['ACCEPTED', 'INVITED'] }
  })
  const { nodes: allOrgList } = allOrgs?.allOrganizations || ''
  const { nodes: myOrgList } = myOrgs?.myOrganizations || ''

  const organisationList = isSuperAdmin ? allOrgList : myOrgList

  const { data: roles } = useQuery(GetRoles)
  const role = roles?.organization?.currentUser?.role?.name

  const [updateUser] = useMutation(updateOrgUser)
  const [updatePassword] = useMutation(UpdateUserPassword)
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
    setNewUserName(userName)
    setSelectedFile('')
    setNameError('')
    setIsPasswordEdit(false)
  }

  //Function to switch organisation
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
        refetchActiveQueries()
      })
      .finally(() => navigate('/vendor/dashboard'))
  }

  //Function to change tab (org <> personal)
  const handleTabChange = (name) => {
    setSelectedTab(name)
    console.log('name is', name)
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
      variables: {
        currentPassword: oldPassword,
        newPassword: newPassword,
        newPasswordConfirmation: confirmPassword
      }
    }).then((res) => {
      const { errors } = res?.data?.userUpdatePassword || ''
      if (errors?.length > 0) {
        showToast({
          description: `Failed to updated password ${errors[0]}`,
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
    await updateUser({
      variables: { id: id, name: newUserName }
    }).then((res) => {
      if (res.data.userUpdate.errors.length === 0) {
        localStorage.setItem('username', newUserName)
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

  const switchOrgClick = () => {
    onOrgModalOpen()
  }

  const isValidFileType = (file) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    return allowedTypes.includes(file.type)
  }

  const isValidFileSize = (file) => {
    const maxSize = 5 * 1024 * 1024
    return file.size <= maxSize
  }

  const onImageChange = async (file) => {
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
    setIsSaving(true)
    await updateOrg({
      variables: {
        name: orgName
      }
    }).then((res) => {
      if (res.data.organizationUpdate.errors.length === 0) {
        localStorage.setItem('organization', orgName)

        setIsSaving(false)
        showToast({
          description: 'Organization name updated successfully',
          status: 'success'
        })
      }
    })
  }

  const handleSave = async () => {
    setIsSaving(true)
    // Check if there's a valid change to the name and no errors
    if (
      nameError === '' &&
      newUserName.trim() !== '' &&
      newUserName !== userName
    ) {
      await handleUpdateName()
    }

    // Check if there is a new image to be uploaded
    if (selectedFile) {
      await onImageChange(selectedFile)
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

    setIsSaving(false)

    // Close the modal after saving changes
    onPersonalModalClose()
    resetStates()
  }

  useEffect(() => {
    if (dp) {
      if (dp?.url) {
        setProfileImage(`${SERVER_URL}/${dp?.url}`)
      } else {
        setProfileImage(null)
      }
    }
  }, [SERVER_URL, dp])

  useEffect(() => {
    if (org?.organization) {
      setOrgName(org?.organization?.name)
    }
  }, [org])

  useEffect(() => {
    if (data) {
      setNewUserName(name)
    }
  }, [data, name])

  return (
    <Flex direction='column'>
      <Flex justify='space-between' align='center' mb='8' px={4}>
        <Heading size='lg'>Settings</Heading>
        <Menu>
          <MenuButton
            as={Button}
            colorScheme='blue'
            display={!organization ? 'none' : 'block'}
          >
            <Flex align='center'>
              {tabs
                .filter((tab) => tab.name === selectedTab)
                .map((tab, index) => (
                  <tab.icon
                    key={index}
                    w='20px'
                    h='20px'
                    color={iconColor}
                    style={{ marginRight: '8px' }}
                  />
                ))}
              <Text fontSize={'14px'}>{selectedTab}</Text>
              <ChevronDownIcon ml='4px' boxSize='25px' />
            </Flex>
          </MenuButton>
          <MenuList>
            {tabs.map((tab, index) => (
              <MenuItem
                key={index}
                onClick={() => {
                  setSelectedTab(tab.name)
                  handleTabChange(tab.name)
                }}
              >
                <Flex align='center'>
                  <tab.icon
                    w='20px'
                    h='20px'
                    color={`${selectedTab === tab.name ? iconColor : '#3182CE'}`}
                  />
                  <Text fontSize='sm' fontWeight='bold' ml='6px'>
                    {tab.name}
                  </Text>
                </Flex>
              </MenuItem>
            ))}
          </MenuList>
        </Menu>
      </Flex>
      <Card mb='6'>
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
            {selectedTab === 'PERSONAL' && (
              <Box
                width='80px'
                height='80px'
                overflow='hidden'
                position='relative'
                borderRadius='full'
              >
                <Avatar
                  width='80px'
                  height='80px'
                  objectFit='cover'
                  borderRadius='full'
                  me={{ md: '22px' }}
                  src={profileImage || ''}
                />

                <Input
                  top='0'
                  left='0'
                  type='file'
                  opacity='0'
                  zIndex={-1}
                  width='80px'
                  height='80px'
                  ref={inputRef}
                  cursor='pointer'
                  position='absolute'
                  isDisabled={!organization}
                  onChange={handleFileChange}
                  accept='.jpg,.jpeg,.png,.webp'
                />
                <Box
                  top='0'
                  left='0'
                  opacity='0'
                  width='80px'
                  height='80px'
                  cursor='pointer'
                  position='absolute'
                  borderRadius='full'
                  bg='rgba(0,0,0,0.2)'
                  onClick={onProfileClick}
                  transition='opacity 0.3s'
                  _hover={{ opacity: organization ? 1 : 0 }}
                />
              </Box>
            )}
            {/*  CityIcon for org page */}
            {selectedTab === 'ORGANIZATION' && (
              <FaCity size='80px' style={{ color: cityIconColor }} />
            )}

            <Flex direction='column' maxWidth='100%' my={{ sm: '14px' }}>
              {orgLoading ? (
                <>
                  <Skeleton height='20px' width='150px' mb={2} />
                  <Skeleton height='20px' width='200px' />
                </>
              ) : (
                <>
                  <Box display={'flex'} gap={'10px'} alignItems={'center'}>
                    <Text
                      fontWeight='bold'
                      color={textColor}
                      ms={{ sm: '8px', md: '0px' }}
                      fontSize={{ sm: 'lg', lg: 'xl' }}
                    >
                      {selectedTab === 'ORGANIZATION'
                        ? userOrganization
                        : name || userName}
                    </Text>
                    {selectedTab === 'PERSONAL' && (
                      <Tag
                        variant='subtle'
                        height='20px'
                        backgroundColor='blue.500'
                        colorScheme={'blue'}
                      >
                        <TagLabel
                          fontSize={14}
                          textTransform={'capitalize'}
                          mx={'auto'}
                          textColor={'white'}
                        >
                          {role}
                        </TagLabel>
                      </Tag>
                    )}
                  </Box>

                  <Text
                    color={'gray.600'}
                    fontWeight='normal'
                    fontSize={'14px'}
                    textTransform={'capitalize'}
                  >
                    {selectedTab === 'ORGANIZATION'
                      ? `${activeOrgTier}. Updated ${timeAgo}`
                      : userOrganization}
                  </Text>
                </>
              )}
            </Flex>
          </Flex>
          <Flex gap={2}>
            <IconButton
              aria-label='Edit'
              icon={selectedTab === 'PERSONAL' ? <FaBuilding /> : <EditIcon />}
              colorScheme='blue'
              variant='solid'
              onClick={
                selectedTab === 'PERSONAL' ? switchOrgClick : handleEditOrgClick
              }
            />
            {selectedTab === 'PERSONAL' && (
              <IconButton
                aria-label='Edit'
                icon={<EditIcon />}
                colorScheme='blue'
                variant='solid'
                onClick={handleEditProfileClick}
              />
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
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottom={'1px solid #A0AEC0'} mb={4}>
            Edit Profile
          </DrawerHeader>

          <DrawerBody>
            {/* Modal Body Content */}
            <Text fontSize='16px' mb='10px' textColor={'gray.400'}>
              Profile picture
            </Text>
            <Flex alignItems='center' mb={4}>
              <Avatar name={userName} ml='10px' src={profileImage} />
              <Box ml={4}>
                <Text fontSize='15px'>
                  {selectedFile?.name || dp?.filename}
                </Text>
              </Box>
              <Flex ml='auto' gap={2}>
                <IconButton
                  icon={<EditIcon />}
                  aria-label='Edit Profile Picture'
                  variant='outline'
                  onClick={onProfileClick}
                />
                <IconButton
                  icon={<MdDeleteOutline />}
                  aria-label='Delete Profile Picture'
                  variant='outline'
                  colorScheme='red'
                />
              </Flex>
            </Flex>

            {/* Name Input */}
            <FormControl id='name' mb={6} isRequired>
              <FormLabel fontSize='13px'>Name</FormLabel>
              <Input
                onChange={handleNameChange}
                placeholder='Enter your name'
                value={newUserName}
                borderColor={nameError ? 'red.500' : 'inherit'}
              />
              {nameError && <Text color='red.500'>{nameError}</Text>}
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
                  <IconButton
                    onClick={() => setIsPasswordEdit(true)}
                    icon={<EditIcon />}
                    aria-label='Edit Password'
                    variant='outline'
                    ml={2}
                  />
                </Flex>
              </FormControl>
            )}

            {/* Conditionally Render Password Edit Fields */}
            {isPasswordEdit && (
              <Box>
                {/* Old Password */}
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
                        bg='transparent'
                        onClick={onToggleOldPass}
                        icon={showOldPass ? <ViewOffIcon /> : <ViewIcon />}
                      />
                    </InputRightElement>
                  </InputGroup>
                </FormControl>

                {/* New Password */}
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
                        bg='transparent'
                        onClick={onToggleNewPass}
                        icon={showNewPass ? <ViewOffIcon /> : <ViewIcon />}
                      />
                    </InputRightElement>
                  </InputGroup>
                  {newPassword !== '' && invalidPassword && (
                    <Text color='red.500'>
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
                      <Text color='red.500'>
                        Old password and new password cannot be the same
                      </Text>
                    )}
                </FormControl>

                {/* Confirm Password */}
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
                        bg='transparent'
                        onClick={onToggleConfirmPass}
                        icon={showConfPass ? <ViewOffIcon /> : <ViewIcon />}
                      />
                    </InputRightElement>
                  </InputGroup>
                  {passError !== '' && <Text color='red.500'>{passError}</Text>}
                </FormControl>
                <Button
                  mt={4}
                  colorScheme='red'
                  onClick={() => setIsPasswordEdit(false)}
                >
                  Cancel Password Edit
                </Button>
              </Box>
            )}
          </DrawerBody>

          <DrawerFooter>
            <Button
              variant='outline'
              mr={3}
              onClick={() => {
                onPersonalModalClose()
                resetStates()
              }}
            >
              Cancel
            </Button>
            <Button colorScheme='blue' onClick={handleSave}>
              {isSaving ? 'saving...' : 'Save'}
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
      {/* Org Drawer */}
      <Drawer
        isOpen={isOrgModalOpen}
        placement='right'
        onClose={onOrgModalClose}
        size='md'
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottom={'1px solid #A0AEC0'} mb='10px'>
            Organisations
          </DrawerHeader>

          <DrawerBody>
            <Text fontSize='16px' mb='20px' textColor={'gray.500'}>
              My organisations
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
                        width='fit-content'
                        variant='subtle'
                        colorScheme='white'
                        textTransform='capitalize'
                        borderColor='blue.500'
                        borderWidth='1px'
                      >
                        <TagLabel fontSize={'12px'} color='blue.500' mx='auto'>
                          {'Active'}
                        </TagLabel>{' '}
                      </Tag>
                    )}
                  </Box>
                  {/* Display tier below the name and admin */}
                  <Text
                    textColor={'gray.500'}
                    textTransform='capitalize'
                    fontSize={'12px'}
                  >
                    {org.tier}
                  </Text>
                </VStack>
                {activeOrgId !== org.id && (
                  <Box
                    border='1px'
                    borderColor='gray.200'
                    p={0}
                    borderRadius='md'
                    minW={'40px'}
                    minH={'40px'}
                    display={'flex'}
                    flexDirection={'column'}
                    justifyContent={'center'}
                    alignItems={'center'}
                    cursor={'pointer'}
                    onClick={() => {
                      setActiveRow({ id: org.id, name: org.name })
                      onWarningOpen()
                    }}
                  >
                    <ArrowBackIcon mr={2} boxSize={3} />
                    <ArrowForwardIcon ml={2} boxSize={3} />
                  </Box>
                )}
              </Box>
            ))}
            <Button
              aria-label='Add Organisation'
              colorScheme='white'
              leftIcon={<AddIcon />}
              marginTop='10px'
              fontWeight='500'
              textColor={'blue.500'}
              border='2px'
              borderColor='blue.500'
              onClick={onOpen}
            >
              Add Organisation
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
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottom={'1px solid #A0AEC0'} mb='10px'>
            Edit Organisation
          </DrawerHeader>

          <DrawerBody>
            <FormControl mb={4}>
              <FormLabel fontSize='16px' mb='8px' textColor={'gray.500'}>
                Name
              </FormLabel>
              <Input
                placeholder='Enter organisation name'
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
              />
            </FormControl>

            <Button
              colorScheme='blue'
              width={'100px'}
              onClick={handleUpdateOrgName}
            >
              {isSaving ? 'Updating...' : 'Update'}
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
          Icon={RepeatIcon}
          buttonText='Continue'
        >
          <Text>
            You are about to swich to Organization:{' '}
            <strong>{activeRow.name}</strong>
          </Text>
          <Text mt={6}>Click Continue to confirm</Text>
        </LynkModal>
      )}
    </Flex>
  )
}

export default Header
