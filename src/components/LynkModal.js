import {
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
  disabled = false,
  children
}) => {
  const isConfirmationModal = type === 'confirmation'

  const colorScheme =
    title.includes('Restore') || title.includes('Enable')
      ? 'green'
      : isConfirmationModal
        ? 'red'
        : 'blue'

  const loadingText = title.includes('Delete') ? 'Deleting...' : 'Updating...'

  const isDisabled = disabled || isLoading

  const buttonLabel = isLoading
    ? loadingText
    : isConfirmationModal
      ? 'Yes'
      : buttonText
  return (
    <Modal isCentered isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent maxW={'600px'}>
        <ModalHeader>
          <Flex alignItems='center' gap={3}>
            {Icon && <Icon color='#60686F' />}
            {title && <Text fontWeight={600}>{title}</Text>}
          </Flex>
        </ModalHeader>
        <ModalCloseButton marginTop={1.5} marginRight={3.5} />
        <Divider />
        <ModalBody marginBlock={2}>{children}</ModalBody>
        <Divider />
        <ModalFooter>
          <Flex
            width={'100%'}
            alignItems={'center'}
            justifyContent={'space-between'}
            gap={4}
          >
            <Stack>{isLoading && <Spinner color={colorScheme} />}</Stack>
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
                width={!isLoading && 93}
                disabled={isDisabled}
                colorScheme={colorScheme}
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
