import {
  Divider,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  HStack
} from '@chakra-ui/react'
import { Button } from '@chakra-ui/react'

import { useThemeColor } from 'hooks/useThemeColors'

const LynkDrawer = ({
  title,
  isOpen,
  onClose,
  isDisabled,
  onSubmit,
  isLoading,
  buttonLabel = 'Save',
  buttonTitle = 'Save',
  cancelButtonTitle = 'Cancel',
  noFooter = false,
  hideCancelButton = false,
  children
}) => {
  const { secondaryTextInverse } = useThemeColor(['secondaryTextInverse'])
  return (
    <Drawer
      size='md'
      isOpen={isOpen}
      placement='right'
      onClose={onClose}
      closeOnOverlayClick={false}
    >
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton mt={1} />
        <DrawerHeader fontWeight='500' borderBottomWidth='1px'>
          {title}
        </DrawerHeader>

        <DrawerBody overflowX={'hidden'} padding={'20px'}>
          {children}
        </DrawerBody>
        <Divider hidden={noFooter} />
        <DrawerFooter hidden={noFooter}>
          <HStack spacing={3}>
            <Button
              title={cancelButtonTitle}
              fontWeight={400}
              color={secondaryTextInverse}
              variant='ghost'
              onClick={onClose}
              hidden={hideCancelButton}
            >
              {cancelButtonTitle}
            </Button>
            <Button
              colorScheme='blue'
              isLoading={isLoading}
              isDisabled={isDisabled}
              onClick={onSubmit}
              title={buttonTitle}
            >
              {buttonLabel}
            </Button>
          </HStack>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

export default LynkDrawer
