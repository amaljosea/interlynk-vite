/* eslint-disable no-restricted-syntax */
import InterlynkLogo from 'assets/img/logo.png'
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { Flex, Heading, Img, Stack, Text } from '@chakra-ui/react'

const AuthContainer = ({ children }) => {
  const [selectedHeader, setSelectedHeader] = useState('')

  useEffect(() => {
    const headers = [
      'Interlynk automates your SBOM compliance without compromising privacy or control.',
      'Seamlessly manage SBOMs with Interlynk.',
      'Stay compliant and in control with Interlynk.',
      'Simplify your SBOM management with automation.',
      'Ensure SBOM compliance effortlessly with Interlynk.'
    ]
    const randomIndex = Math.floor(Math.random() * headers.length)
    setSelectedHeader(headers[randomIndex])
  }, [])

  return (
    <Stack minH={'100vh'} direction={{ base: 'column', md: 'row' }}>
      <Flex
        p={10}
        flex={1}
        flexDir='column'
        alignItems='flex-start'
        display={['none', 'flex']}
        justifyContent='space-between'
        bgGradient='linear(to-br, #4299e1, #1A365D)'
      >
        <Link to={'/'}>
          <Flex width={'100%'} gap={1}>
            <Img
              w='40px'
              h='40px'
              me='5px'
              alt='Interlynk'
              src={InterlynkLogo}
              filter={'brightness(0) invert(1)'}
            />
            <Text fontSize={'3xl'} color={'white'} fontWeight={600}>
              Interlynk
            </Text>
          </Flex>
        </Link>
        <Heading
          opacity={0.8}
          color={'blue.200'}
          fontSize={['2xl', '3xl', '5xl']}
        >
          {selectedHeader}
        </Heading>
      </Flex>
      <Flex p={8} flex={1} align={'center'} justify={'center'}>
        {children}
      </Flex>
    </Stack>
  )
}

export default AuthContainer
