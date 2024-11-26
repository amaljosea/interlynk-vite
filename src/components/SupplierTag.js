import { isCustomerView } from 'utils'

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
  const customerView = isCustomerView()
  const { contactName, contactEmail, url, name } = item || {}
  const supplierURL = url?.startsWith('http') ? item.url : `http://${url}`
  return (
    <Tag
      key={key}
      variant='subtle'
      colorScheme='orange'
      sx={{ h: 7, w: 'fit-content' }}
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
          onClick={onEdit}
          hidden={premission}
          _hover={{ opacity: 1 }}
          aria-label='supplier_edit'
          sx={{ fontSize: 12, opacity: 0.5, cursor: 'pointer' }}
        />
      )}
      <TagCloseButton
        aria-label='supplier_delete'
        hidden={premission || customerView}
        onClick={() => onDelete(item)}
      />
    </Tag>
  )
}

export default SupplierTag
