import { useMutation } from '@apollo/client'
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons'
import {
  Button,
  Flex,
  FormControl,
  FormLabel,
  IconButton,
  Input,
  InputGroup,
  InputRightElement,
  Text
} from '@chakra-ui/react'
import { useColorModeValue } from '@chakra-ui/system'
import Card from 'components/Card/Card'
import CardBody from 'components/Card/CardBody'
import CardHeader from 'components/Card/CardHeader'
import { RevokeApiToken } from 'graphQL/Mutation'
import { GenApiToken } from 'graphQL/Mutation'
import React, { useState } from 'react'
import { getFullDateAndTime } from 'utils'

const TokenInfo = () => {
  const textColor = useColorModeValue('gray.700', 'white')

  const key = window.localStorage.getItem('token')
  const createdAt = window.localStorage.getItem('tokenCreatedAt')

  const [message, setMessage] = useState('Generate')

  const [showKey, setShowKey] = useState(false)

  const handleKeyVisibility = () => {
    setShowKey(!showKey)
  }

  const [generateToken] = useMutation(GenApiToken)
  const [remokeToken] = useMutation(RevokeApiToken)

  const handleCreate = async () => {
    try {
      await generateToken()
        .then((res) => {
          if (res) {
            window.localStorage.setItem(
              'token',
              res.data.apiTokenCreate.apiToken
            )
            window.localStorage.setItem(
              'tokenCreatedAt',
              new Date().toISOString()
            )
          }
        })
        .then(() => window.location.reload())
    } catch (error) {
      console.log('Mutation error', error)
    }
  }

  return (
    <Card>
      <CardHeader p='12px 0' mb='12px'>
        <Text fontSize='lg' color={textColor} fontWeight='bold'>
          API Token
        </Text>
      </CardHeader>
      <CardBody px='5px'>
        <Flex
          width={'100%'}
          flexDirection={'column'}
          alignItems={'flex-start'}
          gap={6}
        >
          {/* NAME */}
          <FormControl>
            <FormLabel>Key</FormLabel>
            <InputGroup size='md'>
              <Input
                type={showKey ? 'text' : 'password'}
                defaultValue={key ? JSON.stringify(key).replace(/"/g, '') : ''}
                readOnly
              />
              <InputRightElement>
                <IconButton
                  aria-label={showKey ? 'Hide' : 'Show'}
                  variant='ghost'
                  icon={showKey ? <ViewOffIcon /> : <ViewIcon />}
                  onClick={handleKeyVisibility}
                />
              </InputRightElement>
            </InputGroup>
          </FormControl>
          {/* EMAIL */}
          <FormControl>
            <FormLabel>Created At</FormLabel>
            <Input
              readOnly
              defaultValue={
                createdAt
                  ? getFullDateAndTime(
                      JSON.stringify(createdAt).replace(/"/g, '')
                    )
                  : ''
              }
            />
          </FormControl>
          {/* ACTION */}
          <Button
            variant='solid'
            colorScheme='red'
            onClick={handleCreate}
            disabled={message === 'Saving....'}
          >
            {message}
          </Button>
        </Flex>
      </CardBody>
    </Card>
  )
}

export default TokenInfo
