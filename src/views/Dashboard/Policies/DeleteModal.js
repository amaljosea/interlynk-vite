import { useMutation } from '@apollo/client'
import { useParams } from 'react-router-dom'

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
  UnorderedList,
  useToast
} from '@chakra-ui/react'

import { useGlobalState } from 'hooks/useGlobalState'

import { PolicyDelete } from 'graphQL/Mutation'

const DeleteModal = ({ isOpen, onClose, data, refetch }) => {
  const toast = useToast()
  const params = useParams()
  const productId = params.productid
  const { id } = data
  const { totalRows, policyState } = useGlobalState()
  const { searchInput } = policyState
  const [deletePolicy] = useMutation(PolicyDelete)

  const policyData = {
    projectId: productId || undefined,
    search: productId || searchInput === '' ? undefined : searchInput,
    first: totalRows
  }

  const onDeletePolicy = async () => {
    await deletePolicy({ variables: { id } }).then((res) => {
      const errors = res?.data?.policyDelete?.errors
      if (errors?.length > 0) {
        toast({
          description: errors[0],
          status: 'error',
          position: 'top',
          duration: 2000
        })
      } else {
        refetch({ variables: { ...policyData } })
        onClose()
      }
    })
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Archive Policy</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Text>Archiving this policy will : </Text>
          <UnorderedList>
            <Flex flexDir={'column'} gap={1} mt={4}>
              {[
                `Disable the execution of this policy on products`,
                `Remove results of this policy's execution from existing products`,
                `Remove this policy from the list of available policies`
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
          <Button colorScheme={'red'} onClick={onDeletePolicy}>
            Yes
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default DeleteModal
