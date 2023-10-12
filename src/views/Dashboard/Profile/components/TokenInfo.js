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
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Stack,
  Text,
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

  const [showKey, setShowKey] = useState(false)

  const key = useClipboard(token)

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
            setToken(res.data.apiTokenCreate.apiToken)
          }
        })
        .then(() => onClose())
    } catch (error) {
      console.log('Mutation error', error)
    }
  }

  return (
    <>
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
              <Input type={'text'} defaultValue={token} readOnly />
              <Text mt={1} fontSize={'sm'}>
                This is the only time toke will be shown, make sure to copy it
                for your use
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
              <Button variant='solid' colorScheme='red' onClick={onOpen}>
                Regenerate
              </Button>
            </Stack>
          </Flex>
        </CardBody>
      </Card>

      {isOpen && (
        <Modal finalFocusRef={finalRef} isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Regenerate Token</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Text>
                Regenerating a new token will make any previous token invalid.
              </Text>
              <Text mt={2}>Are you sure you wish to continue ?</Text>
            </ModalBody>

            <ModalFooter>
              <Button mr={3} onClick={onClose}>
                Close
              </Button>
              <Button variant='solid' colorScheme='blue' onClick={handleCreate}>
                Yes
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </>
  )
}

export default TokenInfo
