import {
  Box,
  Divider, // eslint-disable-next-line no-restricted-imports
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
  placement = 'right',
  noHeader = false,
  children
}) => {
  const { secondaryTextInverse } = useThemeColor(['secondaryTextInverse'])
  return (
    <Drawer
      size={size}
      isOpen={isOpen}
      onClose={onClose}
      closeOnOverlayClick={false}
      placement={placement}
    >
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton mt={'7px'} aria-label='comp_close' />
        <DrawerHeader
          fontWeight='500'
          borderBottomWidth='1px'
          paddingInline={'16px'}
          hidden={noHeader}
        >
          {title}
          {subtitle && <Box mt={1}>{subtitle}</Box>}
        </DrawerHeader>

        <DrawerBody
          paddingInline={'16px'}
          overflowX={'hidden'}
          sx={{
            '&::-webkit-scrollbar': {
              display: 'none'
            },
            '-ms-overflow-style': 'none',
            'scrollbar-width': 'none'
          }}
        >
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
              aria-label='drawer_submit'
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
