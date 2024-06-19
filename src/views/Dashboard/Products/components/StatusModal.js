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

import { UpdateProjectGroup } from 'graphQL/Mutation'

const StatusModal = ({ isOpen, onClose, group }) => {
  const { id, enabled } = group

  const [projectGroupUpdate, { loading }] = useMutation(UpdateProjectGroup)

  // TOGGLE STATUS
  const toggleStatus = async () => {
    await projectGroupUpdate({
      variables: {
        id: id,
        enabled: enabled === true ? false : true
      }
    }).then((res) => {
      const errors = res?.data?.projectGroupUpdate?.errors
      if (errors?.length === 0) {
        console.log(errors[0])
      } else {
        onClose()
      }
    })
  }

  const status = enabled ? 'Disable' : 'Enable'

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{status} Product</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Text>{status} this product will: </Text>
          <UnorderedList>
            <Flex flexDir={'column'} gap={1} mt={4}>
              {[
                `${status} this product, its versions and SBOMs`,
                `${status} access to the product for all users`,
                `${status} uploads of SBOMs to this product`
              ].map((item, index) => (
                <ListItem key={index}>{item}</ListItem>
              ))}
            </Flex>
          </UnorderedList>
          <Text mt={10}>Are you sure you wish to continue?</Text>
        </ModalBody>
        <ModalFooter>
          <Button mr={3} onClick={onClose}>
            No
          </Button>
          <Button
            isLoading={loading}
            onClick={toggleStatus}
            loadingText='Updating....'
            colorScheme={enabled ? 'red' : 'green'}
          >
            Yes
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default StatusModal
