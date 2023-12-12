// Chakra imports
import { useMutation } from '@apollo/client'
import {
  Box,
  Button,
  Flex,
  Image,
  Input,
  Text,
  useColorModeValue,
  useToast
} from '@chakra-ui/react'

import Card from 'components/Card/Card.js'
import CardBody from 'components/Card/CardBody.js'
import { UploadProfileImage } from 'graphQL/Mutation'
import { useEffect, useRef, useState } from 'react'
import { displayPic } from 'utils'

const Header = ({ selectedTab, setSelectedTab, user, tabs, refetch }) => {
  const toast = useToast()
  const textColor = useColorModeValue('gray.700', 'white')
  const emailColor = useColorModeValue('gray.500', 'gray.300')

  const handleClick = (name) => {
    setSelectedTab(name)
    if (name === 'PERSONAL') {
      window.history.pushState(null, null, '/vendor/profiles?tab=person')
    } else {
      window.history.pushState(null, null, '/vendor/profiles?tab=organization')
    }
  }

  const [uploadProfile] = useMutation(UploadProfileImage)

  console.log('user', user)

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
    if (file && isValidFileType(file) && isValidFileSize(file)) {
      onImageChange(file)
    } else {
      toast({
        description: 'Invalid file format or size',
        status: 'error',
        duration: 3000,
        position: 'top'
      })
    }
  }

  useEffect(() => {
    if (user.profileImage) {
      setProfileImage(`${SERVER_URL}/${user.profileImage.url}`)
    }
  }, [])

  return (
    <Flex direction='column' pt={{ base: '120px', md: '75px' }}>
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
              <Image
                src={profileImage || displayPic(user.email)}
                alt=''
                borderRadius='full'
                width='80px'
                height='80px'
                objectFit='cover'
              />
              <Input
                type='file'
                ref={inputRef}
                onChange={handleFileChange}
                opacity='0'
                position='absolute'
                top='0'
                left='0'
                width='80px'
                height='80px'
                cursor='pointer'
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
                _hover={{ opacity: 1 }}
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
                {user.name}
              </Text>
              <Text
                fontSize={{ sm: 'sm', md: 'md' }}
                color={emailColor}
                fontWeight='medium'
              >
                {user.email}
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
              >
                <Flex align='center' justifyContent='center'>
                  <tab.icon
                    color={`${selectedTab == tab.name ? 'white' : '#3182CE'}`}
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
