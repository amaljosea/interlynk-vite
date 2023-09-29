// Chakra imports
import { ExternalLinkIcon } from '@chakra-ui/icons'
import {
  Flex,
  Text,
  useDisclosure,
  Tag,
  TagLabel,
  Icon,
  useColorModeValue,
  Button,
  Link,
  Input,
  Box
} from '@chakra-ui/react'
import DataTable from 'react-data-table-component'
import { FaEllipsisV } from 'react-icons/fa'
import { useState, useRef, useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { sevColor } from 'utils'
import StatusDrawer from 'components/Drawer/StatusDrawer'

const customStyles = {
  headCells: {
    style: {
      fontWeight: 'bold',
      color: '#2D3748',
      fontSize: '12px',
      letterSpacing: '1px'
    }
  }
}

const statusColor = (status) => {
  if (status && status === 'Fixed') {
    return 'blue'
  } else if (status && status === 'Not Affected') {
    return 'green'
  } else if (status && status === 'Affected') {
    return 'red'
  } else if (status && status === 'False Positive') {
    return 'gray'
  } else {
    return 'cyan'
  }
}

const FilterComponent = ({ filterText, onFilter, onClear }) => (
  <>
    <Input
      width={'300px'}
      marginRight={'auto'}
      id='search'
      type='text'
      placeholder='Search'
      aria-label='Search Input'
      value={filterText}
      onChange={onFilter}
    />
  </>
)

const VulnTable = ({ data }) => {
  const location = useLocation()
  const customerView = location.pathname.startsWith('/customer')

  const textColor = useColorModeValue('gray.700', 'white')

  const [activeRow, setActiveRow] = useState(null)
  const [vulData, setVulData] = useState([])

  const [filterText, setFilterText] = useState('')
  const [resetPaginationToggle, setResetPaginationToggle] = useState(false)

  const filteredItems = data.filter(
    (item) =>
      (item.cve && item.cve.toLowerCase().includes(filterText.toLowerCase())) ||
      (item.component &&
        item.component.toLowerCase().includes(filterText.toLowerCase()))
  )

  const btnRef = useRef(null)

  const { isOpen, onOpen, onClose } = useDisclosure()

  const columns = [
    // CVE ID
    {
      id: 'cve',
      name: 'CVE ID',
      selector: (row) => {
        const { cve } = row
        return (
          <Link
            href={`https://nvd.nist.gov/vuln/detail/${cve}`}
            target={'_blank'}
          >
            <Flex direction='row' alignItems={'center'} gap={2}>
              <Icon as={ExternalLinkIcon} h={'16px'} w={'16px'} />
              <Text fontSize='sm' color={textColor}>
                {cve}
              </Text>
            </Flex>
          </Link>
        )
      },
      width: '300px'
    },
    // SEVERITY
    {
      id: 'serverity',
      name: 'SEVERITY',
      selector: (row) => (
        <Text textTransform={'capitalize'}>{row.severity}</Text>
      )
    },
    // CVSS
    {
      id: 'cvss',
      name: 'CVSS',
      selector: (row) => {
        const { cvss, severity } = row
        return (
          <Flex minWidth='max-content' alignItems='center' gap='2'>
            <Tag
              size='md'
              key='md'
              variant='subtle'
              colorScheme={sevColor(`${severity}`)}
            >
              <TagLabel>{cvss}</TagLabel>
            </Tag>
          </Flex>
        )
      }
    },
    // COMPONENT
    {
      id: 'component',
      name: 'COMPONENT',
      selector: (row) => (
        <Text textTransform={'capitalize'}>{row.component}</Text>
      )
    },
    // VERSION
    {
      id: 'version',
      name: 'VERSION',
      selector: (row) => row.version
    },
    {
      id: 'source',
      name: 'SOURCE',
      selector: (row) => (
        <Tag size='sm' variant='outline' colorScheme='blue'>
          {row.source}
        </Tag>
      )
    },
    {
      id: 'status',
      name: 'STATUS',
      selector: (row) => {
        const { status } = row
        return (
          <Tag
            fontWeight={'normal'}
            variant='solid'
            size='sm'
            colorScheme={statusColor(status)}
          >
            {status}
          </Tag>
        )
      }
    },
    // ACTION
    {
      id: 'action',
      name: 'ACTION',
      selector: (row) => {
        return (
          <>
            {!customerView && (
              <Button
                p='0px'
                bg='transparent'
                ref={btnRef}
                onClick={() => {
                  setActiveRow(row)
                  onOpen()
                }}
              >
                <Icon as={FaEllipsisV} color='gray.400' cursor='pointer' />
              </Button>
            )}
          </>
        )
      },
      omit: customerView
    }
  ]

  const subHeaderComponentMemo = useMemo(() => {
    const handleClear = () => {
      if (filterText) {
        setResetPaginationToggle(!resetPaginationToggle)
        setFilterText('')
      }
    }

    return (
      <FilterComponent
        onFilter={(e) => setFilterText(e.target.value)}
        onClear={handleClear}
        filterText={filterText}
      />
    )
  }, [filterText, resetPaginationToggle])

  return (
    <>
      {data.length > 0 ? (
        <Flex flexDir={'column'} width={'100%'}>
          <DataTable
            columns={columns}
            data={filteredItems}
            customStyles={customStyles}
            progressPending={data.length === 0}
            subHeader
            subHeaderComponent={subHeaderComponentMemo}
            responsive={true}
            selectableRows={true}
          />
        </Flex>
      ) : (
        <Flex
          width={'100%'}
          mt={4}
          alignItems={'center'}
          justifyContent={'center'}
        >
          <Text>No vulnerabilities data found</Text>
        </Flex>
      )}

      {/* ACTIONS */}
      {activeRow !== null && (
        <>
          {isOpen && (
            <StatusDrawer
              isOpen={isOpen}
              onClose={onClose}
              btnRef={btnRef}
              component={activeRow.component}
              version={activeRow.version}
              imageInfo={null}
              imgVersionId={null}
              cve={activeRow.cve}
              textColor={textColor}
              setSelectVersion={null}
              vulnRefetch={null}
              status={activeRow.status}
              setVulData={setVulData}
            />
          )}
        </>
      )}
    </>
  )
}

export default VulnTable
