import React, { useRef } from 'react'
import {
  Box,
  Button,
  Flex,
  Heading,
  Icon,
  Image,
  Modal,
  ModalBody,
  ModalContent,
  ModalOverlay,
  Text
} from '@chakra-ui/react'
import { Link } from 'react-router-dom'
import { CheckCircleIcon } from '@chakra-ui/icons'
import DashboardBg from 'assets/img/dashboard.png'

const Success = () => {
  const navRef = useRef()

  return (
    <Box ref={navRef} w='100%' height={'100vh'} position={'relative'}>
      <Image
        src={DashboardBg}
        width={'100%'}
        height={'100%'}
        pos={'absolute'}
      />
      <Modal isCentered size={'3xl'} isOpen={true}>
        <ModalOverlay bg='blackAlpha.300' backdropFilter='blur(4px)' />
        <ModalContent>
          <ModalBody py={12}>
            <Box
              textAlign={'center'}
              as={Flex}
              alignItems={'center'}
              justifyContent={'center'}
              flexDir={'column'}
            >
              <Icon color={'green.400'} boxSize={20} as={CheckCircleIcon} />
              <Heading my={4}>Thank You for Registration!</Heading>
              <Text>
                This is a confirmation that your registration has been received.
                You will get a confirmation message once approved.
              </Text>
              <Link to={'/auth'}>
                <Button variant='solid' colorScheme='blue' mt={6}>
                  Login
                </Button>
              </Link>
            </Box>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  )
}

export default Success
