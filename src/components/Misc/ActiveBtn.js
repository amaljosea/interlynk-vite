import { Button } from '@chakra-ui/react'

import { useHasPermission } from 'hooks/useHasPermission'
import { useRouteFlags } from 'hooks/useRouteFlags'

import { LuCirclePlus, LuSquarePen } from 'react-icons/lu'

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
      hidden={isArchived || isCustomerView || !editSboms}
      leftIcon={
        editable ? <LuSquarePen size={18} /> : <LuCirclePlus size={18} />
      }
    >
      {title}
    </Button>
  )
}
export default ActiveBtn
