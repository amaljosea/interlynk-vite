import { useMutation } from '@apollo/client'
import styled from '@emotion/styled'
import { useCallback, useMemo, useState } from 'react'
import DataTable from 'react-data-table-component'
import { useLocation, useParams } from 'react-router-dom'
import { customStyles, getFullDateAndTime, timeSince } from 'utils'

import {
  Box,
  Flex,
  Heading,
  IconButton,
  Spinner,
  Table,
  TableContainer,
  Tag,
  TagLabel,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tooltip,
  Tr,
  useDisclosure
} from '@chakra-ui/react'

import CustomLoader from 'components/CustomLoader'
import ViolationDrawer from 'components/Drawer/ViolationDrawer'
import Pagination from 'components/Pagination'

import useCustomToast from 'hooks/useCustomToast'
import { useGradualPolling } from 'hooks/useGradualPolling'
import { useHasPermission } from 'hooks/useHasPermission'
import { usePaginatedQuery } from 'hooks/usePaginatedQuery'
import { useThemeColor } from 'hooks/useThemeColors'

import { SbomPolicyScan } from 'graphQL/Mutation'
import { PolicyResults } from 'graphQL/Queries'

import { BiScan } from 'react-icons/bi'
import { FaEye } from 'react-icons/fa6'

const Policies = ({ sbomData }) => {
  const { showToast } = useCustomToast()
  const params = useParams()
  const sbomId = params.sbomid
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const activeTab = queryParams.get('tab')

  const isArchived = sbomData?.lifecycle === 'archived'

  const { headingTextColor, primaryTextColor } = useThemeColor([
    'headingTextColor',
    'primaryTextColor'
  ])

  const policyRun = useHasPermission({
    parentKey: 'view_policy',
    childKey: 'run_policy_scan'
  })

  const { nodes, paginationProps, loading, startPolling, stopPolling } =
    usePaginatedQuery(PolicyResults, {
      skip: activeTab === 'policies' ? false : true,
      selector: 'policyResults',
      variables: {
        sbomId
      }
    })

  const isInitialized = nodes?.some((item) => item?.result === 'initialized')

  const { isOpen, onOpen, onClose } = useDisclosure()

  const [activeRow, setActiveRow] = useState(null)
  const [activePolicy, setActivePolicy] = useState('')

  const [policyScan] = useMutation(SbomPolicyScan)

  const shouldPoll = isInitialized

  useGradualPolling({ shouldPoll, startPolling, stopPolling })

  // SUB HEADER
  const subHeader = useMemo(() => {
    const handleRefresh = async () => {
      await policyScan({ variables: { sbomId } }).then((res) => {
        const errors = res?.data?.sbomPolicyScan?.errors
        if (errors?.length > 0) {
          showToast({
            description: errors[0],
            status: 'error'
          })
        } else {
          showToast({
            description: 'Policy re-scan started',
            status: 'success'
          })
        }
      })
    }

    return (
      <Flex width={'100%'} alignItems={'center'} justifyContent={'flex-end'}>
        <Tooltip label='Policy Scan'>
          <IconButton
            colorScheme='blue'
            hidden={isArchived}
            onClick={handleRefresh}
            isDisabled={!policyRun}
            icon={<BiScan size={20} />}
          />
        </Tooltip>
      </Flex>
    )
  }, [policyRun, policyScan, sbomId, showToast, isArchived])

  const getColor = (result) => {
    switch (result) {
      case 'inform':
        return 'blue'
      case 'pass':
        return 'green'
      case 'warn':
        return 'yellow'
      case 'fail':
        return 'red'
      case 'skipped':
        return 'orange'
      case 'error':
        return 'gray'
    }
  }

  // COLUMNS
  const columns = [
    {
      id: 'POLICY',
      name: 'POLICY',
      selector: (row) => {
        const { policy } = row
        return <Text color={primaryTextColor}>{policy?.name || ''}</Text>
      },
      wrap: true
    },
    {
      id: 'RESULT',
      name: 'RESULT',
      selector: (row) => {
        const { resultType } = row

        return (
          <Tag minW={'100px'} colorScheme={getColor(resultType)}>
            <TagLabel mx={'auto'} pt={0.5} textTransform={'capitalize'}>
              {resultType}
            </TagLabel>
          </Tag>
        )
      },
      wrap: true
    },
    {
      id: 'VIOLATIONS',
      name: 'VIOLATIONS',
      selector: (row) => {
        const {
          resultType,
          violationsCount,
          sbom: { policyRunStatus }
        } = row
        if (isInitialized || policyRunStatus !== 'FINISHED')
          return <Spinner size='xs' mt={0.5} />
        const vColor = violationsCount === 0 ? 'green' : getColor(resultType)
        return (
          <Tag width={'60px'} colorScheme={vColor}>
            <TagLabel mx={'auto'} pt={0.5}>
              {violationsCount}
            </TagLabel>
          </Tag>
        )
      },
      right: 'true',
      width: '10%',
      wrap: true
    },
    // CREATED AT
    {
      id: 'LAST_CHECKED',
      name: 'LAST CHECKED',
      selector: (row) => (
        <Tooltip label={getFullDateAndTime(row?.updatedAt)} placement={'top'}>
          <Text color={primaryTextColor}>{timeSince(row?.updatedAt)}</Text>
        </Tooltip>
      ),
      width: '14%',
      right: 'true',
      wrap: true
    }
  ]

  const onCheckViolations = useCallback(
    (name, item) => {
      setActiveRow(item)
      setActivePolicy(name)
      onOpen()
    },
    [onOpen]
  )

  // EXPAND VIEW
  const ExpandedComponent = ({ data }) => {
    const { policy } = data
    const CustomText = styled(Text)`
      font-size: 12px;
      font-weight: bold;
      color: ${primaryTextColor};
      text-transform: uppercase;
      letter-spacing: 0.6px;
    `
    return (
      <Flex
        p={5}
        gap={6}
        width={'100%'}
        flexDir={'column'}
        boxShadow='inset 0px -5px 5px rgba(0, 0, 0, 0.08), inset 0px 5px 5px rgba(0, 0, 0, 0.08)'
      >
        <Box>
          <CustomText>Description :</CustomText>
          <Text
            color={primaryTextColor}
            width={'90%'}
            mt={1}
            fontSize={14}
            wordBreak={'break-all'}
          >
            {policy?.description || ''}
          </Text>
        </Box>
        <Box>
          <Heading
            mb={2}
            fontFamily={'inherit'}
            fontSize={'sm'}
            color={primaryTextColor}
            textTransform={'uppercase'}
          >
            Results
          </Heading>
          <TableContainer>
            <Table variant='striped'>
              <Thead>
                <Tr>
                  {['subject', 'operator', 'value', 'violations', 'action'].map(
                    (item, index) => (
                      <Th
                        fontFamily={'inherit'}
                        key={index}
                        color={primaryTextColor}
                        isNumeric={item === 'action' || item === 'violations'}
                      >
                        {item}
                      </Th>
                    )
                  )}
                </Tr>
              </Thead>
              <Tbody>
                {policy?.policyRules?.length > 0 &&
                  policy?.policyRules?.map((item, index) => (
                    <Tr key={index}>
                      <Td>
                        <Text
                          color={primaryTextColor}
                          fontSize={'sm'}
                          textTransform={'capitalize'}
                        >
                          {`${item?.category} ${item?.name}`}
                        </Text>
                      </Td>
                      <Td>
                        <Text
                          color={primaryTextColor}
                          fontSize={'sm'}
                          textTransform={'lowercase'}
                        >
                          {item?.operatorWording}
                        </Text>
                      </Td>
                      <Td>
                        <Text
                          color={primaryTextColor}
                          fontSize={'sm'}
                          wordBreak={'break-all'}
                        >
                          {item?.value}
                        </Text>
                      </Td>
                      <Td isNumeric>
                        <Tag width={'80px'} colorScheme='blue'>
                          <TagLabel mx={'auto'}>
                            {item?.policyRuleViolations?.totalCount || 0}
                          </TagLabel>
                        </Tag>
                      </Td>
                      <Td isNumeric>
                        <Tooltip label={'View Violations'}>
                          <IconButton
                            size='sm'
                            icon={<FaEye />}
                            colorScheme='blue'
                            fontWeight={'medium'}
                            onClick={() =>
                              onCheckViolations(policy?.name, item)
                            }
                          />
                        </Tooltip>
                      </Td>
                    </Tr>
                  ))}
              </Tbody>
            </Table>
          </TableContainer>
        </Box>
      </Flex>
    )
  }

  return (
    <>
      <Flex flexDir={'column'} width={'100%'}>
        <DataTable
          columns={columns}
          data={nodes || []}
          customStyles={customStyles(headingTextColor)}
          progressPending={loading}
          progressComponent={<CustomLoader />}
          subHeader
          subHeaderComponent={subHeader}
          persistTableHead
          responsive={true}
          expandableRows
          expandOnRowClicked
          expandableRowsComponent={ExpandedComponent}
        />

        <Pagination {...paginationProps} />
      </Flex>

      {isOpen && (
        <ViolationDrawer
          isOpen={isOpen}
          sbomId={sbomId}
          onClose={onClose}
          activeRow={activeRow}
          policy={activePolicy}
        />
      )}
    </>
  )
}

export default Policies
