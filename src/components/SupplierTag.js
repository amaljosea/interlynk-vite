import { Link, Stack, Text, Tooltip } from '@chakra-ui/react'
import { Tag, TagCloseButton, TagLabel } from '@chakra-ui/react'

import { useHasPermission } from 'hooks/useHasPermission'
import { useRouteFlags } from 'hooks/useRouteFlags'

const SupplierTag = ({ item, onDelete, editable }) => {
  const { isCustomerView } = useRouteFlags()
  const { contactName, contactEmail, url, name } = item || {}
  const supplierURL = url?.startsWith('http') ? item.url : `http://${url}`

  const updateSbom = useHasPermission({
    parentKey: 'view_sbom',
    childKey: 'update_sbom'
  })

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
    <Tag variant='subtle' colorScheme='orange' sx={{ h: 7, w: 'fit-content' }}>
      <Tooltip label={supplierInfo()}>
        <TagLabel>
          <Link href={url ? supplierURL : '#'} isExternal={url}>
            {name}
          </Link>
        </TagLabel>
      </Tooltip>
      {editable && !isCustomerView && updateSbom && (
        <TagCloseButton
          aria-label='supplier_delete'
          onClick={() => onDelete(item)}
        />
      )}
    </Tag>
  )
}

export default SupplierTag
