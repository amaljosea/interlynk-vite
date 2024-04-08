import { useMutation } from '@apollo/client'

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

import { useGlobalState } from 'hooks/useGlobalState'

import { UpdateCompSupportOverride } from 'graphQL/Mutation'

const StatusModal = ({ isOpen, onClose, data, refetch }) => {
  const { id, enabled } = data
  const { totalRows, supportState } = useGlobalState()
  const { searchInput, field, direction } = supportState
  const [updateSupport] = useMutation(UpdateCompSupportOverride)

  const supportData = {
    search: searchInput === '' ? undefined : searchInput,
    first: totalRows,
    field: field,
    direction: direction
  }

  const onChangeStatus = async () => {
    await updateSupport({
      variables: { id: id, enabled: enabled === true ? false : true }
    }).then((res) => res?.data && refetch({ variables: { ...supportData } }))
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Disable Support</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Text>Disabling this entry will: </Text>
          <UnorderedList>
            <Flex flexDir={'column'} gap={1} mt={4}>
              {[`Remove this support detail from existing products`].map(
                (item, index) => (
                  <ListItem key={index}>{item}</ListItem>
                )
              )}
            </Flex>
          </UnorderedList>
          <Text mt={10}>Are you sure you wish to continue ?</Text>
        </ModalBody>
        <ModalFooter>
          <Button mr={3} onClick={onClose}>
            No
          </Button>
          <Button colorScheme={'blue'} onClick={onChangeStatus}>
            Yes
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default StatusModal
