import { useQuery } from '@apollo/client'
import { useMemo } from 'react'
import DataTable from 'react-data-table-component'
import { linkURl } from 'utils'
import { statusColor } from 'utils/styleUtils'

import {
  Box,
  Flex,
  Heading,
  Link,
  Stack,
  Text,
  useColorMode
} from '@chakra-ui/react'
import { Tag, TagLabel } from '@chakra-ui/react'

import CustomLoader from 'components/CustomLoader'
import ExternalNavIcon from 'components/Icons/ExternalNavIcon'
import SeverityTag from 'components/Misc/SeverityTag'

import { useGlobalState } from 'hooks/useGlobalState'
import { useDataTableStyles } from 'hooks/useTableStyles'
import { useThemeColor } from 'hooks/useThemeColors'

import { IntersectingVulns } from 'graphQL/Queries'

import { BsCircleHalf } from 'react-icons/bs'

const StepTwo = ({ sbomId, currentSbomId }) => {
  const customStyles = useDataTableStyles()

  const { primaryTextColor, primaryErrorColor } = useThemeColor([
    'primaryTextColor',
    'primaryErrorColor'
  ])

  const { colorMode } = useColorMode()
  const { prodVulnState, dispatch } = useGlobalState()
  const { selectedVulns } = prodVulnState
  const { prodVulnDispatch } = dispatch

  const { data, error } = useQuery(IntersectingVulns, {
    variables: { fromSbomId: sbomId, toSbomId: currentSbomId }
  })

  const tableClassName = colorMode === 'light' ? 'diff_light' : 'diff_dark'

  // COLUMNS
  const columns = [
    // CVE ID
    {
      id: 'cve',
      name: 'ID',
      selector: (row) => {
        const { fromVuln, toVuln } = row
        return (
          <Stack spacing={1} my={3}>
            <Link
              href={linkURl(fromVuln?.vuln?.source, fromVuln?.vuln?.vulnId)}
              target={'_blank'}
            >
              <Flex direction='row' alignItems={'center'} gap={2}>
                <ExternalNavIcon />
                <Text fontSize='sm' color={primaryTextColor}>
                  {fromVuln?.vuln?.vulnId || ''}
                </Text>
              </Flex>
            </Link>
            {toVuln === null && (
              <Text fontSize={'sm'} color={primaryErrorColor}>
                Data import is restricted
              </Text>
            )}
          </Stack>
        )
      },
      wrap: true,
      width: '25%'
    },
    // SEVERITY
    {
      id: 'serverity',
      name: 'SEVERITY',
      selector: (row) => <SeverityTag value={row?.fromVuln?.vuln?.sev} />
    },
    // COMPONENT
    {
      id: 'COMPONENTS_NAME',
      name: 'COMPONENT',
      selector: (row) => {
        const { fromVuln } = row
        return (
          <Stack
            direction='column'
            alignItems={'flex-start'}
            spacing={1}
            my={3}
          >
            <Text color={primaryTextColor}>
              {fromVuln?.component?.name || 'N/A'}
            </Text>
            <Text color={primaryTextColor}>
              {fromVuln?.component?.version || ''}
            </Text>
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
            <TagLabel
              mx={'auto'}
              as={Flex}
              gap={2}
              alignItems='center'
              style={{ textTransform: 'capitalize' }}
            >
              {fromVuln?.isComplete === false && <BsCircleHalf />}{' '}
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

  const conditionalRowDisabled = (row) => row?.toVuln === null

  if (error)
    return (
      <Text mt={6} textAlign={'center'}>
        Something went wrong...
      </Text>
    )

  return (
    <Box width={'100%'} mx={'auto'} mb={10} paddingX={36}>
      <Heading fontWeight={'medium'} fontSize={'lg'}>
        Select common vulnerabilities for status update
      </Heading>
      <Flex mt={5} flexDir={'column'} width={'100%'}>
        <DataTable
          subHeader
          columns={columns}
          className={tableClassName + 'data-table-container'}
          data={data?.intersectingVulns || []}
          customStyles={customStyles}
          progressPending={data ? false : true}
          progressComponent={<CustomLoader />}
          subHeaderComponent={subHeaderComponentMemo}
          responsive={true}
          selectableRows={true}
          fixedHeader
          persistTableHead
          fixedHeaderScrollHeight='50vh'
          onSelectedRowsChange={handleChange}
          selectableRowDisabled={conditionalRowDisabled}
        />
      </Flex>
    </Box>
  )
}

export default StepTwo
