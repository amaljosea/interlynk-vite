import { useMutation } from '@apollo/client'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Text,
  Stack
} from '@chakra-ui/react'
import GlobalContext from 'context/GlobalContext'
import { DeleteComponent } from 'graphQL/Mutation'
import { useContext } from 'react'
import { useLocation } from 'react-router-dom'

const ComponentModal = ({ isOpen, onClose, id, refetch, after }) => {
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)

  const productId = queryParams.get('p')
  const sbomId = queryParams.get('sbom')

  const { compDirection, compField, totalRows } = useContext(GlobalContext)

  const [deleteComponent] = useMutation(DeleteComponent, {
    onCompleted: () =>
      refetch({
        variables: {
          projectId: productId,
          sbomId: sbomId,
          first: totalRows,
          after: after,
          field: compField,
          direction: compDirection
        }
      })
  })

  const handleDelete = async () => {
    try {
      await deleteComponent({
        variables: {
          id: id,
          sbomId: sbomId
        }
      }).then(() => onClose())
    } catch (error) {
      console.error('Mutation error:', error)
    }
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
              Cancel
            </Button>
            <Button colorScheme='blue' onClick={handleDelete}>
              Submit
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

export default ComponentModal
