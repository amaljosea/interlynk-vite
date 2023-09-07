import React from 'react'
import { DeleteIcon, EditIcon, LinkIcon } from '@chakra-ui/icons'
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
import { FaEdit, FaLink, FaTrash, FaUnlink } from 'react-icons/fa'
import { useMutation } from '@apollo/client'
import { OrgConnectorValidate } from 'graphQL/Mutation'
import { useEffect } from 'react'
import Tooltip from 'components/Tooltip'

const ConnectionRow = ({
  item,
  handleEdit,
  isLoading,
  handleDelete,
  organizationConnectorUpdate
}) => {
  const toast = useToast()
  const { isOpen, onOpen, onClose } = useDisclosure()

  const {
    isOpen: isConnect,
    onOpen: onConnectOpen,
    onClose: onConnectClose
  } = useDisclosure()

  const [checked, setChecked] = useState(item.enabled ? true : false)
  const [connected, setConnected] = useState(false)

  const handleChange = (e) => {
    setConnected(e.target.checked ? true : false)
    if (item.enabled === false) {
      updateConnection()
    } else {
      onConnectOpen()
    }
  }

  const [organizationConnectorValidate, { data, loading }] = useMutation(
    OrgConnectorValidate
  )

  const updateConnection = async () => {
    try {
      await organizationConnectorUpdate({
        variables: {
          id: item.id,
          name: item.name,
          enabled: connected
        }
      }).then(() => {
        setChecked(connected)
        onConnectClose()
      })
    } catch (error) {
      console.error('Mutation error:', error)
    }
  }

  const handleValidate = async (id) => {
    try {
      await organizationConnectorValidate({
        variables: {
          id: id
        }
      })
    } catch (error) {
      console.error('Mutation error:', error)
    }
  }

  useEffect(() => {
    handleValidate(item.id)
  }, [item])

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
              <FaEdit
                color={'#3182CE'}
                cursor={'pointer'}
                onClick={() => handleEdit(item)}
              />

              {data &&
              data.organizationConnectorValidate?.errors.length === 0 ? (
                <Tooltip text='Connected'>
                  <FaLink
                    color={'#3182CE'}
                    cursor={'pointer'}
                    onClick={() => handleValidate(item.id)}
                  />
                </Tooltip>
              ) : (
                <Tooltip text='Not connected'>
                  <FaUnlink
                    color={'#3182CE'}
                    cursor={'pointer'}
                    onClick={() => handleValidate(item.id)}
                  />
                </Tooltip>
              )}

              <FaTrash color={'#F56565'} cursor={'pointer'} onClick={onOpen} />
            </Flex>
          </Td>
        </Tr>
      )}

      {/* delete */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Delete?</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text fontSize={'lg'}>Deleting this connection will: </Text>
            <br />
            <Flex flexDir={'column'} gap={2} mt={2}>
              {[
                'Remove connected images and tags',
                'Remove scan data for connected images',
                "Disable all Share Lynk's for connected images"
              ].map((item, index) => (
                <Text key={index} fontSize={'sm'}>
                  <li>{item}</li>
                </Text>
              ))}
            </Flex>
            <br />
            <Text mt={2} fontSize={'sm'}>
              Alternatively, you can disable the connection to prevent future
              scans while retaining existing data.
            </Text>
            <Text mt={4} fontSize={'sm'}>
              Are you sure you want to continue with the deletion?
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

      {/* connect status */}
      <Modal isOpen={isConnect} onClose={onConnectClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {connected === true ? 'Enable ' : 'Disable '} connection ?
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text mt={2} fontSize={'md'}>
              {connected === true
                ? 'Enabling connection will enable scanning of images'
                : 'Disabling connection will disable scanning of images in the future. Existing scan data will not change'}
            </Text>
            <Text mt={4} fontSize={'sm'}>
              Are you sure you want to{' '}
              {connected === true ? 'enable ' : 'disable '} the connection ?
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button
              mr={3}
              onClick={() => {
                setConnected(!connected)
                onConnectClose()
              }}
            >
              No
            </Button>
            <Button colorScheme='red' onClick={updateConnection}>
              Yes
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

export default ConnectionRow
