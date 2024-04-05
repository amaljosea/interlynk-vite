import axios from 'axios'
import Cookies from 'js-cookie'
import React from 'react'
import { useEffect } from 'react'
import { useState } from 'react'
import { useLocation } from 'react-router-dom'

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

const CustomerModal = ({ refetch }) => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [overlay, setOverlay] = React.useState(<OverlayOne />)

  const userLoginURL = process.env.REACT_APP_USER_LOGIN_URL

  const OverlayOne = () => (
    <ModalOverlay
      bg='blackAlpha.300'
      backdropFilter='blur(10px) hue-rotate(90deg)'
    />
  )

  const location = useLocation()

  const queryParams = new URLSearchParams(location.search)
  const paramId = queryParams.get('signed_url_params')
  const imageVersionId = queryParams.get('id')

  const [userEmail, setUserEmail] = useState('')
  const [error, setError] = useState(false)

  useEffect(() => {
    setOverlay(<OverlayOne />)
    onOpen()
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    axios
      .post(`${userLoginURL}`, {
        share_user: {
          email: userEmail,
          signed_params: paramId
        }
      })
      .then((response) => {
        console.log(response.data)
        const { status } = response.data
        if (status.code === 200) {
          localStorage.setItem('userEmail', status.data.user.email)
          Cookies.set('userToken', response.headers.authorization)
          window.location.reload()
        }
      })
      .catch((error) => {
        console.log(`Error: ${error}`)
        setError(true)
        setUserEmail('')
      })
  }

  return (
    <>
      <Modal
        isCentered
        isOpen={isOpen}
        onClose={onClose}
        size='lg'
        closeOnOverlayClick={false}
      >
        {overlay}
        <ModalContent>
          <form onSubmit={handleSubmit}>
            <ModalHeader>Customer Verification</ModalHeader>
            <ModalBody>
              {error === true && (
                <Box mb={5} width={'100%'}>
                  <Alert status='error' borderRadius={4}>
                    <AlertIcon />
                    <AlertDescription fontSize={'sm'}>
                      The entered email is not in the list of reciepient(s).
                      Plese retry or contact the person who shared this link
                      with you.
                    </AlertDescription>
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
                <FormLabel htmlFor='terms'>Terms of service</FormLabel>
                <Flex alignItems={'start'} gap={2}>
                  <Checkbox mt={1} id='terms' />
                  <Text>I have agree all the terms of services</Text>
                </Flex>
                <Flex
                  direction={'column'}
                  gap={4}
                  border={'1px solid lightgray'}
                  p={2}
                  width={'100%'}
                  height={'350px'}
                  overflow={'scroll'}
                  mt={4}
                >
                  <Text fontSize={'lg'} fontWeight={'medium'}>
                    Non-Disclosure Agreement
                  </Text>
                  <Text fontSize={'sm'}>
                    THIS NONDISCLOSURE AGREEMENT AND CONFIDENTIALITY AGREEMENT
                    (“Agreement”) is made as of this 2023-07-12, by Interlynk
                    Inc. and between the recipient of this link to prevent
                    unauthorized disclosure of certain Confidential Information,
                    as defined below.
                  </Text>
                  <Text fontSize={'sm'}>
                    WHEREAS, Disclosing Party utilizes certain Confidential
                    Information including personal and proprietary data, lists,
                    and other protected information in the course of carrying
                    out its business; and
                  </Text>
                  <Text fontSize={'sm'}>
                    WHEREAS, Disclosing Party and Receiving Party intend to
                    enter into a business work relationship; and
                  </Text>
                  <Text fontSize={'base'}>
                    WHEREAS, in order for Receiving Party to effectively
                    evaluate the business relationship, Disclosing Party will
                    need to share Confidential Information with Receiving Party;
                  </Text>
                  <Text fontSize={'sm'}>
                    NOW, THEREFORE, the undersigned hereby agree as follows:
                  </Text>
                  <Text fontSize={'sm'}>
                    By using the Services, you agree to accept these Terms of
                    Service and to comply with them.
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

export default CustomerModal
