import { useRef, useContext } from 'react'
import {
  Td,
  Tr,
  Badge,
  Button,
  useDisclosure,
  Tag,
  TagLabel
} from '@chakra-ui/react'
import SupplierModal from 'views/Sbom/components/SupplierModal'
import CheckModal from 'views/Sbom/components/CheckModal'
import GlobalContext from 'context/GlobalContext'
import { sevColor } from 'utils'

function HealthCheckRow(props) {
  const {
    id,
    healthId,
    severity,
    shortDesc,
    longDesc,
    status,
    updateIdenifier
  } = props

  const customerView = location.pathname.startsWith('/customer')

  const { healthCheckData, setHealthCheckData } = useContext(GlobalContext)

  const supplierBtn = useRef(null)

  const { isOpen, onOpen, onClose } = useDisclosure()

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

  const {
    isOpen: isIdentiferOpen,
    onOpen: onIdentiferOpen,
    onClose: onIdentiferClose
  } = useDisclosure()

  const handleOpen = () => {
    if (shortDesc === 'Primary Component') {
      return onCompOpen()
    }

    if (shortDesc === 'Supplier Name') {
      return onSupplierOpen()
    }

    if (shortDesc === 'Timestamp') {
      return onOpen()
    }

    if (shortDesc === 'Unique Identifier') {
      const newArray = [...healthCheckData]

      const updatedObjectIndex = newArray.findIndex((obj) => obj.id === id)

      if (updatedObjectIndex !== -1) {
        newArray[updatedObjectIndex].status = 'active'
      }

      setHealthCheckData(newArray)

      setTimeout(() => {
        updateIdenifier()
      }, 1000)
    }
  }

  return (
    <Tr>
      <Td pl={0} textTransform={'uppercase'}>
        {healthId}
      </Td>
      <Td>
        <Tag
          size='md'
          key='md'
          variant='subtle'
          colorScheme={sevColor(severity)}
          textTransform={'capitalize'}
        >
          <TagLabel>{severity}</TagLabel>
        </Tag>
      </Td>
      <Td>{shortDesc}</Td>
      <Td>{longDesc}</Td>
      <Td>
        {status === 'fix' ? (
          <Button size='sm' onClick={handleOpen} disabled={customerView}>
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
          <CheckModal
            id={id}
            shortDesc={shortDesc}
            isOpen={isCompOpen}
            onClose={onCompClose}
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

        {isOpen && (
          <CheckModal
            id={id}
            shortDesc={shortDesc}
            isOpen={isOpen}
            onClose={onClose}
          />
        )}

        {isIdentiferOpen && (
          <CheckModal
            id={id}
            shortDesc={shortDesc}
            isOpen={isIdentiferOpen}
            onClose={onIdentiferClose}
          />
        )}
      </Td>
    </Tr>
  )
}

export default HealthCheckRow
