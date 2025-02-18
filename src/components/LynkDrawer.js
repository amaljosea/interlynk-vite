import {
  Box,
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
  subtitle,
  isOpen,
  onClose,
  isDisabled,
  onSubmit,
  isLoading,
  size = 'md',
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
      size={size}
      isOpen={isOpen}
      onClose={onClose}
      closeOnOverlayClick={false}
      placement='right'
    >
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton mt={'7px'} />
        <DrawerHeader
          fontWeight='500'
          borderBottomWidth='1px'
          paddingInline={'16px'}
        >
          {title}
          {subtitle && <Box mt={1}>{subtitle}</Box>}
        </DrawerHeader>

        <DrawerBody paddingInline={'16px'} overflowX={'hidden'}>
          {children}
        </DrawerBody>
        <Divider hidden={noFooter} />
        <DrawerFooter paddingInline={'16px'} hidden={noFooter}>
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
