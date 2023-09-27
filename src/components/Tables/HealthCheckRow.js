import { useRef, useContext, useState } from 'react'
import {
  Td,
  Tr,
  Badge,
  Button,
  useDisclosure,
  Tag,
  TagLabel,
  Stack
} from '@chakra-ui/react'
import SupplierModal from 'views/Sbom/components/SupplierModal'
import CheckModal from 'views/Sbom/components/CheckModal'
import GlobalContext from 'context/GlobalContext'
import { sevColor } from 'utils'
import ComponentDrawer from 'components/Drawer/ComponentDrawer'

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

  const [isIgnored, setIsIgnored] = useState(false)

  const supplierBtn = useRef(null)
  const compBtn = useRef(null)

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
    isOpen: isPrimaryOpen,
    onOpen: onPrimaryOpen,
    onClose: onPrimaryClose
  } = useDisclosure()

  const handleOpen = () => {
    if (shortDesc === 'Primary Component') {
      return onPrimaryOpen()
    }

    if (shortDesc === 'Supplier Name') {
      return onSupplierOpen()
    }

    if (shortDesc === 'Timestamp') {
      return onOpen()
    }

    if (
      shortDesc === 'Primary Component Version' ||
      shortDesc === 'Component Name' ||
      shortDesc === 'Component Version' ||
      shortDesc === 'Author Name' ||
      shortDesc === 'Component Relationships'
    ) {
      return onCompOpen()
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

  const updateIssue = () => {
    const updatedItems = healthCheckData.map((item) => {
      if (item.id === id) {
        return { ...item, status: 'ignored' }
      }
      return item
    })

    const selectedRow = updatedItems.find((row) => row.id === id)
    const filteredData = healthCheckData.filter((row) => row.id !== id)
    setHealthCheckData([...filteredData, selectedRow])
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
        {status === 'fix' && (
          <Stack direction={'row'} alignItems={'center'} spacing={2}>
            <Button size='sm' onClick={handleOpen} disabled={customerView}>
              Fix
            </Button>
            <Button size='sm' onClick={updateIssue} disabled={customerView}>
              Ignore
            </Button>
          </Stack>
        )}

        {status === 'active' && (
          <Button size='sm' variant='solid' colorScheme='whatsapp'>
            Fixed
          </Button>
        )}

        {status === 'ignored' && (
          <Button size='sm' variant='solid' colorScheme='blackAlpha'>
            Ignored
          </Button>
        )}

        {isPrimaryOpen && (
          <CheckModal
            id={id}
            shortDesc={shortDesc}
            isOpen={isPrimaryOpen}
            onClose={onPrimaryClose}
          />
        )}

        {isCompOpen && (
          <ComponentDrawer
            isOpen={isCompOpen}
            onClose={onCompClose}
            btnRef={compBtn}
            component={''}
            version={''}
            license={['0BSD']}
            type={'application'}
            cpes={['cpe:2.3:a:vendor:product:1.0:*:*:*:*:*:*:*']}
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

        {isOpen && (
          <CheckModal
            id={id}
            shortDesc={shortDesc}
            isOpen={isOpen}
            onClose={onClose}
          />
        )}
      </Td>
    </Tr>
  )
}

export default HealthCheckRow
