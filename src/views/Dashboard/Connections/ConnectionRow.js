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
  Button,
  Skeleton,
  useToast
} from '@chakra-ui/react'
import { timeSince, getConImg } from 'utils'
import { useState } from 'react'
import { useEffect } from 'react'

const ConnectionRow = ({
  item,
  handleEdit,
  isLoading,
  handleDelete,
  organizationConnectorUpdate,
}) => {
  const toast = useToast()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [checked, setChecked] = useState(item.enabled ? true : false)

  const handleChange = (e) => {
    setChecked(e.target.checked ? true : false)
    updateConnection(e.target.checked)
  }

  const updateConnection = async (e) => {
    try {
      await organizationConnectorUpdate({
        variables: {
          id: item.id,
          name: item.name,
          enabled: e ? true : false
        }
      }).then(() => {
        if (e === false) {
          toast({
            description: 'Connections is disabled. You can not use it anymore',
            status: 'warning',
            duration: 2000,
            isClosable: true,
            position: 'top'
          })
        }
      })
    } catch (error) {
      console.error('Mutation error:', error)
    }
  }

  return (
    <>
      {isLoading ? (
        <Tr>
          <Td fontSize={'sm'} pl={1}>
            <Skeleton height='20px' />
          </Td>
          <Td fontSize={'sm'} pl={1}>
            <Skeleton height='20px' />
          </Td>
          <Td fontSize={'sm'} pl={1}>
            <Skeleton height='20px' />
          </Td>
          <Td fontSize={'sm'} pl={1}>
            <Skeleton height='20px' />
          </Td>
        </Tr>
      ) : (
        <Tr>
          <Td>
            <Switch id='status' isChecked={checked} onChange={handleChange} />
          </Td>
          <Td mt={2} px={8}>
            <Flex direction={'row'} gap={4} alignItems={'center'}>
              <Image
                src={getConImg(item.connector.name)}
                width={7}
                height={7}
              />
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

              <DeleteIcon
                color={'red.400'}
                cursor={'pointer'}
                onClick={onOpen}
              />
            </Flex>
          </Td>
        </Tr>
      )}

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
