import { useRef } from 'react'
import { Badge, Button, Td, Tr, useDisclosure } from '@chakra-ui/react'
import ComponentDrawer from 'components/Drawer/ComponentDrawer'
import SupplierModal from 'views/Sbom/components/SupplierModal'

function HealthCheckRow(props) {
  const { id, severity, shortDesc, longDesc, status } = props

  const customerView = location.pathname.startsWith('/customer')

  const supplierBtn = useRef(null)
  const compBtn = useRef(null)

  const {
    isOpen: isCompOpen,
    onOpen: onCompOpen,
    onClose: onCompClose
  } = useDisclosure()

  const {
    isOpen: isSupplierOpen,
    onOpen: onSupplierOpen,
    onClose: onSupplierClose
  } = useDisclosure()

  return (
    <Tr>
      <Td pl={0} textTransform={'uppercase'}>
        {id}
      </Td>
      <Td>{severity}</Td>
      <Td>{shortDesc}</Td>
      <Td>{longDesc}</Td>
      <Td>
        {status === 'fix' ? (
          <Button
            size='sm'
            onClick={
              shortDesc === 'Supplier Name' ? onSupplierOpen : onCompOpen
            }
            disabled={customerView}
          >
            Fix
          </Button>
        ) : (
          <Badge
            variant='solid'
            fontWeight={'medium'}
            colorScheme='green'
            p={1}
          >
            Active
          </Badge>
        )}

        {isCompOpen && (
          <ComponentDrawer
            isOpen={isCompOpen}
            onClose={onCompClose}
            btnRef={compBtn}
            component={''}
            version={''}
            license={''}
            type={''}
            cpes={[]}
            purl={''}
            primary={false}
            internal={false}
            refetch={null}
            suppliers={null}
            shortDesc={shortDesc}
          />
        )}

        {isSupplierOpen && (
          <SupplierModal
            id={id}
            btnRef={supplierBtn}
            refetch={null}
            isOpen={onSupplierOpen}
            onClose={onSupplierClose}
            suppliers={[]}
            shortDesc={shortDesc}
          />
        )}
      </Td>
    </Tr>
  )
}

export default HealthCheckRow
