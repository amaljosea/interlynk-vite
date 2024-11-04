import { useMutation } from '@apollo/client'
import { formatDistanceToNow } from 'date-fns'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { ChevronDownIcon, EditIcon } from '@chakra-ui/icons'
import {
  Avatar,
  Box,
  Button,
  Flex,
  IconButton,
  Input,
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
  useDisclosure
} from '@chakra-ui/react'

import Card from 'components/Card/Card.js'
import CardBody from 'components/Card/CardBody.js'
import LynkAlert from 'components/LynkAlert'

import useCustomToast from 'hooks/useCustomToast'
import { useGlobalState } from 'hooks/useGlobalState'
import { useThemeColor } from 'hooks/useThemeColors'

import { UploadProfileImage } from 'graphQL/Mutation'

import { FaCity } from 'react-icons/fa'

import OrgDrawer from './OrgDrawer'
import PersonalDrawer from './PersonalDrawer'

const Header = ({ selectedTab, setSelectedTab, tabs }) => {
  const navigate = useNavigate()
  const { showToast } = useCustomToast()

  const { primaryTextColor, secondaryBgColor, primaryBlueText } = useThemeColor(
    ['primaryTextColor', 'secondaryBgColor', 'primaryBlueText']
  )

  const { organization: orgData } = useGlobalState()
  const { id, name, profileImage: dp } = orgData?.currentUser || ''
  const activeOrgTier = orgData?.tier
  const lastUpdated = orgData?.updatedAt
  const timeAgo =
    lastUpdated &&
    formatDistanceToNow(new Date(lastUpdated), {
      addSuffix: true
    })

  const [uploadProfile] = useMutation(UploadProfileImage)

  const inputRef = useRef(null)
  const SERVER_URL = process.env.REACT_APP_SERVER

  const [profileImage, setProfileImage] = useState(null)
  const [dpLoading, setDpLoading] = useState(false)

  const PERSONAL = useDisclosure()
  const ORG = useDisclosure()

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

  const handleEditProfileClick = () => PERSONAL.onOpen()
  const handleEditOrgClick = () => ORG.onOpen()

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

  const isOrg = selectedTab === 'ORGANIZATION'
  const isPersonal = selectedTab === 'PERSONAL'

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

  if (!orgData)
    return <LynkAlert msg={'An internal error occured. Please retry later'} />

  return (
    <>
      <Menu>
        <MenuButton
          as={Button}
          fontSize='sm'
          colorScheme='blue'
          fontWeight='medium'
          textTransform='capitalize'
          display={!orgData ? 'none' : 'block'}
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
      <Card my={5}>
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
                sx={{
                  w: '80px',
                  h: '80px',
                  overflow: 'hidden',
                  position: 'relative'
                }}
              >
                {dpLoading ? (
                  <Spinner width='80px' height='80px' />
                ) : (
                  <Avatar
                    me={{ md: '22px' }}
                    src={profileImage}
                    name={name}
                    ignoreFallback={dp || profileImage ? true : false}
                    sx={{
                      w: '80px',
                      h: '80px',
                      objectFit: 'cover',
                      borderRadius: 'full'
                    }}
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
                  sx={{
                    w: '80px',
                    h: '80px',
                    top: 0,
                    left: 0,
                    opacity: 0,
                    zIndex: -1
                  }}
                />
                <Box
                  position='absolute'
                  borderRadius='full'
                  bg='rgba(0,0,0,0.2)'
                  onClick={onProfileClick}
                  transition='opacity 0.3s'
                  _hover={{ opacity: orgData ? 1 : 0 }}
                  sx={{
                    w: '80px',
                    h: '80px',
                    top: 0,
                    left: 0,
                    opacity: 0,
                    cursor: 'pointer'
                  }}
                />
              </Box>
            )}
            {/*  CityIcon for org page */}

            {isOrg && <FaCity size='80px' style={{ color: primaryBlueText }} />}

            <Flex direction='column' maxWidth='100%' my={{ sm: '14px' }}>
              <Box
                display={'flex'}
                gap={orgData?.currentUser?.name ? '10px' : 0}
                alignItems={'center'}
              >
                <Text
                  ms={{ sm: '8px', md: '0px' }}
                  sx={{
                    fontWeight: 'semibold',
                    fontSize: 22,
                    color: primaryTextColor
                  }}
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
                sx={{ fontSize: 'sm', wordBreak: 'break-all' }}
                textTransform={'capitalize'}
              >
                {isOrg
                  ? `${activeOrgTier} · Updated ${timeAgo}`
                  : orgData?.name}
              </Text>
            </Flex>
          </Flex>
          <Flex gap={2}>
            {isPersonal ? (
              <Tooltip label='Edit Profile'>
                <IconButton
                  aria-label='Edit'
                  icon={<EditIcon />}
                  colorScheme='blue'
                  variant='solid'
                  onClick={handleEditProfileClick}
                />
              </Tooltip>
            ) : (
              <Tooltip label={'Edit Organization'} placement={'left'}>
                <IconButton
                  variant='solid'
                  aria-label='Edit'
                  colorScheme='blue'
                  icon={<EditIcon />}
                  onClick={handleEditOrgClick}
                />
              </Tooltip>
            )}
          </Flex>
        </CardBody>
      </Card>

      {/* Personal Drawer */}
      <PersonalDrawer
        inputRef={inputRef}
        isOpen={PERSONAL.isOpen}
        onClose={PERSONAL.onClose}
      />

      {/* Edit organisation Drawer */}
      <OrgDrawer isOpen={ORG.isOpen} onClose={ORG.onClose} />
    </>
  )
}

export default Header
