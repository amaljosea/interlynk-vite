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
  useDisclosure,
  useToast
} from '@chakra-ui/react'

import CustomLoader from 'components/CustomLoader'
import ViolationDrawer from 'components/Drawer/ViolationDrawer'
import Pagination from 'components/Pagination'

import { usePaginatatedQuery } from 'hooks/usePaginatatedQuery'

import { SbomPolicyScan } from 'graphQL/Mutation'
import { PolicyResults } from 'graphQL/Queries'

import { BiScan } from 'react-icons/bi'
import { FaEye } from 'react-icons/fa6'

const Policies = () => {
  const toast = useToast()
  const params = useParams()
  const sbomId = params.sbomid
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const activeTab = queryParams.get('tab')

  const { nodes, paginationProps, refetch, loading, reset } =
    usePaginatatedQuery(PolicyResults, {
      skip: activeTab === 'policies' ? false : true,
      selector: 'policyResults',
      variables: {
        sbomId
      }
    })

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
          toast({
            description: errors[0],
            status: 'error',
            position: 'top',
            duration: 2000
          })
        } else {
          toast({
            description: 'Policy re-scan started',
            status: 'success',
            position: 'top',
            duration: 2000
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
            icon={<BiScan size={20} />}
          />
        </Tooltip>
      </Flex>
    )
  }, [policyScan, refetch, sbomId, toast])

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
              result === 'initialized'
                ? 'blue'
                : result === 'not_detected'
                  ? 'green'
                  : result === 'error'
                    ? 'red'
                    : result === 'skipped'
                      ? 'gray'
                      : 'orange'
            }
          >
            <TagLabel mx={'auto'} pt={0.5} textTransform={'capitalize'}>
              {result === 'initialized'
                ? 'Checking'
                : result === 'not_detected'
                  ? 'Pass'
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
        const { totalCount } = policyRuleViolations || ''
        return (
          <Tag width={'60px'} colorScheme={totalCount === 0 ? 'green' : 'blue'}>
            <TagLabel mx={'auto'} pt={0.5}>
              {resultType === 'pass' || resultType === 'skip'
                ? 0
                : policyRuleViolations?.totalCount}
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
          {timeSince(row?.updatedAt)}
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
      color: #333;
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
          <Text width={'90%'} mt={1} fontSize={14} wordBreak={'break-all'}>
            {policy?.description || ''}
          </Text>
        </Box>
        <Box>
          <Heading
            mb={2}
            fontFamily={'inherit'}
            fontSize={'sm'}
            color={'#555'}
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
          customStyles={customStyles}
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
