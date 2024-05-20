import { useMutation } from '@apollo/client'
import { useState } from 'react'

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

const StatusModal = ({ isOpen, onClose, group, grouId, refetch }) => {
  const [isLoading, setIsLoading] = useState(false)

  const { id, enabled } = group

  const [projectGroupUpdate] = useMutation(UpdateProjectGroup)

  // TOGGLE STATUS
  const toggleStatus = async () => {
    setIsLoading(true)
    await projectGroupUpdate({
      variables: {
        id: id,
        enabled: enabled === true ? false : true
      }
    })
      .then((res) => {
        if (res?.data) {
          setIsLoading(false)
          if (grouId) {
            refetch({ id: id })
          } else {
            refetch()
          }
        }
      })
      .finally(() => onClose())
  }
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{enabled ? 'Disable' : 'Enable'} Product</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Text>{enabled ? 'Disable' : 'Enable'} this product will: </Text>
          <UnorderedList>
            <Flex flexDir={'column'} gap={1} mt={4}>
              {[
                `${
                  enabled ? 'Disable' : 'Enable'
                } this product, its versions and SBOMs`,
                `${
                  enabled ? 'Disable' : 'Enable'
                } access to the product for all users`,
                `${
                  enabled ? 'Disable' : 'Enable'
                } uploads of SBOMs to this product`
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
            colorScheme={enabled ? 'red' : 'green'}
            onClick={toggleStatus}
            isLoading={isLoading}
            loadingText='Updating....'
          >
            Yes
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default StatusModal
