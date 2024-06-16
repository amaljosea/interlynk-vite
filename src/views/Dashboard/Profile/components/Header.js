import { useMutation } from '@apollo/client'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import {
  Avatar,
  Box,
  Button,
  Flex,
  Input,
  Text,
  useColorModeValue,
  useToast
} from '@chakra-ui/react'

import Card from 'components/Card/Card.js'
import CardBody from 'components/Card/CardBody.js'

import { UploadProfileImage } from 'graphQL/Mutation'

const Header = ({ org, selectedTab, setSelectedTab, user, tabs, refetch }) => {
  const toast = useToast()
  const navigate = useNavigate()
  const textColor = useColorModeValue('#1A202C', '#F7FAFC')
  const iconColor = useColorModeValue('#EDF2F7', '#2D3748')
  const emailColor = useColorModeValue('gray.500', 'gray.300')

  const handleClick = (name) => {
    setSelectedTab(name)
    if (name === 'PERSONAL') {
      navigate('/vendor/settings?tab=person-details')
    } else {
      navigate('/vendor/settings?tab=general')
    }
  }

  const userName = localStorage.getItem('username')
  const userEmail = localStorage.getItem('email')

  const [uploadProfile] = useMutation(UploadProfileImage)

  const inputRef = useRef(null)
  const [profileImage, setProfileImage] = useState(null)

  const isValidFileType = (file) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    return allowedTypes.includes(file.type)
  }

  const isValidFileSize = (file) => {
    const maxSize = 5 * 1024 * 1024
    return file.size <= maxSize
  }

  const SERVER_URL = process.env.REACT_APP_SERVER

  const onImageChange = async (file) => {
    console.log('Selected file:', file)
    // setProfileImage(URL.createObjectURL(file))
    await uploadProfile({
      variables: {
        userId: user.id,
        profileImage: file
      }
    })
      .then((res) => {
        if (res.data) {
          setProfileImage(
            `${SERVER_URL}/${res.data.userUploadProfileImage.user.profileImage.url}`
          )
          refetch()
        }
      })
      .finally(() => {
        toast({
          description: 'Profile updated successfully',
          status: 'success',
          duration: 3000,
          position: 'top'
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
        onImageChange(file)
      } else {
        toast({
          title: 'Someting went wrong 😕',
          variant: 'left-accent',
          description: 'The file is too large. Allowed maximum size is 5MB',
          status: 'error',
          duration: 5000,
          position: 'top'
        })
      }
    }
  }

  useEffect(() => {
    if (user) {
      if (user.profileImage?.url) {
        setProfileImage(`${SERVER_URL}/${user.profileImage?.url}`)
      } else {
        setProfileImage(null)
      }
    }
  }, [user])

  return (
    <Flex direction='column'>
      <Card mb='6'>
        <CardBody>
          {/* user info */}
          <Flex
            align='center'
            mb={{ sm: '10px', md: '0px' }}
            direction={{ sm: 'column', md: 'row' }}
            w={{ sm: '100%' }}
            textAlign={{ sm: 'center', md: 'start' }}
            gap={4}
          >
            {/* PROFILE IMAGE */}
            <Box
              position='relative'
              overflow='hidden'
              borderRadius='full'
              width='80px'
              height='80px'
            >
              <Avatar
                me={{ md: '22px' }}
                src={profileImage && profileImage}
                borderRadius='full'
                width='80px'
                height='80px'
                objectFit='cover'
              />
              <Input
                type='file'
                accept='.jpg,.jpeg,.png,.webp'
                ref={inputRef}
                onChange={handleFileChange}
                opacity='0'
                position='absolute'
                top='0'
                left='0'
                width='80px'
                height='80px'
                cursor='pointer'
                isDisabled={!org}
                zIndex={-1}
              />
              <Box
                position='absolute'
                top='0'
                left='0'
                width='80px'
                height='80px'
                bg='rgba(0,0,0,0.2)'
                opacity='0'
                transition='opacity 0.3s'
                _hover={{ opacity: org ? 1 : 0 }}
                onClick={onProfileClick}
                borderRadius='full'
                cursor='pointer'
              />
            </Box>

            <Flex direction='column' maxWidth='100%' my={{ sm: '14px' }}>
              <Text
                fontSize={{ sm: 'lg', lg: 'xl' }}
                color={textColor}
                fontWeight='bold'
                ms={{ sm: '8px', md: '0px' }}
              >
                {user ? user.name : userName}
              </Text>
              <Text
                fontSize={{ sm: 'sm', md: 'md' }}
                color={emailColor}
                fontWeight='medium'
              >
                {user ? user.email : userEmail}
              </Text>
            </Flex>
          </Flex>
          {/* tabs */}
          <Flex
            direction={{ sm: 'column', lg: 'row' }}
            w={{ sm: '100%', md: '50%', lg: 'auto' }}
            gap={2}
            alignItems={'center'}
          >
            {tabs.map((tab, index) => (
              <Button
                key={index}
                onClick={() => handleClick(tab.name)}
                variant={`${selectedTab == tab.name ? 'solid' : 'outline'}`}
                colorScheme='blue'
                display={!org ? 'none' : 'block'}
              >
                <Flex align='center' justifyContent='center'>
                  <tab.icon
                    color={`${selectedTab == tab.name ? iconColor : '#3182CE'}`}
                    w='100%'
                    h='100%'
                  />
                  <Text fontSize='xs' fontWeight='bold' ms='6px'>
                    {tab.name}
                  </Text>
                </Flex>
              </Button>
            ))}
          </Flex>
        </CardBody>
      </Card>
    </Flex>
  )
}

export default Header
