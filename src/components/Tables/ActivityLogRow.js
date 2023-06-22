import {
  Stack,
  Tag,
  Button,
  IconButton,
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerHeader,
  Input,
  Icon,
  Flex,
  Td,
  Text,
  Tr,
  useColorModeValue,
  useDisclosure
} from '@chakra-ui/react'
import React, { useEffect, useState } from 'react'

import {
  FaEllipsisV,
  FaEye,
  FaThumbsUp,
  FaTools,
  FaBug,
  FaShare,
  FaGithub,
  FaDesktop,
  FaMobile,
  FaWindows,
  FaApple,
  FaLinux,
  FaAndroid,
  FaAppStoreIos
} from 'react-icons/fa'
import { isBrowser, isMobile } from 'react-device-detect'
import { useContext } from 'react'
import GlobalContext from 'context/GlobalContext'

function ActivityLogRow(props) {
  const { type, product, version, user, notes, timestamp } = props
  const textColor = useColorModeValue('gray.700', 'white')
  const bgStatus = useColorModeValue('gray.400', '#1a202c')
  const colorStatus = useColorModeValue('white', 'gray.400')
  const { isOpen, onOpen, onClose } = useDisclosure()
  const btnRef = React.useRef()

  const { userLocation } = useContext(GlobalContext)

  // set value of icon based on type
  let icon
  let color
  switch (type) {
    case 'SBOM Built':
      icon = FaGithub
      color = 'black'
      break
    case 'SBOM Assembled':
      icon = FaTools
      color = 'black'
      break
    case 'New Vulnerability':
      icon = FaBug
      color = 'red'
      break
    case 'SBOM Viewed':
      icon = FaEye
      color = 'black'
      break
    case 'SBOM Approved':
      icon = FaThumbsUp
      color = 'teal.300'
      break
    case 'SBOM Shared':
      icon = FaShare
      color = 'teal.300'
      break
  }

  const [operatingSystem, setOperatingSystem] = useState('')

  useEffect(() => {
    const userAgent = window.navigator.userAgent
    if (userAgent.match(/Windows/i)) {
      setOperatingSystem('Windows')
    } else if (userAgent.match(/Mac/i)) {
      setOperatingSystem('MacOS')
    } else if (userAgent.match(/Linux/i)) {
      setOperatingSystem('Linux')
    } else if (userAgent.match(/Android/i)) {
      setOperatingSystem('Android')
    } else if (userAgent.match(/iOS|iPad|iPhone/i)) {
      setOperatingSystem('iOS')
    } else {
      setOperatingSystem('Unknown')
    }
  }, [])

  return (
    <Tr>
      <Td minWidth={{ sm: '250px' }} pl='0px'>
        <Flex align='center' py='.2rem' minWidth='100%' flexWrap='nowrap'>
          <Icon
            as={icon}
            color={color}
            h={'30px'}
            w={'26px'}
            pe='6px'
            position='relative'
            right={document.documentElement.dir === 'rtl' ? '-8px' : ''}
            left={document.documentElement.dir === 'rtl' ? '' : '-8px'}
          />
          <Flex direction='column'>
            <Text fontSize='sm' color={textColor} minWidth='100%'>
              {' '}
              {type}{' '}
            </Text>
          </Flex>
        </Flex>
      </Td>

      <Td>
        <Flex direction='column'>
          <Text fontSize='sm' color={textColor}>
            {product}
          </Text>
        </Flex>
      </Td>
      <Td>{version}</Td>
      <Td>
        <Text fontSize='sm' color={textColor}>
          {user}
        </Text>
      </Td>
      <Td>
        <Text fontSize='sm' color={textColor}>
          {notes}
        </Text>
      </Td>
      <Td>
        <Text fontSize='sm' color={textColor}>
          {timestamp}
        </Text>
      </Td>
      <Td>
        <Button ref={btnRef} p='0px' bg='transparent' onClick={onOpen}>
          <Icon as={FaEllipsisV} color='gray.400' cursor='pointer' />
        </Button>
        <Drawer
          isOpen={isOpen}
          placement='right'
          onClose={onClose}
          finalFocusRef={btnRef}
        >
          <DrawerOverlay />
          <DrawerContent>
            <DrawerCloseButton />
            <DrawerHeader>Activity Details</DrawerHeader>

            <DrawerBody>
              {type === 'SBOM Viewed' ? (
                <>
                  <Text textTransform={'uppercase'}>Device, OS & Location Info</Text>
                  <Flex direction={'row'} gap={4} alignItems={'center'} mt={4}>
                    {isBrowser && <FaDesktop color='darkgray' />}
                    {isMobile && <FaMobile color='darkgray' />}
                    {operatingSystem === 'Windows' && (
                      <FaWindows color='darkgray' />
                    )}
                    {operatingSystem === 'MacOS' && (
                      <FaApple color='darkgray' />
                    )}
                    {operatingSystem === 'Linux' && (
                      <FaLinux color='darkgray' />
                    )}
                    {operatingSystem === 'Android' && (
                      <FaAndroid color='darkgray' />
                    )}
                    {operatingSystem === 'iOS' && (
                      <FaAppStoreIos color='darkgray' />
                    )}
                  </Flex>
                  <Text mt={4} fontSize={'sm'}>
                    {userLocation && userLocation.city},{' '}
                    {userLocation && userLocation.state},{' '}
                    {userLocation && userLocation.country}
                  </Text>
                </>
              ) : (
                ''
              )}
            </DrawerBody>

            <DrawerFooter>
              <Button variant='outline' mr={3} onClick={onClose}>
                Cancel
              </Button>
              <Button colorScheme='blue'>Save</Button>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </Td>
    </Tr>
  )
}

export default ActivityLogRow
