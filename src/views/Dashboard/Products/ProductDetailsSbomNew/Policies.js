import { useMutation } from '@apollo/client'
import styled from '@emotion/styled'
import { useCallback, useEffect, useMemo, useState } from 'react'
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
  useColorModeValue,
  useDisclosure
} from '@chakra-ui/react'

import CustomLoader from 'components/CustomLoader'
import ViolationDrawer from 'components/Drawer/ViolationDrawer'
import Pagination from 'components/Pagination'

import useCustomToast from 'hooks/useCustomToast'
import { useHasPermission } from 'hooks/useHasPermission'
import { usePaginatatedQuery } from 'hooks/usePaginatatedQuery'

import { SbomPolicyScan } from 'graphQL/Mutation'
import { PolicyResults } from 'graphQL/Queries'

import { BiScan } from 'react-icons/bi'
import { FaEye } from 'react-icons/fa6'

const Policies = () => {
  const { showToast } = useCustomToast()
  const params = useParams()
  const sbomId = params.sbomid
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const activeTab = queryParams.get('tab')

  const headColor = useColorModeValue('#4A5568', '#CBD5E0')
  const textColor = useColorModeValue('#1A202C', '#F7FAFC')

  const policyRun = useHasPermission({
    parentKey: 'view_policy',
    childKey: 'run_policy_scan'
  })

  const { nodes, paginationProps, refetch, loading } = usePaginatatedQuery(
    PolicyResults,
    {
      skip: activeTab === 'policies' ? false : true,
      selector: 'policyResults',
      variables: {
        sbomId
      }
    }
  )

  const isInitialized = nodes?.some((item) => item?.result === 'initialized')

  const { isOpen, onOpen, onClose } = useDisclosure()

  const [activeRow, setActiveRow] = useState(null)
  const [activePolicy, setActivePolicy] = useState('')

  const [policyScan] = useMutation(SbomPolicyScan)

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
          refetch()
        }
      })
    }

    return (
      <Flex width={'100%'} alignItems={'center'} justifyContent={'flex-end'}>
        <Tooltip label='Policy Scan'>
          <IconButton
            colorScheme='blue'
            onClick={handleRefresh}
            isDisabled={!policyRun}
            icon={<BiScan size={20} />}
          />
        </Tooltip>
      </Flex>
    )
  }, [policyRun, policyScan, refetch, sbomId, showToast])

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
        return <Text color={textColor}>{policy?.name || ''}</Text>
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
        const { resultType, policyRuleViolations } = row
        const { totalCount } = policyRuleViolations || ''
        const countZero = resultType === 'pass' || resultType === 'skip'
        if (isInitialized) return <Spinner size='xs' mt={0.5} />
        const vColor = totalCount === 0 ? 'green' : getColor(resultType)
        return (
          <Tag width={'60px'} colorScheme={vColor}>
            <TagLabel mx={'auto'} pt={0.5}>
              {countZero ? 0 : totalCount}
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
          <Text color={textColor}>{timeSince(row?.updatedAt)}</Text>
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
      color: ${textColor};
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
            color={textColor}
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
            color={textColor}
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
                        color={textColor}
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
                          color={textColor}
                          fontSize={'sm'}
                          textTransform={'capitalize'}
                        >
                          {`${item?.category} ${item?.name}`}
                        </Text>
                      </Td>
                      <Td>
                        <Text
                          color={textColor}
                          fontSize={'sm'}
                          textTransform={'lowercase'}
                        >
                          {item?.operatorWording}
                        </Text>
                      </Td>
                      <Td>
                        <Text
                          color={textColor}
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

  useEffect(() => {
    const refetchInterval = setInterval(() => {
      if (isInitialized) {
        refetch()
      } else {
        clearInterval(refetchInterval)
      }
    }, 5000)
    return () => clearInterval(refetchInterval)
  }, [sbomId, isInitialized, refetch])

  return (
    <>
      <Flex flexDir={'column'} width={'100%'}>
        <DataTable
          columns={columns}
          data={nodes || []}
          customStyles={customStyles(headColor)}
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
