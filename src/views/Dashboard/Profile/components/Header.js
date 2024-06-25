import { gql, useMutation, useQuery } from '@apollo/client'
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

const GetCurrentUser = gql`
  query GetCurrentUser {
    organization {
      currentUser {
        id
        name
        email
        profileImage {
          filename
          url
        }
      }
    }
  }
`

const Header = ({ selectedTab, setSelectedTab, tabs }) => {
  const toast = useToast()
  const navigate = useNavigate()
  const org = localStorage.getItem('organization')
  const textColor = useColorModeValue('#1A202C', '#F7FAFC')
  const iconColor = useColorModeValue('#EDF2F7', '#2D3748')
  const emailColor = useColorModeValue('gray.500', 'gray.300')

  const { data, refetch } = useQuery(GetCurrentUser, {
    skip: org === 'undefined' ? true : false
  })

  const { organization } = data || ''
  const { id, name, email, profileImage: dp } = organization?.currentUser || ''

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
        userId: id,
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
    if (dp) {
      if (dp?.url) {
        setProfileImage(`${SERVER_URL}/${dp?.url}`)
      } else {
        setProfileImage(null)
      }
    }
  }, [SERVER_URL, dp])

  return (
    <Flex direction='column'>
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

            <Flex direction='column' maxWidth='100%' my={{ sm: '14px' }}>
              <Text
                fontWeight='bold'
                color={textColor}
                ms={{ sm: '8px', md: '0px' }}
                fontSize={{ sm: 'lg', lg: 'xl' }}
              >
                {name || userName}
              </Text>
              <Text
                color={emailColor}
                fontWeight='medium'
                fontSize={{ sm: 'sm', md: 'md' }}
              >
                {email || userEmail}
              </Text>
            </Flex>
          </Flex>
          {/* tabs */}
          <Flex
            gap={2}
            alignItems={'center'}
            direction={{ sm: 'column', lg: 'row' }}
            w={{ sm: '100%', md: '50%', lg: 'auto' }}
          >
            {tabs.map((tab, index) => (
              <Button
                key={index}
                colorScheme='blue'
                onClick={() => handleClick(tab.name)}
                display={!organization ? 'none' : 'block'}
                variant={`${selectedTab == tab.name ? 'solid' : 'outline'}`}
              >
                <Flex align='center' justifyContent='center'>
                  <tab.icon
                    w='100%'
                    h='100%'
                    color={`${selectedTab == tab.name ? iconColor : '#3182CE'}`}
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
