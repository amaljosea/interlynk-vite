import { useLazyQuery, useMutation } from '@apollo/client'
import styled from '@emotion/styled'
import { useCallback, useEffect, useMemo, useState } from 'react'
import DataTable from 'react-data-table-component'
import { useParams } from 'react-router-dom'
import { customStyles, getFullDateAndTime, timeSince } from 'utils'

import {
  Box,
  Flex,
  Grid,
  GridItem,
  Heading,
  IconButton,
  Stack,
  Tag,
  TagLabel,
  Text,
  Tooltip,
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
        return (
          <Stack
            direction='column'
            alignItems={'flex-start'}
            spacing={1}
            my={3}
          >
            <Text>{policy?.name || ''}</Text>
            <Text>{policy?.description || ''}</Text>
          </Stack>
        )
      },
      width: '400px',
      wrap: true
    },
    {
      id: 'RESULT',
      name: 'RESULT',
      selector: (row) => {
        const { resultWording } = row
        return (
          <Tag
            minW={'120px'}
            colorScheme={
              resultWording === 'inform'
                ? 'blue'
                : resultWording === 'warn'
                  ? 'orange'
                  : 'red'
            }
          >
            <TagLabel mx={'auto'} pt={0.5}>
              {resultWording}
            </TagLabel>
          </Tag>
        )
      },
      width: '250px',
      wrap: true
    },
    {
      id: 'RESULT_TYPE',
      name: 'RESULT TYPE',
      selector: (row) => {
        const { resultType } = row
        return (
          <Tag
            minW={'100px'}
            colorScheme={
              resultType === 'fail'
                ? 'red'
                : resultType === 'warn'
                  ? 'orange'
                  : 'blue'
            }
          >
            <TagLabel mx={'auto'} pt={0.5} textTransform={'capitalize'}>
              {resultType || ''}
            </TagLabel>
          </Tag>
        )
      },
      width: '250px',
      wrap: true
    },
    {
      id: 'VIOLATIONS',
      name: 'VIOLATIONS',
      selector: (row) => {
        const { policyRuleViolations } = row
        return (
          <Tag
            width={'60px'}
            colorScheme={
              policyRuleViolations?.totalCount === 0 ? 'red' : 'blue'
            }
          >
            <TagLabel mx={'auto'} pt={0.5}>
              {policyRuleViolations?.totalCount || 0}
            </TagLabel>
          </Tag>
        )
      },
      width: '250px',
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
      right: 'true',
      wrap: true
    }
  ]

  const onCheckViolations = useCallback(
    async (item) => {
      console.log('item', item)
      await getViolations({
        variables: { sbomId, policyRuleId: item.id, first: totalRows }
      }).then((res) => {
        if (res?.data) {
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
      color: #333;
      text-transform: uppercase;
      letter-spacing: 0.6px;
    `
    return (
      <Box
        width={'100%'}
        p={5}
        boxShadow='inset 0px -5px 5px rgba(0, 0, 0, 0.08), inset 0px 5px 5px rgba(0, 0, 0, 0.08)'
      >
        <Heading
          mt={2}
          mb={5}
          fontFamily={'inherit'}
          fontSize={'sm'}
          color={'#555'}
          width={'95%'}
          mx={'auto'}
          textTransform={'uppercase'}
        >
          Policy Violations
        </Heading>
        <Grid
          width={'95%'}
          templateColumns='repeat(12, 1fr)'
          gap={6}
          mx={'auto'}
          borderBottom={'1px solid #E2E8F0'}
          py={2}
        >
          <GridItem colSpan={3}>
            <CustomText>subject</CustomText>
          </GridItem>
          <GridItem colSpan={2}>
            <CustomText>operator</CustomText>
          </GridItem>
          <GridItem colSpan={3}>
            <CustomText>value</CustomText>
          </GridItem>
          <GridItem colSpan={2}>
            <CustomText>violations</CustomText>
          </GridItem>
          <GridItem colSpan={2}>
            <CustomText>action</CustomText>
          </GridItem>
        </Grid>
        {policy?.policyRules?.length > 0 ? (
          policy?.policyRules?.map((item, index) => (
            <Grid
              width={'95%'}
              key={index}
              alignItems={'center'}
              templateColumns='repeat(12, 1fr)'
              gap={6}
              mb={1}
              mx={'auto'}
              py={2}
              borderBottom={'1px solid #E2E8F0'}
            >
              <GridItem colSpan={3}>
                <Text fontSize={'sm'} textTransform={'capitalize'}>
                  {`${item?.category} ${item?.name}`}
                </Text>
              </GridItem>
              <GridItem colSpan={2}>
                <Text fontSize={'sm'} textTransform={'lowercase'}>
                  {item?.operatorWording}
                </Text>
              </GridItem>
              <GridItem colSpan={3}>
                <Text fontSize={'sm'} wordBreak={'break-all'}>
                  {item?.value}
                </Text>
              </GridItem>
              <GridItem colSpan={2}>
                <Tag width={'80px'} colorScheme='blue'>
                  <TagLabel mx={'auto'}>
                    {item?.policyRuleViolations?.totalCount || 0}
                  </TagLabel>
                </Tag>
              </GridItem>
              <GridItem colSpan={2}>
                <Tooltip label={'View Violations'}>
                  <IconButton
                    size='sm'
                    icon={<FaEye />}
                    colorScheme='blue'
                    fontWeight={'medium'}
                    hidden={item?.category === 'version'}
                    onClick={() => onCheckViolations(item)}
                  />
                </Tooltip>
              </GridItem>
            </Grid>
          ))
        ) : (
          <GridItem
            width={'97.5%'}
            mx={'auto'}
            colSpan={12}
            my={6}
            textAlign={'center'}
          >
            There are no records to display
          </GridItem>
        )}
      </Box>
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
          data={violations?.policyRuleViolations}
          sbomId={sbomId}
          refetch={getViolations}
        />
      )}
    </>
  )
}

export default PolicyEvalTable
