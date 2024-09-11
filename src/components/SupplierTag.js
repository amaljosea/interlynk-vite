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

import { BsPencil } from 'react-icons/bs'

const SupplierTag = ({ key, item, premission, onEdit, onDelete, editable }) => {
  const { contactName, contactEmail, url, name } = item || {}
  const supplierURL = url?.startsWith('http') ? item.url : `http://${url}`
  return (
    <Tag size={'md'} key={key} variant='subtle' colorScheme='orange'>
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
          fontSize={12}
          as={BsPencil}
          cursor={'pointer'}
          onClick={onEdit}
          hidden={!premission}
        />
      )}
      <TagCloseButton hidden={!premission} onClick={() => onDelete(item)} />
    </Tag>
  )
}

export default SupplierTag
