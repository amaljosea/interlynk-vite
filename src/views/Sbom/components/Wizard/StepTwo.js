import { useQuery } from '@apollo/client'
import { useMemo } from 'react'
import DataTable from 'react-data-table-component'
import { customStyles, sevColor } from 'utils'

import { ExternalLinkIcon } from '@chakra-ui/icons'
import {
  Box,
  Flex,
  Heading,
  Icon,
  Link,
  Stack,
  Tag,
  TagLabel,
  Text,
  Tooltip,
  useColorModeValue
} from '@chakra-ui/react'

import CustomLoader from 'components/CustomLoader'

import { useGlobalState } from 'hooks/useGlobalState'

import { IntersectingVulns } from 'graphQL/Queries'

const statusColor = (status) => {
  if (status && status === 'Fixed') {
    return 'blue'
  } else if (status && status === 'Not Affected') {
    return 'green'
  } else if (status && status === 'Affected') {
    return 'red'
  } else if (status && status === 'In Triage') {
    return 'cyan'
  } else {
    return 'gray'
  }
}

const linkURl = (type, id) => {
  if (type === 'osv') {
    return `https://osv.dev/vulnerability/${id}`
  } else {
    return `https://nvd.nist.gov/vuln/detail/${id}`
  }
}

const StepTwo = ({ sbomId, currentSbomId }) => {
  const textColor = useColorModeValue('gray.700', 'white')
  const { prodVulnState, dispatch } = useGlobalState()
  const { selectedVulns } = prodVulnState
  const { prodVulnDispatch } = dispatch

  const { data, error } = useQuery(IntersectingVulns, {
    variables: { fromSbomId: sbomId, toSbomId: currentSbomId }
  })

  // COLUMNS
  const columns = [
    // CVE ID
    {
      id: 'cve',
      name: 'ID',
      selector: (row) => {
        const { toVuln } = row
        return (
          <Link
            href={linkURl(toVuln?.vuln?.source, toVuln?.vuln?.vulnId)}
            target={'_blank'}
          >
            <Flex direction='row' alignItems={'center'} gap={2}>
              <Icon
                as={ExternalLinkIcon}
                h={'16px'}
                w={'16px'}
                color={'blue.500'}
              />
              <Tooltip label={toVuln?.vuln?.vulnId} placement={'top'}>
                <Text fontSize='sm' color={textColor}>
                  {toVuln?.vuln?.vulnId || ''}
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
        const { toVuln } = row
        return (
          <>
            {toVuln?.vuln?.sev !== null ? (
              <Tag
                size='md'
                variant='subtle'
                width={'80px'}
                colorScheme={sevColor(`${toVuln?.vuln?.sev}`)}
              >
                <TagLabel style={{ textTransform: 'capitalize' }} mx={'auto'}>
                  {toVuln?.vuln?.sev}
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
      id: 'COMPONENTS_NAME',
      name: 'COMPONENT',
      selector: (row) => {
        const { toVuln } = row
        return (
          <Stack
            direction='column'
            alignItems={'flex-start'}
            spacing={1}
            my={3}
          >
            <Text>{toVuln?.component?.name || ''}</Text>
            <Text>{toVuln?.component?.version || ''}</Text>
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
        const { toVuln } = row
        return (
          <Tag
            size='md'
            variant='solid'
            width={'130px'}
            colorScheme={statusColor(toVuln?.vexStatus?.name || 'Unspecified')}
          >
            <TagLabel style={{ textTransform: 'capitalize' }} mx={'auto'}>
              {toVuln?.vexStatus?.name || 'Unspecified'}
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
        const { fromVuln } = row
        return (
          <Tag
            size='md'
            variant='solid'
            width={'130px'}
            colorScheme={statusColor(
              fromVuln?.vexStatus?.name || 'Unspecified'
            )}
          >
            <TagLabel style={{ textTransform: 'capitalize' }} mx={'auto'}>
              {fromVuln?.vexStatus?.name || 'Unspecified'}
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
          {selectedVulns?.length} of {data?.intersectingVulns?.length} selected
        </Text>
      </Flex>
    )
  }, [data, selectedVulns])

  const handleChange = (state) => {
    prodVulnDispatch({
      type: 'UPDATE_SELECTED_VULN',
      payload: state.selectedRows
    })
  }

  if (error)
    return (
      <Text mt={6} textAlign={'center'}>
        Something went wrong...
      </Text>
    )

  return (
    <Box width={'100%'} mx={'auto'}>
      <Heading fontWeight={'medium'} fontSize={'lg'} fontFamily={'inherit'}>
        Select common vulnerabilities for status update
      </Heading>
      <Flex mt={5} flexDir={'column'} width={'100%'} mb={4}>
        <DataTable
          columns={columns}
          data={data?.intersectingVulns || []}
          customStyles={customStyles}
          subHeader
          progressPending={data ? false : true}
          progressComponent={<CustomLoader />}
          subHeaderComponent={subHeaderComponentMemo}
          responsive={true}
          selectableRows={true}
          fixedHeader
          persistTableHead
          fixedHeaderScrollHeight='50vh'
          onSelectedRowsChange={handleChange}
        />
      </Flex>
    </Box>
  )
}

export default StepTwo
