import { ExternalLinkIcon } from '@chakra-ui/icons'
import { Flex, Text, Tag, TagLabel, Icon, Link, Tooltip, useColorModeValue, Stack } from '@chakra-ui/react'
import { useGlobalState } from 'hooks/useGlobalState'
import React, { useMemo } from 'react'
import DataTable from 'react-data-table-component'
import { customStyles, sevColor } from 'utils'

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

  const { prodVulnState, dispatch } = useGlobalState()
  const { selectedVulns, mergeData } = prodVulnState
  const { prodVulnDispatch } = dispatch

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
              <Icon as={ExternalLinkIcon} h={'16px'} w={'16px'} color={'blue.500'} />
              <Tooltip label={vuln.vulnId} placement={'top'}>
                <Text fontSize='sm' color={textColor}>{vuln.vulnId !== null ? vuln.vulnId : ''}</Text>
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
              <Tag size='md' variant='subtle' width={'80px'} colorScheme={sevColor(`${vuln.sev}`)}>
                <TagLabel style={{ textTransform: 'capitalize' }} mx={'auto'}>{vuln.sev}</TagLabel>
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
      id: 'COMPONENTS_NAME',
      name: 'COMPONENT',
      selector: (row) => {
        const { component } = row
        return (
          <Stack direction='column' alignItems={'flex-start'} spacing={1} my={3}>
            <Text>{component?.name || ''}</Text>
            <Text>{component?.version || ''}</Text>
          </Stack>
        )
      },
      wrap: true,
      width: '250px',
      sortable: true
    },
    // CURRENT STATUS
    {
      id: 'currentStatus',
      name: 'CURRENT STATUS',
      selector: (row) => {
        const { vexStatus } = row
        return (
          <Tag size='md' variant='solid' width={'130px'} colorScheme={statusColor(vexStatus ? vexStatus.name : 'Unspecified')}>
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
          <Tag size='md' variant='solid' width={'130px'} colorScheme={statusColor(importStatus ? importStatus.name : 'Unspecified')}>
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
      <Flex width={'100%'} alignItems={'center'} justifyContent={'space-between'}>
        <Text>{selectedVulns.length} of {mergeData.length} selected for statusImport</Text>
      </Flex>
    )
  }, [mergeData, selectedVulns])

  const linkURl = (type, id) => {
    if (type === 'osv') {
      return `https://osv.dev/vulnerability/${id}`
    } else {
      return `https://nvd.nist.gov/vuln/detail/${id}`
    }
  }

  const handleChange = (state) => {
    prodVulnDispatch({ type: 'UPDATE_SELECTED_VULN', payload: state.selectedRows })
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
