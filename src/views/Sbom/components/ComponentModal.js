import { useMutation } from '@apollo/client'
import { useParams } from 'react-router-dom'

import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Stack,
  Text
} from '@chakra-ui/react'

import { DeleteComponent } from 'graphQL/Mutation'

const ComponentModal = ({
  isOpen,
  onClose,
  id,
  fetchCompData,
  sbomRefetch
}) => {
  const params = useParams()
  const prodId = params.productid
  const sbomId = params.sbomid

  const [deleteComponent] = useMutation(DeleteComponent, {
    onCompleted: () => fetchCompData()
  })

  const handleDelete = async () => {
    await deleteComponent({
      variables: {
        id: id,
        sbomId: sbomId
      }
    }).then((res) => {
      if (res?.data) {
        sbomRefetch({ projectId: prodId, sbomId: sbomId })
        onClose()
      }
    })
  }

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Delete</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack direction={'column'} spacing={4}>
              <Text>
                Removing this component will remove it from the list and
                associated SBOM
              </Text>
              <Text>Are you sure you want to remove it ?</Text>
            </Stack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme='gray' mr={3} onClick={onClose}>
              No
            </Button>
            <Button colorScheme='red' onClick={handleDelete}>
              Yes
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

export default ComponentModal
