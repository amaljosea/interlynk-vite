import { isCustomerView } from 'utils'

import { Link, Stack, Text, Tooltip } from '@chakra-ui/react'
import { Tag, TagCloseButton, TagLabel, TagRightIcon } from '@chakra-ui/react'

import { FaPen } from 'react-icons/fa6'

const SupplierTag = ({ key, item, premission, onEdit, onDelete, editable }) => {
  const customerView = isCustomerView()
  const { contactName, contactEmail, url, name } = item || {}
  const supplierURL = url?.startsWith('http') ? item.url : `http://${url}`

  const supplierInfo = () => {
    return (
      <Stack dir='column' spacing={1}>
        <Text>Name: {name}</Text>
        {url && <Text>URL: {url || 'N/A'}</Text>}
        {contactName && <Text>Contact Name: {contactName || 'N/A'}</Text>}
        {contactEmail && <Text>Contact Email: {contactEmail || 'N/A'}</Text>}
      </Stack>
    )
  }

  return (
    <Tag
      key={key}
      variant='subtle'
      colorScheme='orange'
      sx={{ h: 7, w: 'fit-content' }}
    >
      <Tooltip label={supplierInfo()}>
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
