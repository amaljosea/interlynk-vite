import { useMutation, useQuery } from '@apollo/client'
import styled from '@emotion/styled'
import { useCallback, useEffect, useMemo, useState } from 'react'
import DataTable from 'react-data-table-component'
import { useLocation } from 'react-router-dom'
import {
  customStyles,
  getFullDateAndTime,
  timeSince,
  updatedValue
} from 'utils'
import DeleteModal from 'views/Dashboard/Policies/DeleteModal'
import PolicyModal from 'views/Dashboard/Policies/PolicyModal'
import RuleModal from 'views/Dashboard/Policies/RuleModal'
import WarnModal from 'views/Dashboard/Policies/WarnModal'

import { RepeatIcon } from '@chakra-ui/icons'
import {
  Box,
  Flex,
  Grid,
  GridItem,
  Heading,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Portal,
  Select,
  Stack,
  Switch,
  Tag,
  TagLabel,
  Text,
  Tooltip,
  useDisclosure,
  useToast
} from '@chakra-ui/react'

import CustomLoader from 'components/CustomLoader'
import Pagination from 'components/Pagination'

import { useGlobalState } from 'hooks/useGlobalState'

import { DeletePolicyExclusion, PolicyExclusionCreate } from 'graphQL/Mutation'
import { PolicySubjectOperators } from 'graphQL/Queries'

import { FaEllipsisV, FaPlus } from 'react-icons/fa'

