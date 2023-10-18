import { ExternalLinkIcon } from '@chakra-ui/icons'
import {
  Flex,
  Text,
  Tag,
  TagLabel,
  Icon,
  Button,
  Link,
  Input,
  Tooltip,
  useColorModeValue
} from '@chakra-ui/react'
import Card from 'components/Card/Card'
import React, { useMemo, useState } from 'react'
import DataTable from 'react-data-table-component'
import { statusColor } from 'utils'

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

const CopyTable = ({ data }) => {
  const customerView = location.pathname.startsWith('/customer')

  const [selectedRows, setSelectedRows] = useState([])

  const textColor = useColorModeValue('gray.700', 'white')

  const sevColor = (cvss) => {
    if (cvss >= 9.0) {
      return 'red'
    } else if (cvss >= 7.0) {
      return 'orange'
    } else if (cvss >= 6.0) {
      return 'yellow'
    } else {
      return 'green'
    }
  }

  // COLUMNS
  const columns = [
    // CVE ID
    {
      id: 'cve',
      name: 'CVE ID',
      selector: (row) => {
        const { vuln } = row
        return (
          <Link href={linkURl(vuln.source, vuln.vulnId)} target={'_blank'}>
            <Flex direction='row' alignItems={'center'} gap={2}>
              <Icon
                as={ExternalLinkIcon}
                h={'16px'}
                w={'16px'}
                color={'blue.500'}
              />
              <Tooltip label={vuln.vulnId} placement={'top'}>
                <Text fontSize='sm' color={textColor}>
                  {vuln.vulnId !== null
                    ? `${vuln.vulnId?.substring(0, 15)}${
                        vuln.vulnId.length > 15 ? '...' : ''
                      }`
                    : ''}
                </Text>
              </Tooltip>
            </Flex>
          </Link>
        )
      },
      width: '200px'
    },
    // SEVERITY
    {
      id: 'serverity',
      name: 'SEVERITY',
      selector: (row) => '',
      width: '150px'
    },
    // SOURCE
    {
      id: 'source',
      name: 'SOURCE',
      selector: (row) => {
        const { vuln } = row
        return (
          <Tag
            size='sm'
            key='md'
            variant='solid'
            colorScheme={vuln.source === 'osv' ? 'red' : 'blue'}
            textTransform={'uppercase'}
            width={'100%'}
            alignItems={'center'}
            justifyContent={'center'}
          >
            <TagLabel>{vuln.source}</TagLabel>
          </Tag>
        )
      },
      width: '110px'
    },
    // CVSS
    {
      id: 'cvss',
      name: 'CVSS',
      selector: (row) => {
        const { vuln } = row
        return (
          <Flex minWidth='max-content' alignItems='center' gap='2'>
            <Tag
              size='md'
              key='md'
              variant='subtle'
              colorScheme={sevColor(vuln.cvssScore)}
            >
              <TagLabel>{vuln.cvssScore ? vuln.cvssScore : 0}</TagLabel>
            </Tag>
          </Flex>
        )
      },
      width: '100px'
    },
    // COMPONENT
    {
      id: 'component',
      name: 'COMPONENT',
      selector: (row) => {
        const { component } = row
        return (
          <Tooltip label={component.name} placement='top'>
            <Text textTransform={'capitalize'}>
              {component.name !== null
                ? `${component.name?.substring(0, 30)}${
                    component.name.length > 30 ? '...' : ''
                  }`
                : ''}
            </Text>
          </Tooltip>
        )
      },
      width: '250px'
    },
    // VERSION
    {
      id: 'version',
      name: 'VERSION',
      selector: (row) => row.component.version,
      width: '130px'
    },
    // STATUS
    {
      id: 'status',
      name: 'STATUS',
      selector: (row) => {
        const { vexStatus } = row
        return (
          <Tag
            fontWeight={'normal'}
            variant='solid'
            size='sm'
            colorScheme={statusColor(vexStatus ? vexStatus.name : 'In Triage')}
          >
            {vexStatus !== null ? vexStatus.name : 'In Triage'}
          </Tag>
        )
      }
    }
    // // UPDATED AT
    // {
    //   id: 'updatedAt',
    //   name: 'UPDATED AT',
    //   selector: (row) => getFullDateAndTime(row.vuln.updatedAt),
    //   sortable: true
    // },
    // ACTION
  ]

  const subHeaderComponentMemo = useMemo(() => {
    return (
      <Flex
        width={'100%'}
        alignItems={'center'}
        justifyContent={'space-between'}
      >
        <Input
          width={'400px'}
          id='search'
          type='text'
          placeholder='Search'
          aria-label='Search Input'
        />
      </Flex>
    )
  }, [])

  const linkURl = (type, id) => {
    if (type === 'osv') {
      return `https://osv.dev/vulnerability/${id}`
    } else {
      return `https://nvd.nist.gov/vuln/detail/${id}`
    }
  }

  return (
    <Card py={6}>
      {data.nodes.length > 0 ? (
        <Flex flexDir={'column'} width={'100%'} mt={2}>
          <DataTable
            columns={columns}
            data={data.nodes}
            customStyles={customStyles}
            progressPending={data.length === 0}
            subHeader
            subHeaderComponent={subHeaderComponentMemo}
            responsive={true}
            selectableRows={true}
            selectableRowSelected={(row) => row}
          />
        </Flex>
      ) : (
        <Flex
          width={'100%'}
          mt={4}
          alignItems={'center'}
          justifyContent={'center'}
        >
          <Text>No data found</Text>
        </Flex>
      )}
    </Card>
  )
}

export default CopyTable
