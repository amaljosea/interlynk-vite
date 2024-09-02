import InterlynkLogo from 'assets/img/logo.png'

import { Flex, Grid, GridItem, Heading, Img, Text } from '@chakra-ui/react'

import RegistrationForm from 'components/RegistrationForm'

export default function Register() {
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
          <Text fontSize={'3xl'} color='gray.50' fontWeight={600}>
            Interlynk
          </Text>
        </Flex>
        <Heading
          opacity={0.8}
          fontSize={'5xl'}
          color={'blue.200'}
          fontFamily={'inherit'}
        >
          Wrap SBOM building, intellectual privacy protection, risk assessment,
          and vulnerability monitoring in a simple, shareable link.
        </Heading>
      </GridItem>
      <GridItem
        p={10}
        colSpan={4}
        bg={'white'}
        display={'flex'}
        flexDir={'column'}
        alignItems={'center'}
        justifyContent={'center'}
      >
        <RegistrationForm />
      </GridItem>
    </Grid>
  )
}
