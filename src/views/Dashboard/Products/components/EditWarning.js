import { TabContext } from 'context/TabContext'
import { useContext, useRef } from 'react'

import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Button,
  Text,
  chakra
} from '@chakra-ui/react'

const EditWarning = ({ isOpen, onClose, handleSave }) => {
  const cancelRef = useRef()
  const { pendingTabIndex } = useContext(TabContext)

  const tabName = () => {
    if (pendingTabIndex === 0) {
      return 'Details'
    } else if (pendingTabIndex === 1) {
      return 'Identifiers'
    } else if (pendingTabIndex === 2) {
      return 'Supplier'
    } else if (pendingTabIndex === 3) {
      return 'Links'
    } else if (pendingTabIndex === 4) {
      return 'Relations'
    }
  }

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
            {/* <Text>
              Found unsaved field in
              <chakra.span color={'blue.500'}> {tabName()} </chakra.span>
              tab
            </Text> */}
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
