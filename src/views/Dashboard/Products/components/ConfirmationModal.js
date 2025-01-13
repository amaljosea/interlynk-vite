import { useState } from 'react'
import { getConfirmatonModalIcon } from 'utils'

import {
  Box,
  Flex,
  Input,
  ListItem,
  Stack,
  Tag,
  Text,
  UnorderedList
} from '@chakra-ui/react'

import LynkModal from 'components/LynkModal'

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
  const Icon = getConfirmatonModalIcon(title)

  const [input, setInput] = useState('')
  const warning = title === 'Delete Product'

  return (
    <LynkModal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={onConfirm}
      title={title}
      isLoading={isLoading}
      Icon={Icon}
      disabled={warning && input !== 'DELETE'}
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
      {warning ? (
        <Stack>
          <Text>
            Please type <strong>DELETE</strong> to confirm
          </Text>
          <Input
            fontSize='sm'
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
        </Stack>
      ) : (
        <Text fontWeight={500}>Are you sure you want to proceed?</Text>
      )}
    </LynkModal>
  )
}

export default ConfirmationModal
