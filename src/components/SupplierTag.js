import {
  Link,
  Stack,
  Tag,
  TagCloseButton,
  TagLabel,
  TagRightIcon,
  Text,
  Tooltip
} from '@chakra-ui/react'

import { FaPen } from 'react-icons/fa6'

const SupplierTag = ({ key, item, premission, onEdit, onDelete, editable }) => {
  const { contactName, contactEmail, url, name } = item || {}
  const supplierURL = url?.startsWith('http') ? item.url : `http://${url}`
  return (
    <Tag
      height={7}
      key={key}
      variant='subtle'
      colorScheme='orange'
      w='fit-content'
    >
      <Tooltip
        label={
          <Stack dir='column' spacing={1}>
            <Text>Name: {name}</Text>
            {url && <Text>URL: {url}</Text>}
            {contactName && <Text>Contact Name: {contactName}</Text>}
            {contactEmail && <Text>Contact Email: {contactEmail}</Text>}
          </Stack>
        }
      >
        <TagLabel>
          <Link href={url ? supplierURL : '#'} isExternal={url}>
            {name}
          </Link>
        </TagLabel>
      </Tooltip>
      {editable && (
        <TagRightIcon
          as={FaPen}
          fontSize={12}
          opacity={0.5}
          onClick={onEdit}
          cursor={'pointer'}
          hidden={premission}
          _hover={{ opacity: 1 }}
        />
      )}
      <TagCloseButton hidden={premission} onClick={() => onDelete(item)} />
    </Tag>
  )
}

export default SupplierTag
