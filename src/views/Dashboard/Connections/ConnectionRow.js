import React from 'react'
import { DeleteIcon, EditIcon } from '@chakra-ui/icons'
import {
  Flex,
  Image,
  Switch,
  Td,
  Text,
  Tr,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Button
} from '@chakra-ui/react'
import { timeSince, getConImg } from 'utils'

const ConnectionRow = ({ item, handleEdit, handleDelete }) => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  return (
    <>
      <Tr>
        <Td>
          <Switch id='status' isChecked={item.enabled} readOnly />
        </Td>
        <Td mt={2} px={8}>
          <Flex direction={'row'} gap={4} alignItems={'center'}>
            <Image src={getConImg(item.connector.name)} width={7} height={7} />
            <Flex direction={'column'} gap={1} alignItems={'start'}>
              <Text fontSize='sm' fontWeight={600}>
                {item.name}
              </Text>
            </Flex>
          </Flex>
        </Td>
        <Td mt={2} px={8} fontSize={'sm'}>
          {item.username}
        </Td>
        <Td mt={2} px={8} fontSize={'sm'}>
          {timeSince(item.updatedAt)}
        </Td>
        <Td mt={2} px={8}>
          <Flex direction={'row'} gap={4} alignItems={'start'}>
            <EditIcon
              color={'blue.500'}
              cursor={'pointer'}
              onClick={() => handleEdit(item)}
            />

            <DeleteIcon color={'red.400'} cursor={'pointer'} onClick={onOpen} />
          </Flex>
        </Td>
      </Tr>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Connection</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text fontSize={'lg'}>Deleting a connection will -</Text>
            <Flex flexDir={'column'} gap={1} mt={1}>
              {[
                '- Remove any associated images and tags from Interlynk',
                '- Remove scanned image data',
                '- Disables any Share Lynk associated with the associated images'
              ].map((item, index) => (
                <Text key={index} fontSize={'sm'}>
                  {item}
                </Text>
              ))}
            </Flex>
            <Text mt={4} fontSize={'sm'}>
              To stop Interlynk from syncing with this connection, you can
              disable the connection instead.
            </Text>
            <Text mt={4} fontSize={'sm'}>
              Are you sure you want to continue with deleting the connection ?
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button mr={3} onClick={onClose}>
              No
            </Button>
            <Button colorScheme='red' onClick={() => handleDelete(item.id)}>
              Yes
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

export default ConnectionRow
