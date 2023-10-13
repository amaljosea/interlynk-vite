import { useMutation } from '@apollo/client'
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons'
import {
  Button,
  Flex,
  FormControl,
  FormLabel,
  Tag,
  IconButton,
  Input,
  InputGroup,
  InputRightElement,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Stack,
  Text,
  Textarea,
  useClipboard,
  useDisclosure
} from '@chakra-ui/react'
import { useColorModeValue } from '@chakra-ui/system'
import Card from 'components/Card/Card'
import CardBody from 'components/Card/CardBody'
import CardHeader from 'components/Card/CardHeader'
import { RevokeApiToken } from 'graphQL/Mutation'
import { GenApiToken } from 'graphQL/Mutation'
import React, { useRef, useState } from 'react'

const TokenInfo = () => {
  const textColor = useColorModeValue('gray.700', 'white')

  const { isOpen, onOpen, onClose } = useDisclosure()

  const finalRef = useRef(null)

  const [token, setToken] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const [showKey, setShowKey] = useState(false)

  const key = useClipboard(token)

  const handleKeyVisibility = () => {
    setShowKey(!showKey)
  }

  const [generateToken] = useMutation(GenApiToken)
  const [remokeToken] = useMutation(RevokeApiToken)

  const handleCreate = async () => {
    setIsLoading(true)
    try {
      await generateToken().then((res) => {
        if (res) {
          setTimeout(() => {
            setToken(res.data.apiTokenCreate.apiToken)
            setIsLoading(false)
            onClose()
          }, 3000)
        }
      })
    } catch (error) {
      console.log('Mutation error', error)
    }
  }

  return (
    <>
      <Card>
        <CardHeader p='12px 0' mb='12px'>
          <Flex direction='column'>
            <Text fontSize='lg' color={textColor} fontWeight='bold'>
              Security Token
            </Text>
            <Text fontSize='sm' mt='10px' color={textColor}>
              Security token is required to connect through the Interlynk API or
              Command Line Interface (CLI).
            </Text>
          </Flex>
        </CardHeader>
        <CardBody px='5px'>
          <Flex
            width={'100%'}
            flexDirection={'column'}
            alignItems={'flex-start'}
            gap={6}
          >
            {/* NAME */}
            <Button variant='solid' colorScheme='green' onClick={onOpen}>
              Generate New Token
            </Button>
            {token !== '' && (
              <>
                <FormControl>
                  <FormLabel>Token</FormLabel>
                  <Textarea
                    type={'text'}
                    defaultValue={token}
                    readOnly
                    style={{
                      width: '100%',
                      height: 'auto',
                      minHeight: '150px'
                    }}
                  />
                  <Tag mt={5} fontSize={'sm'} colorScheme='red'>
                    Warning
                  </Tag>
                  <Text fontSize={'sm'}>
                    For account's security, this token is not stored anywhere
                    and will not be visible once you navigate away from this
                    page. Please copy it and store it in a safe place for future
                    reference.
                  </Text>
                </FormControl>
                {/* ACTION */}
                <Stack direction={'row'} alignItems={'center'}>
                  <Button
                    variant='solid'
                    colorScheme={'blue'}
                    onClick={() => key.onCopy()}
                  >
                    {key.hasCopied ? 'Copied!' : 'Copy'}
                  </Button>
                </Stack>
              </>
            )}
          </Flex>
        </CardBody>
      </Card>

      {isOpen && (
        <Modal finalFocusRef={finalRef} isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Security Token</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Text>
                Generating a new token makes all previously generated tokens
                invalid.
              </Text>
              <Text mt={10}>Are you sure you wish to continue ?</Text>
            </ModalBody>

            <ModalFooter>
              <Button mr={3} onClick={onClose}>
                Close
              </Button>
              <Button
                variant='solid'
                colorScheme='red'
                onClick={handleCreate}
                disabled={isLoading}
              >
                {isLoading ? 'Generating...' : 'Yes'}
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </>
  )
}

export default TokenInfo
