import { useRef } from 'react'

import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Button,
  Text
} from '@chakra-ui/react'

const EditWarning = ({ isOpen, onClose, handleSave }) => {
  const cancelRef = useRef()

  const handleSubmit = () => {
    handleSave()
    onClose()
  }

  return (
    <AlertDialog
      isOpen={isOpen}
      onClose={onClose}
      leastDestructiveRef={cancelRef}
    >
      <AlertDialogOverlay>
        <AlertDialogContent>
          <AlertDialogHeader fontSize='lg' fontWeight='bold'>
            Unsaved Changes
          </AlertDialogHeader>

          <AlertDialogBody>
            <Text mt={2}>
              Saving will apply changes to this tab only. save other tabs
              separately to retain their data.
            </Text>
          </AlertDialogBody>

          <AlertDialogFooter>
            <Button ref={cancelRef} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme='blue' onClick={handleSubmit} ml={3}>
              Save Anyway
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  )
}

export default EditWarning
