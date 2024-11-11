import axios from 'axios'
import Cookies from 'js-cookie'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import Card from 'components/Card/Card'
import CardBody from 'components/Card/CardBody'
import LynkAlert from 'components/LynkAlert'

import useQueryParam from 'hooks/useQueryParam'

const {
  Button,
  Text,
  FormControl,
  Input,
  FormLabel,
  Checkbox,
  Flex,
  Box,
  Image
} = require('@chakra-ui/react')

const Login = () => {
  const userLoginURL = process.env.REACT_APP_USER_LOGIN_URL

  const navigate = useNavigate()

  const paramId = useQueryParam('signed_url_params')

  const [userEmail, setUserEmail] = useState('')
  const [error, setError] = useState(false)

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
        // console.log(response.data)
        const { status } = response.data
        if (status.code === 200) {
          console.log('status', status)
          localStorage.setItem('userEmail', status.data.user.email)
          Cookies.set(`userToken`, response.headers.authorization)
          Cookies.set(`signedParamId`, paramId)
          navigate(`/customer/products`)
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
      <Box w='100%' position={'relative'}>
        <Image
          src='https://i.ibb.co/7pfhmJr/customer-view.png'
          width={'100%'}
          pos={'absolute'}
        />
        <Box
          w='100%'
          h='100vh'
          backdropFilter='auto'
          backdropBlur='6px'
          as={Flex}
          alignItems={'center'}
          justifyContent={'center'}
        >
          <Flex
            width={'450px'}
            p={2}
            rounded={'lg'}
            bg={'white'}
            gap={5}
            boxShadow={'xl'}
            direction={'column'}
          >
            <Card>
              <CardBody>
                <form onSubmit={handleSubmit}>
                  <Text fontWeight={'medium'} fontSize={'2xl'}>
                    Customer Verification
                  </Text>
                  <Box mt={6}>
                    {error === true && (
                      <Box mb={5} width={'100%'}>
                        <LynkAlert
                          msg={`The entered email is not in the list of reciepient(s). Plese retry or contact the person who shared this link with you.`}
                        />
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
                          THIS NONDISCLOSURE AGREEMENT AND CONFIDENTIALITY
                          AGREEMENT (“Agreement”) is made as of this 2023-07-12,
                          by Interlynk Inc. and between the recipient of this
                          link to prevent unauthorized disclosure of certain
                          Confidential Information, as defined below.
                        </Text>
                        <Text fontSize={'sm'}>
                          WHEREAS, Disclosing Party utilizes certain
                          Confidential Information including personal and
                          proprietary data, lists, and other protected
                          information in the course of carrying out its
                          business; and
                        </Text>
                        <Text fontSize={'sm'}>
                          WHEREAS, Disclosing Party and Receiving Party intend
                          to enter into a business work relationship; and
                        </Text>
                        <Text fontSize={'base'}>
                          WHEREAS, in order for Receiving Party to effectively
                          evaluate the business relationship, Disclosing Party
                          will need to share Confidential Information with
                          Receiving Party;
                        </Text>
                        <Text fontSize={'sm'}>
                          NOW, THEREFORE, the undersigned hereby agree as
                          follows:
                        </Text>
                        <Text fontSize={'sm'}>
                          By using the Services, you agree to accept these Terms
                          of Service and to comply with them.
                        </Text>
                      </Flex>
                    </FormControl>
                  </Box>
                  <Box mt={8}>
                    <Button type='submit' colorScheme='blue'>
                      Submit
                    </Button>
                  </Box>
                </form>
              </CardBody>
            </Card>
          </Flex>
        </Box>
      </Box>
    </>
  )
}

export default Login
