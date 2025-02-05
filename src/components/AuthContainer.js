/* eslint-disable no-restricted-syntax */
import InterlynkLogo from 'assets/img/logo.png'
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { Flex, Grid, GridItem, Heading, Img, Text } from '@chakra-ui/react'

import { useThemeColor } from 'hooks/useThemeColors'

const AuthContainer = ({ children }) => {
  const { primaryBgColor } = useThemeColor(['primaryBgColor'])
  const headers = [
    'Interlynk automates your SBOM compliance without compromising privacy or control.',
    'Seamlessly manage SBOMs with Interlynk.',
    'Stay compliant and in control with Interlynk.',
    'Simplify your SBOM management with automation.',
    'Ensure SBOM compliance effortlessly with Interlynk.'
  ]
  const [selectedHeader, setSelectedHeader] = useState('')

  // Randomly select a header on component mount
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * headers.length)
    setSelectedHeader(headers[randomIndex])
  }, []) // Empty dependency array ensures it runs only once

  return (
    <Grid width={'100%'} height={'100vh'} templateColumns='repeat(12, 1fr)'>
      <GridItem
        p={10}
        as={Flex}
        colSpan={8}
        flexDir='column'
        alignItems='flex-start'
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
        <Heading opacity={0.8} fontSize={'5xl'} color={'blue.200'}>
          {selectedHeader}
        </Heading>
      </GridItem>
      <GridItem
        p={10}
        colSpan={4}
        height={'100%'}
        display={'flex'}
        flexDir={'column'}
        bg={primaryBgColor}
        overflowY={'scroll'}
        alignItems={'center'}
        justifyContent={'center'}
      >
        {children}
      </GridItem>
    </Grid>
  )
}

export default AuthContainer
