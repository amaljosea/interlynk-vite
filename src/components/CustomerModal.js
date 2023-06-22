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
  Box
} = require('@chakra-ui/react')

export default function CustomerModal() {
  const OverlayOne = () => (
    <ModalOverlay
      bg='blackAlpha.300'
      backdropFilter='blur(10px) hue-rotate(90deg)'
    />
  )

  useEffect(() => {
    setOverlay(<OverlayOne />)
    onOpen()
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    onClose()
    window.localStorage.removeItem('path')
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
            {/* <ModalCloseButton /> */}
            <ModalBody>
              <FormControl isRequired>
                <FormLabel>Email address</FormLabel>
                <Input size='lg' placeholder={'Enter your email address'} />
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
              <Button type='submit' colorScheme='blue'>Submit</Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </>
  )
}
