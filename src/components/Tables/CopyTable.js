import { ExternalLinkIcon } from '@chakra-ui/icons'
import {
  Flex,
  Text,
  Tag,
  TagLabel,
  Icon,
  Link,
  Tooltip,
  useColorModeValue
} from '@chakra-ui/react'
import Card from 'components/Card/Card'
import GlobalContext from 'context/GlobalContext'
import React, { useContext, useMemo, useState } from 'react'
import DataTable from 'react-data-table-component'
import { sevColor } from 'utils'

const customStyles = {
  headCells: {
    style: {
      fontWeight: 'bold',
      color: '#2D3748',
      fontSize: '12px',
      letterSpacing: '1px'
    }
  },
  subHeader: {
    style: {
      padding: 0,
      margin: 0
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
    return 'purple'
  } else if (status && status === 'In Triage') {
    return 'cyan'
  } else {
    return 'gray'
  }
}

const CopyTable = () => {
  const textColor = useColorModeValue('gray.700', 'white')

  const { setSelectedVulns, mergeData, currentSbom } = useContext(GlobalContext)

  // COLUMNS
  const columns = [
    // CVE ID
    {
      id: 'cve',
      name: 'ID',
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
                  {vuln.vulnId !== null ? vuln.vulnId : ''}
                </Text>
              </Tooltip>
            </Flex>
          </Link>
        )
      },
      wrap: true,
      width: '20%'
    },
    // SEVERITY
    {
      id: 'serverity',
      name: 'SEVERITY',
      selector: (row) => {
        const { vuln } = row
        return (
          <>
            {vuln.sev !== null ? (
              <Tag
                size='md'
                variant='subtle'
                width={'80px'}
                colorScheme={sevColor(`${vuln.sev}`)}
              >
                <TagLabel style={{ textTransform: 'capitalize' }} mx={'auto'}>
                  {vuln.sev}
                </TagLabel>
              </Tag>
            ) : (
              ''
            )}
          </>
        )
      }
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
      wrap: true
    },
    // VERSION
    {
      id: 'version',
      name: 'VERSION',
      selector: (row) => row.component.version,
      wrap: true
    },
    // CURRENT STATUS
    {
      id: 'currentStatus',
      name: 'CURRENT STATUS',
      selector: (row) => {
        const { vexStatus } = row
        return (
          <Tag
            size='md'
            variant='solid'
            width={'130px'}
            colorScheme={statusColor(
              vexStatus ? vexStatus.name : 'Unspecified'
            )}
          >
            <TagLabel style={{ textTransform: 'capitalize' }} mx={'auto'}>
              {vexStatus !== null ? vexStatus.name : 'Unspecified'}
            </TagLabel>
          </Tag>
        )
      },
      right: 'true'
    },
    // SELECTED STATUS
    {
      id: 'selectedStatus',
      name: 'IMPORT STATUS',
      selector: (row) => {
        const { importStatus } = row
        return (
          <Tag
            size='md'
            variant='solid'
            width={'130px'}
            colorScheme={statusColor(
              importStatus ? importStatus.name : 'Unspecified'
            )}
          >
            <TagLabel style={{ textTransform: 'capitalize' }} mx={'auto'}>
              {importStatus ? importStatus.name : 'Unspecified'}
            </TagLabel>
          </Tag>
        )
      },
      right: 'true'
    }
  ]

  const subHeaderComponentMemo = useMemo(() => {
    return (
      <Flex
        width={'100%'}
        alignItems={'center'}
        justifyContent={'space-between'}
      >
        <Text>
          {mergeData.length} of {currentSbom.length} selected for status Import
        </Text>
      </Flex>
    )
  }, [mergeData])

  const linkURl = (type, id) => {
    if (type === 'osv') {
      return `https://osv.dev/vulnerability/${id}`
    } else {
      return `https://nvd.nist.gov/vuln/detail/${id}`
    }
  }

  const handleChange = (state) => {
    setSelectedVulns(state.selectedRows)
    console.log(state)
  }

  return (
    <Flex mt={12} flexDir={'column'} width={'100%'} mb={4}>
      <DataTable
        columns={columns}
        data={mergeData}
        customStyles={customStyles}
        subHeader
        progressPending={mergeData ? false : true}
        subHeaderComponent={subHeaderComponentMemo}
        responsive={true}
        selectableRows={true}
        fixedHeader
        persistTableHead
        fixedHeaderScrollHeight='500px'
        onSelectedRowsChange={handleChange}
        // selectableRowSelected={(row) => row}
      />
    </Flex>
  )
}

export default CopyTable
