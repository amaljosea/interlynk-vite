import {
  Flex,
  Switch,
  Text,
  VStack,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Button
} from '@chakra-ui/react'
import CardBody from 'components/Card/CardBody'
import CardHeader from 'components/Card/CardHeader'
import { useState } from 'react'

const Controls = () => {
  const [checks, setChecks] = useState(true)
  const [internalComp, setInternalComp] = useState(true)

  const {
    isOpen: isChecksOpen,
    onOpen: onChecksOpen,
    onClose: onChecksClose
  } = useDisclosure()

  const {
    isOpen: isCompOpen,
    onOpen: onCompOpen,
    onClose: onCompClose
  } = useDisclosure()

  return (
    <>
      <CardHeader my={3}>
        <Text fontSize={18}>Control Settings</Text>
      </CardHeader>

      <CardBody py={4}>
        <VStack spacing={4} alignItems={'flex-start'}>
          <Flex>
            <Switch
              size='md'
              colorScheme='blue'
              me='10px'
              isChecked={checks}
              onChange={onChecksOpen}
            />
            <Text noOfLines={1} color='gray.500' fontWeight='400'>
              Apply Checks
            </Text>
          </Flex>
          <Flex>
            <Switch
              size='md'
              colorScheme='blue'
              me='10px'
              isChecked={internalComp}
              onChange={onCompOpen}
            />
            <Text noOfLines={1} color='gray.500' fontWeight='400'>
              Apply Internal Components
            </Text>
          </Flex>
        </VStack>
      </CardBody>

      {/* CHECKS */}
      {isChecksOpen && (
        <Modal isOpen={isChecksOpen} onClose={onChecksClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>{checks ? 'Disable' : 'Enable'} Checks</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Text>
                {checks ? 'Disabling' : 'Enabling'} this will{' '}
                {checks ? 'stop' : 'start'} SBOM checks applied to uploaded
                SBOMs
              </Text>
              <Text mt={8}>Are you sure you wish to continue?</Text>
            </ModalBody>
            <ModalFooter>
              <Button mr={3} onClick={onChecksClose}>
                No
              </Button>
              <Button
                colorScheme={checks ? 'red' : 'green'}
                onClick={() => {
                  setChecks(!checks)
                  onChecksClose()
                }}
              >
                Yes
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}

      {/* INTERNAL COMPONENT */}
      {isCompOpen && (
        <Modal isOpen={isCompOpen} onClose={onCompClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>
              {internalComp ? 'Disable' : 'Enable'} Component
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Text>
                {internalComp ? 'Disabling' : 'Enabling'} this check will{' '}
                {internalComp ? 'stop' : 'start'} marketing internal components
                to uploaded SBOMs
              </Text>
              <Text mt={8}>Are you sure you wish to continue?</Text>
            </ModalBody>
            <ModalFooter>
              <Button mr={3} onClick={onCompClose}>
                No
              </Button>
              <Button
                colorScheme={internalComp ? 'red' : 'green'}
                onClick={() => {
                  setInternalComp(!internalComp)
                  onCompClose()
                }}
              >
                Yes
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </>
  )
}

export default Controls
