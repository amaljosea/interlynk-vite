import InterlynkLogo from 'assets/img/logo.png'
import React from 'react'

import { Flex, Grid, GridItem, Heading, Img, Text } from '@chakra-ui/react'

import { useThemeColor } from 'hooks/useThemeColors'

const AuthContainer = ({ children }) => {
  const { primaryBgColor } = useThemeColor(['primaryBgColor'])
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
        <Flex width={'100%'} gap={1}>
          <Img
            w='40px'
            h='40px'
            me='5px'
            src={InterlynkLogo}
            filter={'brightness(0) invert(1)'}
          />
          <Text fontSize={'3xl'} color={'white'} fontWeight={600}>
            Interlynk
          </Text>
        </Flex>
        <Heading
          opacity={0.8}
          fontSize={'5xl'}
          // eslint-disable-next-line
          color={'blue.200'}
          fontFamily={'inherit'}
        >
          Interlynk automates your SBOM compliance without compromising privacy
          or control.
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
