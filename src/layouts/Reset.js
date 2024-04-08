// chakra imports
import DashboardBg from 'assets/img/dashboard.png'
import InterlynkLogo from 'assets/img/logo.png'
import Cookies from 'js-cookie'
import { useEffect, useRef } from 'react'
// core components
import { useNavigate } from 'react-router-dom'

import {
  Box,
  Flex,
  Image,
  Img,
  Modal,
  ModalBody,
  ModalContent,
  ModalOverlay,
  Text
} from '@chakra-ui/react'

import ResetForm from 'components/ResetForm'

export default function Reset() {
  const authToken = Cookies.get('authToken')
  const navigate = useNavigate()
  const navRef = useRef()

  useEffect(() => {
    if (authToken) {
      navigate('/vendor/dashboard')
    }
  }, [])

  return (
    <Box ref={navRef} w='100%' height={'100vh'} position={'relative'}>
      <Image
        src={DashboardBg}
        width={'100%'}
        height={'100%'}
        pos={'absolute'}
      />
      <Modal isCentered size={'sm'} isOpen={true}>
        <ModalOverlay bg='blackAlpha.300' backdropFilter='blur(4px)' />
        <ModalContent>
          <ModalBody py={8}>
            <Flex
              width={'100%'}
              alignItems={'center'}
              justifyContent={'center'}
              gap={1}
            >
              <Img src={InterlynkLogo} w='40px' h='40px' me='5px' />
              <Text fontSize={'3xl'} fontWeight={600}>
                Interlynk
              </Text>
            </Flex>
            <ResetForm />
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  )
}