const PolicyTable = ({ data, refetch }) => {
  const toast = useToast()
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const productId = queryParams.get('id')
  const sbomId = queryParams.get('sbom')
  const activeProd = localStorage.getItem('activeEnv')
  const { totalRows, policyState, dispatch } = useGlobalState()
  const { pageIndex, searchInput } = policyState
  const { policyDispatch } = dispatch

  const paginationSizes = [25, 50, 100]
  const [activeRow, setActiveRow] = useState(null)
  const [activeRule, setActiveRule] = useState(null)
  const [isPrevActive, setIsPrevActive] = useState(false)
  const [isNextActive, setIsNextActive] = useState(false)

  const { data: subOperators } = useQuery(PolicySubjectOperators, {
    fetchPolicy: 'network-only'
  })

  const formatSubject = (value) => {
    if (subOperators) {
      const result = subOperators.policySubjectOperatorMapping.find(
        (item) => item?.subject === value
      )
      return `${result?.category} ${result?.name}`
    }
  }

  const [createExclusion] = useMutation(PolicyExclusionCreate)
  const [deleteExclusion] = useMutation(DeletePolicyExclusion)

  const policyData = {
    projectId: activeProd || undefined,
    search: activeProd || searchInput === '' ? undefined : searchInput,
    first: totalRows
  }

  const setPaginationControl = (data) => {
    setIsPrevActive(data?.pageInfo?.hasPreviousPage)
    setIsNextActive(data?.pageInfo?.hasNextPage)
  }

  const disablePaginationControl = () => {
    setIsPrevActive(false)
    setIsNextActive(false)
  }

  const { isOpen, onOpen, onClose } = useDisclosure()
  const {
    isOpen: isWarningOpen,
    onOpen: onWarningOpen,
    onClose: onWarningClose
  } = useDisclosure()
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose
  } = useDisclosure()
  const {
    isOpen: isRuleOpen,
    onOpen: onRuleOpen,
    onClose: onRuleClose
  } = useDisclosure()

  const handleRefresh = useCallback(async () => {
    disablePaginationControl()
    await refetch({
      variables: {
        projectId: activeProd || undefined,
        search: activeProd || searchInput === '' ? undefined : searchInput,
        first: totalRows
      }
    }).then(
      (res) => res?.data && policyDispatch({ type: 'CLEAR_SEARCH_INPUT' })
    )
  }, [activeProd, policyDispatch, refetch, searchInput, totalRows])

  const handlePreviousPage = () => {}
  const handleNextPage = () => {}
  const handleSetRow = () => {}

  const handleCreateExclusion = async (id) => {
    await createExclusion({
      variables: { policyId: id, projectId: activeProd }
    }).then((res) => {
      const errors = res?.data?.policyExclusionCreate?.errors
      if (errors?.length > 0) {
        toast({
          description: errors[0],
          status: 'error',
          position: 'top',
          duration: 2000
        })
      } else {
        refetch({ variables: { ...policyData } })
      }
    })
  }

  const handleDeleteExclusion = async (id) => {
    await deleteExclusion({
      variables: { policyId: id, projectId: activeProd }
    }).then((res) => {
      const errors = res?.data?.policyExclusionDelete?.errors
      if (errors?.length > 0) {
        toast({
          description: errors[0],
          status: 'error',
          position: 'top',
          duration: 2000
        })
      } else {
        refetch({ variables: { ...policyData } })
      }
    })
  }

  // SUB HEADER
  const subHeader = useMemo(() => {
    return (
      <Flex width={'100%'} alignItems={'center'} justifyContent={'flex-end'}>
        {/* SEARCH COMPONENTS */}
        <Stack spacing={2} alignItems={'center'} direction={'row'}>
          <Tooltip label='Create Policy'>
            <IconButton
              hidden={productId}
              colorScheme='blue'
              onClick={() => {
                setActiveRow(null)
                onOpen()
              }}
              icon={<FaPlus />}
            />
          </Tooltip>
          <Tooltip label='Refresh'>
            <IconButton
              hidden={sbomId}
              colorScheme='blue'
              onClick={handleRefresh}
              icon={<RepeatIcon />}
            />
          </Tooltip>
        </Stack>
      </Flex>
    )
  }, [handleRefresh, onOpen, productId, sbomId])

  // COLUMNS
  const columns = [
    {
      id: 'ACTIVE',
      name: 'ACTIVE',
      selector: (row) => {
        const { isEnabled } = row
        return (
          <Switch
            size='md'
            isChecked={isEnabled}
            onChange={() => {
              setActiveRow(row)
              onWarningOpen()
            }}
          />
        )
      },
      width: '150px',
      omit: productId
    },
    {
      id: 'POLICY',
      name: 'POLICY',
      selector: (row) => <Text my={4}>{row?.name}</Text>,
      wrap: true,
      width: '350px'
    },
    {
      id: 'CONDITIONS',
      name: 'CONDITIONS',
      selector: (row) => (
        <Text textTransform={'uppercase'}>{row?.operator}</Text>
      ),
      width: '200px',
      wrap: true
    },
    {
      id: 'RESULT',
      name: 'RESULT',
      selector: (row) => {
        const { resultType } = row
        return (
          <Tag
            width={'80px'}
            colorScheme={
              resultType === 'inform'
                ? 'blue'
                : resultType === 'warn'
                  ? 'orange'
                  : 'red'
            }
          >
            <TagLabel
              fontSize={'xs'}
              style={{ textTransform: 'uppercase' }}
              mx={'auto'}
            >
              {resultType}
            </TagLabel>
          </Tag>
        )
      },
      width: '250px',
      wrap: true
    },
    // UPDATED AT
    {
      id: 'UPDATED',
      name: 'UPDATED',
      selector: (row) => (
        <Tooltip label={getFullDateAndTime(row?.updatedAt)} placement={'top'}>
          {timeSince(row?.updatedAt)}
        </Tooltip>
      ),
      right: 'true',
      wrap: true
    },
    // EXCLUSION
    {
      id: 'APPLY',
      name: 'APPLY',
      selector: (row) => {
        const { isExcluded, id } = row
        return (
          <Select
            size='sm'
            width={'120px'}
            value={isExcluded ? 'no' : 'yes'}
            onChange={() =>
              isExcluded ? handleDeleteExclusion(id) : handleCreateExclusion(id)
            }
            bg={isExcluded ? 'red.200' : 'green.200'}
            border={'none'}
            textTransform={'capitalize'}
            variant={'outline'}
          >
            {['yes', 'no'].map((itm, index) => (
              <option
                key={index}
                value={itm}
                style={{ textTransform: 'capitalize' }}
              >
                {itm}
              </option>
            ))}
          </Select>
        )
      },
      width: '200px',
      right: 'true',
      omit: !productId
    },
    {
      id: 'ACTION',
      name: 'ACTION',
      selector: (row) => {
        return (
          <Menu>
            <MenuButton
              as={IconButton}
              icon={<FaEllipsisV />}
              variant='none'
              color='gray.400'
            />
            <Portal>
              <MenuList fontSize={'sm'}>
                {/* EDIT POLICY */}
                <MenuItem
                  hidden={productId}
                  onClick={() => {
                    setActiveRow(row)
                    onOpen()
                  }}
                >
                  Edit Policy
                </MenuItem>
                {/* ADD POLICY RULE */}
                <MenuItem
                  hidden
                  onClick={() => {
                    setActiveRow(row)
                    setActiveRule(null)
                    onRuleOpen()
                  }}
                >
                  Add Policy Rule
                </MenuItem>
                {/* DELETE POLICY  */}
                <MenuItem
                  color='red'
                  onClick={() => {
                    setActiveRow(row)
                    onDeleteOpen()
                  }}
                  hidden={productId}
                >
                  Archive Policy
                </MenuItem>
              </MenuList>
            </Portal>
          </Menu>
        )
      },
      width: '100px',
      right: 'true',
      omit: productId
    }
  ]

  const conditionalRowStyles = [
    {
      when: (row) => row.isExcluded === true,
      style: {
        backgroundColor: '#f2f2f2',
        color: '#111',
        '&:hover': { cursor: 'pointer' }
      }
    }
  ]

  // EXPAND VIEW
  const ExpandedComponent = ({ data }) => {
    const { policyRules } = data
    const CustomText = styled(Text)`
      font-size: 13px;
      font-weight: bold;
      color: #718096;
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
          mb={6}
          fontFamily={'inherit'}
          fontSize={'sm'}
          color={'#555'}
          width={'90%'}
          mx={'auto'}
        >
          CONDITIONS
        </Heading>
        <Grid
          width={'90%'}
          templateColumns='repeat(3, 1fr)'
          gap={6}
          mb={4}
          mx={'auto'}
        >
          <GridItem>
            <CustomText>subject</CustomText>
          </GridItem>
          <GridItem>
            <CustomText>operator</CustomText>
          </GridItem>
          <GridItem>
            <CustomText>value</CustomText>
          </GridItem>
        </Grid>
        {policyRules?.map((item, index) => (
          <Grid
            key={index}
            width={'90%'}
            templateColumns='repeat(3, 1fr)'
            gap={6}
            mb={1}
            mx={'auto'}
            bg={'#EDF2F7'}
            p={2}
          >
            <GridItem>
              <Text fontSize={'sm'} textTransform={'capitalize'}>
                {formatSubject(item?.subject)}
              </Text>
            </GridItem>
            <GridItem>
              <Text fontSize={'sm'} textTransform={'lowercase'}>
                {updatedValue(item?.operator)}
              </Text>
            </GridItem>
            <GridItem>
              <Text
                fontSize={'sm'}
                wordBreak={'break-all'}
                hidden={
                  item?.operator === 'EXISTS' || item?.operator === 'NOT_EXISTS'
                }
              >
                {item?.value}{' '}
                {item?.subject === 'VULNERABILITY_EPSS' &&
                (item?.operator === 'LESS_THAN' ||
                  item?.operator === 'MORE_THAN')
                  ? ' %'
                  : ''}
              </Text>
            </GridItem>
          </Grid>
        ))}
      </Box>
    )
  }

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
          expandableRows
          expandOnRowClicked
          expandableRowsComponent={ExpandedComponent}
          persistTableHead
          responsive={true}
          conditionalRowStyles={conditionalRowStyles}
        />

        {/* PAGINATION */}
        {data?.pageInfo && (
          <Pagination
            paginationSizes={paginationSizes}
            pageIndex={pageIndex}
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
        <PolicyModal
          data={activeRow}
          isOpen={isOpen}
          onClose={onClose}
          refetch={refetch}
          plSubjects={subOperators?.policySubjectOperatorMapping || []}
        />
      )}

      {isRuleOpen && (
        <RuleModal
          activeRow={activeRow}
          data={activeRule}
          isOpen={isRuleOpen}
          onClose={onRuleClose}
          refetch={refetch}
        />
      )}

      {isWarningOpen && (
        <WarnModal
          isOpen={isWarningOpen}
          onClose={onWarningClose}
          data={activeRow}
          refetch={refetch}
        />
      )}
      {isDeleteOpen && (
        <DeleteModal
          isOpen={isDeleteOpen}
          onClose={onDeleteClose}
          data={activeRow}
          refetch={refetch}
        />
      )}
    </>
  )
}

export default PolicyTable
