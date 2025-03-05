import { AddIcon } from '@chakra-ui/icons'
import { Button } from '@chakra-ui/react'

import { useHasPermission } from 'hooks/useHasPermission'
import { useRouteFlags } from 'hooks/useRouteFlags'

import { FaPen } from 'react-icons/fa6'

const ActiveBtn = ({ title, label, color, onClick, isArchived, editable }) => {
  const { isCustomerView } = useRouteFlags()

  const editSboms = useHasPermission({
    parentKey: 'view_sbom',
    childKey: 'update_sbom'
  })

  return (
    <Button
      size='xs'
      title={label}
      onClick={onClick}
      variant='unstyled'
      aria-label={label}
      sx={{
        color: color,
        ml: editable ? 1 : 0,
        display: 'flex',
        alignItems: 'center'
      }}
      leftIcon={editable ? <FaPen /> : <AddIcon />}
      hidden={isArchived || isCustomerView || !editSboms}
    >
      {title}
    </Button>
  )
}
export default ActiveBtn
