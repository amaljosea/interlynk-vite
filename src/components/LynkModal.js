import {
  Box,
  Button,
  Divider,
  Flex,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spinner,
  Stack,
  Text
} from '@chakra-ui/react'

const LynkModal = ({
  isOpen,
  onClose,
  onSubmit,
  title,
  isLoading = false,
  Icon,
  type,
  buttonText,
  disabled,
  children,
  hidden,
  leftFooterContent,
  buttonColor,
  maxW,
  maxH
}) => {
  const isConfirmationModal = type === 'confirmation'

  const colorScheme =
    title.includes('Restore') || title.includes('Enable')
      ? 'green'
      : isConfirmationModal
        ? 'red'
        : 'blue'

  const loadingText = isConfirmationModal
    ? title.includes('Delete')
      ? 'Deleting...'
      : 'Updating...'
    : buttonText

  const isDisabled = disabled || isLoading

  const buttonLabel = isLoading
    ? loadingText
    : isConfirmationModal
      ? 'Yes'
      : buttonText
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent maxW={maxW || '600px'} maxH={maxH || ''}>
        <ModalHeader paddingInline={'16px'}>
          <Flex alignItems='center' gap={3}>
            {Icon && <Icon color='#60686F' />}
            {title && <Text fontWeight={600}>{title}</Text>}
          </Flex>
        </ModalHeader>
        <ModalCloseButton marginTop={1.5} />
        <Divider />
        <ModalBody paddingInline={'16px'} marginBlock={4} overflow={'scroll'}>
          {children}
        </ModalBody>
        <Divider />
        <ModalFooter paddingInline={'16px'}>
          <Flex
            width={'100%'}
            alignItems={'center'}
            justifyContent={isConfirmationModal ? 'space-between' : 'end'}
            gap={4}
          >
            {leftFooterContent && <Box mr='auto'>{leftFooterContent}</Box>}
            {isConfirmationModal && (
              <Stack>{isLoading && <Spinner color={colorScheme} />}</Stack>
            )}
            <Stack direction='row' alignItems='center' gap={1}>
              <Button
                onClick={onClose}
                fontWeight={400}
                color={'#60686F'}
                variant='ghost'
              >
                Cancel
              </Button>
              <Button
                onClick={onSubmit}
                minWidth={!isLoading && 93}
                isDisabled={isDisabled}
                colorScheme={buttonColor ?? colorScheme}
                isLoading={isLoading}
                loadingText={loadingText}
                hidden={hidden}
              >
                {buttonLabel}
              </Button>
            </Stack>
          </Flex>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default LynkModal
