import { useLazyQuery, useMutation } from '@apollo/client'
import styled from '@emotion/styled'
import { useCallback, useEffect, useMemo, useState } from 'react'
import DataTable from 'react-data-table-component'
import { useParams } from 'react-router-dom'
import { customStyles, getFullDateAndTime, timeSince } from 'utils'

import {
  Box,
  Flex,
  Heading,
  IconButton,
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

import { SbomPolicyScan } from 'graphQL/Mutation'
import { PolicyRuleViolations } from 'graphQL/Queries'

import { BiScan } from 'react-icons/bi'
import { FaEye } from 'react-icons/fa6'

const PolicyEvalTable = ({ data, refetch }) => {
  const params = useParams()
  const sbomId = params.sbomid
  const { isOpen, onOpen, onClose } = useDisclosure()
  const paginationSizes = [25, 50, 100]
  const [activePolicy, setActivePolicy] = useState('')
  const [activeRow, setActiveRow] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalRows, setTotalRows] = useState(paginationSizes[0])
  const [isPrevActive, setIsPrevActive] = useState(false)
  const [isNextActive, setIsNextActive] = useState(false)

  const [getViolations, { data: violations }] =
    useLazyQuery(PolicyRuleViolations)

  const [policyScan] = useMutation(SbomPolicyScan)

  const setPaginationControl = (data) => {
    setIsPrevActive(data?.pageInfo?.hasPreviousPage)
    setIsNextActive(data?.pageInfo?.hasNextPage)
  }

  const disablePaginationControl = () => {
    setIsPrevActive(false)
    setIsNextActive(false)
  }

  // SET ROW LENGTH
  const handleSetRow = useCallback(
    async (e) => {
      disablePaginationControl()
      setTotalRows(Number(e.target.value))
      await refetch({
        variables: {
          sbomId,
          first: Number(e.target.value),
          last: undefined,
          after: undefined,
          before: undefined
        }
      }).then((res) => {
        if (res?.data) {
          setPaginationControl(res.data)
        }
      })
    },
    [refetch, sbomId]
  )

  // SUB HEADER
  const subHeader = useMemo(() => {
    const handleRefresh = async () => {
      await policyScan({ variables: { sbomId } }).then(
        (res) => res?.data && console.log(res?.data)
      )
    }
    return (
      <Flex width={'100%'} alignItems={'center'} justifyContent={'flex-end'}>
        <Tooltip label='Policy Scan'>
          <IconButton
            colorScheme='blue'
            onClick={handleRefresh}
            icon={<BiScan size={20} />}
          />
        </Tooltip>
      </Flex>
    )
  }, [policyScan, sbomId])

  // COLUMNS
  const columns = [
    {
      id: 'POLICY',
      name: 'POLICY',
      selector: (row) => {
        const { policy } = row
        return <Text>{policy?.name || ''}</Text>
      },
      wrap: true
    },
    {
      id: 'RESULT',
      name: 'RESULT',
      selector: (row) => {
        const { result, resultType } = row
        return (
          <Tag
            minW={'100px'}
            colorScheme={
              resultType === 'pass'
                ? 'green'
                : resultType === 'inform'
                  ? 'blue'
                  : resultType === 'warn'
                    ? 'orange'
                    : resultType === 'fail'
                      ? 'red'
                      : 'gray'
            }
          >
            <TagLabel mx={'auto'} pt={0.5} textTransform={'capitalize'}>
              {result === 'initialized'
                ? 'Initialized'
                : result === 'not_detected'
                  ? 'Not Detected'
                  : result === 'error'
                    ? 'Error'
                    : result === 'skipped'
                      ? 'Skipped'
                      : resultType}
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
        return (
          <Tag
            width={'60px'}
            colorScheme={
              policyRuleViolations?.totalCount === 0 ? 'red' : 'blue'
            }
          >
            <TagLabel mx={'auto'} pt={0.5}>
              {resultType === 'pass' || resultType === 'skip'
                ? 0
                : policyRuleViolations?.totalCount}
            </TagLabel>
          </Tag>
        )
      },
      right: 'true',
      width: '200px',
      wrap: true
    },
    // CREATED AT
    {
      id: 'LAST_CHECKED',
      name: 'LAST CHECKED',
      selector: (row) => (
        <Tooltip label={getFullDateAndTime(row?.updatedAt)} placement={'top'}>
          {timeSince(row?.updatedAt)}
        </Tooltip>
      ),
      width: '265px',
      right: 'true',
      wrap: true
    }
  ]

  const onCheckViolations = useCallback(
    async (name, item) => {
      console.log('item', item)
      await getViolations({
        variables: { sbomId, policyRuleId: item.id, first: totalRows }
      }).then((res) => {
        if (res?.data) {
          setActivePolicy(name)
          setActiveRow(item)
          console.log(res?.data?.policyRuleViolations)
        }
      })
      onOpen()
    },
    [getViolations, onOpen, sbomId, totalRows]
  )

  // EXPAND VIEW
  const ExpandedComponent = ({ data }) => {
    const { policy } = data
    const CustomText = styled(Text)`
      font-size: 12px;
      font-weight: bold;
      color: #718096;
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
        <Box width={'100%'}>
          <CustomText>Description :</CustomText>
          <Text width={'90%'} mt={1} fontSize={14} wordBreak={'break-all'}>
            {policy?.description || ''}
          </Text>
        </Box>
        <Box width={'100%'}>
          <Heading mb={3} fontFamily={'inherit'} fontSize={'sm'} color={'#555'}>
            RESULTS
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
                        color={'#718096'}
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
                        <Text fontSize={'sm'} textTransform={'capitalize'}>
                          {`${item?.category} ${item?.name}`}
                        </Text>
                      </Td>
                      <Td>
                        <Text fontSize={'sm'} textTransform={'lowercase'}>
                          {item?.operatorWording}
                        </Text>
                      </Td>
                      <Td>
                        <Text fontSize={'sm'} wordBreak={'break-all'}>
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
                            hidden={item?.category === 'version'}
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

  const handlePreviousPage = useCallback(async () => {
    disablePaginationControl()
    setCurrentPage(currentPage - 1)
    await refetch({
      variables: {
        sbomId: sbomId,
        first: undefined,
        last: totalRows,
        after: undefined,
        before: data?.pageInfo?.startCursor
      }
    }).then((res) => {
      if (res.data) {
        setPaginationControl(res.data)
      }
    })
  }, [currentPage, refetch, sbomId, totalRows, data?.pageInfo?.startCursor])

  const handleNextPage = useCallback(async () => {
    disablePaginationControl()
    setCurrentPage(currentPage + 1)
    await refetch({
      variables: {
        sbomId: sbomId,
        first: totalRows,
        last: undefined,
        after: data?.pageInfo?.endCursor,
        before: undefined
      }
    }).then((res) => {
      if (res.data) {
        setPaginationControl(res.data)
      }
    })
  }, [currentPage, refetch, sbomId, totalRows, data?.pageInfo?.endCursor])

  useEffect(() => {
    if (data) {
      setIsPrevActive(data?.pageInfo?.hasPreviousPage)
      setIsNextActive(data?.pageInfo?.hasNextPage)
    }
  }, [data])

  return (
    <>
      <Flex flexDir={'column'} width={'100%'}>
        <DataTable
          columns={columns}
          data={data?.nodes || []}
          customStyles={customStyles}
          progressPending={data ? false : true}
          progressComponent={<CustomLoader />}
          subHeader
          subHeaderComponent={subHeader}
          persistTableHead
          responsive={true}
          expandableRows
          expandOnRowClicked
          expandableRowsComponent={ExpandedComponent}
        />

        {data?.pageInfo && (
          <Pagination
            paginationSizes={paginationSizes}
            pageIndex={currentPage}
            totalRows={totalRows}
            totalCount={data?.totalCount}
            onPreviousPage={handlePreviousPage}
            onNextPage={handleNextPage}
            onSetRow={handleSetRow}
            hasNextPage={isNextActive}
            hasPreviousPage={isPrevActive}
          />
        )}
      </Flex>

      {isOpen && (
        <ViolationDrawer
          isOpen={isOpen}
          onClose={onClose}
          activeRow={activeRow}
          policy={activePolicy}
          data={violations?.policyRuleViolations}
          sbomId={sbomId}
          refetch={getViolations}
        />
      )}
    </>
  )
}

export default PolicyEvalTable
