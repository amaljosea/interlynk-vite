import { useMutation } from '@apollo/client'
import {Modal,ModalOverlay,ModalContent,ModalHeader,ModalFooter,ModalBody,ModalCloseButton,UnorderedList,Flex,Text,Button,ListItem,useToast } from '@chakra-ui/react'
import { DeleteCompSupportOverride } from 'graphQL/Mutation'
import { useGlobalState } from 'hooks/useGlobalState'

const DeleteModal = ({ isOpen, onClose, data, refetch }) => {
  const { id } = data
  const toast = useToast()
  const { totalRows, supportState } = useGlobalState()
  const { searchInput, field, direction } = supportState
  const [deleteSupport] = useMutation(DeleteCompSupportOverride)

  const supportData = { search: searchInput === '' ? undefined : searchInput, first: totalRows, field, direction }

  const onDeleteSupport = async () => {
    await deleteSupport({ variables: { id } }).then((res) => {
      const errors = res?.data?.componentSupportOverrideDelete?.errors
      if(errors?.length > 0) {
        toast({description: errors[0], status:'error',position:'top',duration:3000})
      } else {
        refetch({ variables: { ...supportData } })
        onClose()
      }
    })
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Archive Support</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Text>Archiving this support will : </Text>
          <UnorderedList>
            <Flex flexDir={'column'} gap={1} mt={4}>
              {[`Disable the execution of this support on products`,`Remove results of this support from existing products`,`Remove this support from the list of available supports`].map((item, index) => (
                <ListItem key={index}>{item}</ListItem>
              ))}
            </Flex>
          </UnorderedList>
          <Text mt={10}>Are you sure you wish to continue ?</Text>
        </ModalBody>
        <ModalFooter>
          <Button mr={3} onClick={onClose}>No</Button>
          <Button colorScheme={'red'} onClick={onDeleteSupport} >Yes</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default DeleteModal
