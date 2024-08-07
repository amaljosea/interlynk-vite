import React from 'react'

import {
  Button,
  Divider,
  Flex,
  ListItem,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spinner,
  Stack,
  Tag,
  Text,
  UnorderedList
} from '@chakra-ui/react'

import { FaToggleOff, FaToggleOn } from 'react-icons/fa6'
import { MdDelete, MdOutlineArchive, MdOutlineUnarchive } from 'react-icons/md'

const getIcon = (title) => {
  if (title.includes('Archive')) return MdOutlineArchive
  if (title.includes('Restore')) return MdOutlineUnarchive
  if (title.includes('Disable')) return FaToggleOff
  if (title.includes('Enable')) return FaToggleOn
  if (title.includes('Delete')) return MdDelete
  return null
}

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  name,
  title,
  description,
  items,
  isLoading = false
}) => {
  const Icon = getIcon(title)
  const colorScheme =
    title.includes('Restore') || title.includes('Enable') ? 'green' : 'red'

  const loadingText = title.includes('Delete') ? 'Deleting...' : 'Updating...'

  return (
    <Modal isOpen={isOpen} onClose={onClose} size='lg'>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <Flex alignItems='center' gap={3}>
            {Icon && <Icon color='#60686F' />}
            {title && <Text fontWeight={500}>{title}</Text>}
          </Flex>
        </ModalHeader>
        <ModalCloseButton />
        <Divider />
        <ModalBody mb={2}>
          {name && (
            <Tag colorScheme='blue' mb={5} mt={3}>
              <Text fontWeight={400} wordBreak={'break-all'}>
                {name}
              </Text>
            </Tag>
          )}
          {description && <Text fontWeight={300}>{description}</Text>}
          {items && (
            <UnorderedList ml={26} mt={2}>
              <Flex flexDir={'column'} gap={1}>
                {items?.map((item, index) => (
                  <ListItem key={index}>
                    <Text fontWeight={300}>{item}</Text>
                  </ListItem>
                ))}
              </Flex>
            </UnorderedList>
          )}
          <br />
          <Text>Are you sure you want to proceed?</Text>
        </ModalBody>
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
                mr={3}
                onClick={onClose}
                fontWeight={400}
                color={'#60686F'}
                variant='ghost'
              >
                Cancel
              </Button>
              <Button
                onClick={onConfirm}
                width={!isLoading && 93}
                disabled={isLoading}
                colorScheme={colorScheme}
              >
                {isLoading ? loadingText : 'Yes'}
              </Button>
            </Stack>
          </Flex>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default ConfirmationModal
