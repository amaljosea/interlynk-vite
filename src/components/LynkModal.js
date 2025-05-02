import {
  Box,
  Button,
  ButtonGroup,
  Divider,
  Flex, // eslint-disable-next-line no-restricted-imports
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text
} from '@chakra-ui/react'

import { useThemeColor } from 'hooks/useThemeColors'

const LynkModal = ({
  isOpen,
  onClose,
  onSubmit,
  title,
  isLoading,
  Icon,
  type,
  buttonText,
  disabled,
  children,
  hidden,
  leftFooterContent,
  rightFooterContent,
  buttonColor,
  maxW,
  maxH,
  noFooter = false,
  hideCancelButton = false
}) => {
  const { headingTextColor, primaryTextColor, secondaryTextInverse } =
    useThemeColor([
      'headingTextColor',
      'primaryTextColor',
      'secondaryTextInverse'
    ])
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

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(e)
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent
        borderRadius='16px'
        sx={{ maxW: maxW || '600px', maxH: maxH || '' }}
      >
        <form onSubmit={handleSubmit}>
          <ModalHeader paddingInline={'16px'}>
            <Flex alignItems='center' gap={3}>
              {Icon && <Icon color={headingTextColor} fontSize={20} />}
              {title && (
                <Text
                  aria-label='modal_header'
                  sx={{ fontWeight: 600, color: primaryTextColor }}
                >
                  {title}
                </Text>
              )}
            </Flex>
          </ModalHeader>
          <ModalCloseButton color={primaryTextColor} marginTop={1.5} />
          <Divider />
          <ModalBody paddingInline={'16px'} marginBlock={4}>
            {children}
          </ModalBody>
          <Divider hidden={noFooter} />
          <ModalFooter paddingInline={'16px'} hidden={noFooter}>
            <Flex
              sx={{ w: '100%', gap: 4, alignItems: 'center' }}
              justifyContent={
                isConfirmationModal || leftFooterContent
                  ? 'space-between'
                  : 'end'
              }
            >
              {leftFooterContent && <Box>{leftFooterContent}</Box>}
              <ButtonGroup ml={'auto'}>
                <Button
                  title='Cancel'
                  onClick={onClose}
                  variant='ghost'
                  hidden={hideCancelButton}
                  sx={{ fontWeight: 400, color: secondaryTextInverse }}
                >
                  Cancel
                </Button>
                <Button
                  type='submit'
                  title='Submit'
                  minWidth={!isLoading && 93}
                  isDisabled={isDisabled}
                  colorScheme={buttonColor ?? colorScheme}
                  isLoading={isLoading}
                  loadingText={loadingText}
                  hidden={hidden}
                >
                  {buttonLabel}
                </Button>
                {rightFooterContent && <Box>{rightFooterContent}</Box>}
              </ButtonGroup>
            </Flex>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  )
}

export default LynkModal
