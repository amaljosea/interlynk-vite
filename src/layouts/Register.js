// chakra imports
import {
  Box,
  Flex,
  Image,
  Modal,
  ModalBody,
  ModalContent,
  ModalOverlay,
  Text
} from '@chakra-ui/react'
// core components
import { InterlynkLogo } from 'components/Icons/Icons'
import DashboardBg from 'assets/img/dashboard.png'
import React, { useRef } from 'react'
import { ApolloClient, InMemoryCache, ApolloProvider, createHttpLink } from '@apollo/client'

import RegistrationForm from 'components/RegistrationForm'

export default function Register() {
  const graphqlAPI = process.env.REACT_APP_GRAPHQL_API

  const httpLink = createHttpLink({
    uri: graphqlAPI
  })

  const client = new ApolloClient({
    link: httpLink,
    cache: new InMemoryCache()
  })

  const navRef = useRef()

  return (
    <ApolloProvider client={client}>
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
              >
                <InterlynkLogo w='40px' h='40px' me='5px' />
                <Text fontSize={'3xl'} fontWeight={600} mt={2}>
                  Interlynk
                </Text>
              </Flex>
              {/* REGISTRATION FORM */}
              <RegistrationForm />
            </ModalBody>
          </ModalContent>
        </Modal>
      </Box>
    </ApolloProvider>
  )
}
