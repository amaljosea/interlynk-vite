import {
  Button,
  Flex,
  ListItem,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  UnorderedList
} from '@chakra-ui/react'

const StatusWarning = ({ isOpen, onClose, data, onToggle }) => {
  const { active } = data
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{active ? 'Disable' : 'Enable'} Rule</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Text>{active ? 'Disable' : 'Enable'} this rule will : </Text>
          <UnorderedList>
            <Flex flexDir={'column'} gap={1} mt={4}>
              {[
                `${active ? 'Disable' : 'Enable'} the execution of this rule on products`,
                `${active ? 'Remove' : 'Add'} conditions of this rule execution from existing products`
              ].map((item, index) => (
                <ListItem key={index}>{item}</ListItem>
              ))}
            </Flex>
          </UnorderedList>
          <Text mt={10}>Are you sure you wish to continue ?</Text>
        </ModalBody>
        <ModalFooter>
          <Button mr={3} onClick={onClose}>
            No
          </Button>
          <Button colorScheme={active ? 'red' : 'green'} onClick={onToggle}>
            Yes
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default StatusWarning
