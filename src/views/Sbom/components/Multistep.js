'use client'

import { useState } from 'react'
import {
  Progress,
  Box,
  ButtonGroup,
  Button,
  Heading,
  Flex,
  FormControl,
  GridItem,
  FormLabel,
  Input,
  Select,
  SimpleGrid,
  InputLeftAddon,
  InputGroup,
  Textarea,
  FormHelperText,
  InputRightElement,
  Text,
  Grid
} from '@chakra-ui/react'

import { useToast } from '@chakra-ui/react'

const Form1 = () => {
  const [show, setShow] = useState(false)
  const handleClick = () => setShow(!show)
  return (
    <>
      <Text
        w='100%'
        fontSize={24}
        textAlign={'center'}
        fontWeight='medium'
        mb={10}
      >
        Import or sync your data to Interlynk
      </Text>
      <Box width={'50%'} margin={'0 auto'}>
        <Grid templateColumns='repeat(2, 1fr)' gap={6}>
          <GridItem w='100%' h={'32rem'} bg='blue.500' />
          <GridItem w='100%' h={'32rem'} bg='blue.500' />
        </Grid>
      </Box>
    </>
  )
}

const Form2 = () => {
  return (
    <>
      <Text
        w='100%'
        fontSize={24}
        textAlign={'center'}
        fontWeight='medium'
        mb={10}
      >
        Select an object you want to import
      </Text>
      <Box width={'90%'} margin={'0 auto'}>
        <Grid templateColumns='repeat(4, 1fr)' gap={6}>
          <GridItem w='100%' h={'32rem'} bg='blue.500' />
          <GridItem w='100%' h={'32rem'} bg='blue.500' />
          <GridItem w='100%' h={'32rem'} bg='blue.500' />
          <GridItem w='100%' h={'32rem'} bg='blue.500' />
        </Grid>
      </Box>
    </>
  )
}

const Form3 = () => {
  return (
    <>
      <Text
        w='100%'
        fontSize={24}
        textAlign={'center'}
        fontWeight='medium'
        mb={10}
      >
        Component view resolved by
      </Text>
      <Box width={'70%'} margin={'0 auto'}>
        <Grid
          h='32rem'
          templateRows='repeat(2, 1fr)'
          templateColumns='repeat(5, 1fr)'
          gap={4}
        >
          <GridItem rowSpan={2} colSpan={1} bg='red.400' />
          <GridItem colSpan={2} bg='red.100' />
          <GridItem colSpan={2} bg='red.100' />
          <GridItem colSpan={4} bg='red.400' />
        </Grid>
      </Box>
    </>
  )
}

const Form4 = () => {
  return (
    <>
      <Text
        w='100%'
        fontSize={24}
        textAlign={'center'}
        fontWeight='medium'
        mb={10}
      >
        Vunlerability view resolved by
      </Text>
      <Box width={'70%'} margin={'0 auto'}>
        <Grid
          h='32rem'
          templateRows='repeat(2, 1fr)'
          templateColumns='repeat(5, 1fr)'
          gap={4}
        >
          <GridItem rowSpan={2} colSpan={1} bg='green.400' />
          <GridItem colSpan={2} bg='green.100' />
          <GridItem colSpan={2} bg='green.100' />
          <GridItem colSpan={4} bg='green.400' />
        </Grid>
      </Box>
    </>
  )
}

const Form5 = () => {
  return (
    <>
      <Text
        w='100%'
        fontSize={24}
        textAlign={'center'}
        fontWeight='medium'
        mb={10}
      >
        Status history resolved by
      </Text>
      <Box width={'70%'} margin={'0 auto'}>
        <Grid
          h='32rem'
          templateRows='repeat(2, 1fr)'
          templateColumns='repeat(5, 1fr)'
          gap={4}
        >
          <GridItem rowSpan={2} colSpan={1} bg='cyan.400' />
          <GridItem colSpan={2} bg='cyan.100' />
          <GridItem colSpan={2} bg='cyan.100' />
          <GridItem colSpan={4} bg='cyan.400' />
        </Grid>
      </Box>
    </>
  )
}

const Multistep = ({ step, progress }) => {
  return (
    <>
      <Box as='form'>
        <Progress
          hasStripe
          size='sm'
          value={progress}
          isAnimated
          mb={8}
        ></Progress>
        {step === 1 ? (
          <Form1 />
        ) : step === 2 ? (
          <Form2 />
        ) : step === 3 ? (
          <Form3 />
        ) : step === 4 ? (
          <Form4 />
        ) : (
          step === 5 && <Form5 />
        )}
      </Box>
    </>
  )
}

export default Multistep
