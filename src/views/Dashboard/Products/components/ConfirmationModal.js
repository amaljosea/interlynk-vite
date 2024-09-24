import { Box, Flex, ListItem, Tag, Text, UnorderedList } from '@chakra-ui/react'

import LynkModal from 'components/LynkModal'

import {
  FaArrowRotateRight,
  FaBan,
  FaToggleOff,
  FaToggleOn
} from 'react-icons/fa6'
import { MdDelete, MdOutlineArchive, MdOutlineUnarchive } from 'react-icons/md'

const getIcon = (title) => {
  if (title.includes('Archive')) return MdOutlineArchive
  if (title.includes('Restore')) return MdOutlineUnarchive
  if (title.includes('Disable')) return FaToggleOff
  if (title.includes('Enable')) return FaToggleOn
  if (title.includes('Delete') || title.includes('Remove')) return MdDelete
  if (title.includes('Reprocess')) return FaArrowRotateRight
  if (title.includes('Cancel')) return FaBan
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
  isLoading = false,
  children
}) => {
  const Icon = getIcon(title)

  return (
    <LynkModal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={onConfirm}
      title={title}
      isLoading={isLoading}
      Icon={Icon}
      type='confirmation'
    >
      {name && (
        <Tag colorScheme='blue' mb={5} py={1.5}>
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
      {children && <Box>{children}</Box>}
      <br />
      <Text fontWeight={500}>Are you sure you want to proceed?</Text>
    </LynkModal>
  )
}

export default ConfirmationModal
