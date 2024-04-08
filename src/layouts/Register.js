import DashboardBg from 'assets/img/dashboard.png'
// core components
import InterlynkLogo from 'assets/img/logo.png'
import React, { useRef } from 'react'

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

import RegistrationForm from 'components/RegistrationForm'

export default function Register() {
  const navRef = useRef()

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
            {/* REGISTRATION FORM */}
            <RegistrationForm />
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  )
}
