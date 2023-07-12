import axios from 'axios'
import React from 'react'
import { useEffect } from 'react'
const {
  ModalOverlay,
  useDisclosure,
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Text,
  ModalFooter,
  FormControl,
  Input,
  FormLabel,
  Checkbox,
  Flex,
  Box,
  Alert,
  AlertIcon,
  AlertDescription
} = require('@chakra-ui/react')
import { useLocation } from 'react-router-dom'
import Cookies from 'js-cookie'
import { useState } from 'react'

export default function CustomerModal() {
  const OverlayOne = () => (
    <ModalOverlay
      bg='blackAlpha.300'
      backdropFilter='blur(10px) hue-rotate(90deg)'
    />
  )

  const location = useLocation()

  const [userEmail, setUserEmail] = useState('')
  const [error, setError] = useState(false)

  useEffect(() => {
    setOverlay(<OverlayOne />)
    onOpen()
  }, [])

  const userLoginURL = process.env.REACT_APP_USER_LOGIN_URL

  const handleSubmit = (e) => {
    e.preventDefault()
    axios
      .post(`${userLoginURL}`, {
        share_user: {
          email: userEmail,
          signed_params: `${location.search.replace(/\?/g, '')}`
        }
      })
      .then((response) => {
        console.log(response.data)
        const { status } = response.data
        if (status.code === 200) {
          setUserEmail('')
          localStorage.setItem('userEmail', status.data.user.email)
          Cookies.set('userToken', response.headers.authorization)
          window.localStorage.removeItem('path')
          window.location.reload()
        }
      })
      .catch((error) => {
        console.log(`Error: ${error}`)
        setError(true)
        setUserEmail('')
      })
  }

  const { isOpen, onOpen, onClose } = useDisclosure()
  const [overlay, setOverlay] = React.useState(<OverlayOne />)

  return (
    <>
      <Modal isCentered isOpen={isOpen} onClose={onClose}>
        {overlay}
        <ModalContent>
          <form onSubmit={handleSubmit}>
            <ModalHeader>Customer Verification</ModalHeader>
            <ModalBody>
              {error === true && (
                <Box mb={5} width={'100%'}>
                  <Alert status='error' borderRadius={4}>
                    <AlertIcon />
                    <AlertDescription>Invalid email id</AlertDescription>
                  </Alert>
                </Box>
              )}
              <FormControl isRequired>
                <FormLabel>Email address</FormLabel>
                <Input
                  size='lg'
                  type='email'
                  name='userEmail'
                  placeholder={'Enter your email address'}
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                />
              </FormControl>
              <FormControl isRequired mt={4}>
                <FormLabel>Terms of service</FormLabel>
                <Flex alignItems={'start'} gap={2}>
                  <Checkbox mt={1} />
                  <Text>I have agree all the terms of services</Text>
                </Flex>
                <Flex
                  direction={'column'}
                  gap={4}
                  border={'1px solid lightgray'}
                  p={2}
                  width={'100%'}
                  height={'200px'}
                  overflow={'scroll'}
                  mt={4}
                >
                  <Text fontSize={'base'}>
                    Lorem ipsum dolor sit amet consectetur adipisicing elit.
                    Consectetur corrupti quidem, nesciunt nostrum voluptatum non
                    beatae iure assumenda, esse, quisquam aliquid maxime facere
                    laboriosam vel cupiditate blanditiis. Possimus natus minus
                    excepturi est nulla nam, ratione odit enim nemo ex omnis.
                  </Text>
                  <Text fontSize={'base'}>
                    Lorem ipsum dolor sit amet consectetur adipisicing elit.
                    Consectetur corrupti quidem, nesciunt nostrum voluptatum non
                    beatae iure assumenda, esse, quisquam aliquid maxime facere
                    laboriosam vel cupiditate blanditiis. Possimus natus minus
                    excepturi est nulla nam, ratione odit enim nemo ex omnis.
                  </Text>
                  <Text fontSize={'base'}>
                    Lorem ipsum dolor sit amet consectetur adipisicing elit.
                    Consectetur corrupti quidem, nesciunt nostrum voluptatum non
                    beatae iure assumenda, esse, quisquam aliquid maxime facere
                    laboriosam vel cupiditate blanditiis. Possimus natus minus
                    excepturi est nulla nam, ratione odit enim nemo ex omnis.
                  </Text>
                </Flex>
              </FormControl>
            </ModalBody>
            <ModalFooter>
              <Button type='submit' colorScheme='blue'>
                Submit
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </>
  )
}
