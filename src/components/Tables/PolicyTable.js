import CustomLoader from 'components/CustomLoader'
import DataTable from 'react-data-table-component'
import styled from '@emotion/styled'
import { Box, Flex, Grid, GridItem, Heading, IconButton, Input, Menu, MenuButton, MenuItem, MenuList, Portal, Stack, Switch, Text, Tooltip, useDisclosure, useToast } from '@chakra-ui/react'
import { customStyles } from 'utils'
import { getFullDateAndTime, timeSince } from 'utils'
import { FaEllipsisV, FaPlus } from 'react-icons/fa'
import { useEffect, useMemo, useState } from 'react'
import SearchFilter from 'views/Sbom/components/SearchFilter'
import { useGlobalState } from 'hooks/useGlobalState'
import { RepeatIcon } from '@chakra-ui/icons'
import Pagination from 'components/Pagination'
import PolicyModal from 'views/Dashboard/Policies/PolicyModal'
import { PolicyUpdate, PolicyDelete } from 'graphQL/Mutation'
import { useMutation } from '@apollo/client'
import { FaPen, FaTrash } from 'react-icons/fa6'
import RuleModal from 'views/Dashboard/Policies/RuleModal'
import { DeletePolicyRule } from 'graphQL/Mutation'

const PolicyTable = ({ data, refetch }) => {
  const toast = useToast()
  const { totalRows, policyState, dispatch } = useGlobalState()
  const { pageIndex, searchInput } = policyState
  const { policyDispatch } = dispatch

  const paginationSizes = [25, 50, 100]
  const [activeRow, setActiveRow] = useState(null)
  const [activeRule, setActiveRule] = useState(null)
  const [filterText, setFilterText] = useState(searchInput)
  const [isPrevActive, setIsPrevActive] = useState(false)
  const [isNextActive, setIsNextActive] = useState(false)

  const [updatePolicy] = useMutation(PolicyUpdate)
  const [deletePolicy] = useMutation(PolicyDelete)
  const [onDeleteRule] = useMutation(DeletePolicyRule)

  const policyData = {
    search: searchInput === '' ? undefined : searchInput,
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
  const { isOpen: isRuleOpen, onOpen: onRuleOpen, onClose: onRuleClose } = useDisclosure()

  const handleRefresh = async () => {
    disablePaginationControl()
    await refetch({
      variables: {
        search: searchInput === '' ? undefined : searchInput,
        first: totalRows
      }
    }).then(
      (res) => res?.data && policyDispatch({ type: 'CLEAR_SEARCH_INPUT' })
    )
  }

  // CLEAR SERACH
  const handleClear = async () => {
    setFilterText('')
    await refetch({ variables: { search: undefined, first: totalRows } }).then(
      (res) => res?.data && policyDispatch({ type: 'CLEAR_SEARCH_INPUT' })
    )
  }

  // ON SEARCH INPUT CHANGE
  const onSearchInputChange = (e) => {
    const { value } = e.target
    if (value === '') {
      handleClear()
    } else {
      setFilterText(value)
    }
  }

  // SEARCH COMPONENT
  const handleSearch = async (event) => {
    const { value } = event.target
    if (event.key === 'Enter' && filterText !== '') {
      refetch({ variables: { search: value, first: totalRows } }).then(
        (res) =>
          res?.data &&
          policyDispatch({ type: 'CHANGE_SEARCH_INPUT', payload: value })
      )
    }
  }

  const onChangeStatus = async (e, row) => {
    e.preventDefault()
    await updatePolicy({
      variables: { id: row?.id, isEnabled: e.target.checked }
    }).then((res) => {
      const errors = res?.data?.policyUpdate?.errors
      if (errors?.length > 0) {
        toast({ description: errors[0], status: 'error', position: 'top', duration: 2000 })
      } else {
        refetch({ variables: { ...policyData } })
      }
    })
  }

  const onDeletePolicy = async (id) => {
    await deletePolicy({
      variables: { id }
    }).then((res) => {
      const errors = res?.data?.policyDelete?.errors
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

  const handlePreviousPage = () => {}
  const handleNextPage = () => {}
  const handleSetRow = () => {}

  const handleDeleteRule = async (rule) => {
    await onDeleteRule({
      variables: { id: rule?.id }
    }).then((res) => {
      const errors = res?.data?.policyRuleDelete?.errors
      if (errors?.length > 0) {
        toast({ description: errors[0], status: 'error', position: 'top', duration: 2000 })
      } else {
        refetch({ variables: { ...policyData } })
      }
    })
  }

  // SUB HEADER
  const subHeader = useMemo(() => {
    return (
      <Flex
        width={'100%'}
        alignItems={'center'}
        justifyContent={'space-between'}
      >
        {/* SEARCH COMPONENTS */}
        <SearchFilter id='support' filterText={filterText} onChange={onSearchInputChange} onClear={handleClear} onFilter={handleSearch} />
        <Stack spacing={2} alignItems={'center'} direction={'row'}>
          <Tooltip label='Create Policy'>
            <IconButton
              colorScheme='blue'
              onClick={() => {
                setActiveRow(null)
                onOpen()
              }}
              icon={<FaPlus />}
            />
          </Tooltip>
          <Tooltip label='Refresh'>
            <IconButton colorScheme='blue' onClick={handleRefresh} icon={<RepeatIcon />} />
          </Tooltip>
        </Stack>
      </Flex>
    )
  }, [ filterText, onSearchInputChange, handleClear, handleSearch, handleRefresh ])

  // COLUMNS
  const columns = [
    {
      id: 'ACTIVE',
      name: 'ACTIVE',
      selector: (row) => {
        const { isEnabled } = row
        return (
          <Switch size='md' isChecked={isEnabled} onChange={(e) => onChangeStatus(e, row)} />
        )
      },
      width: '150px'
    },
    {
      id: 'NAME',
      name: 'NAME',
      selector: (row) => <Text my={4}>{row?.name}</Text>,
      wrap: true,
      width: '350px'
    },
    {
      id: 'OPERATOR',
      name: 'OPERATOR',
      selector: (row) => (
        <Text textTransform={'capitalize'}>
          {row?.operator === 0 ? 'Any' : row?.operator === 1 ? 'All' : ''}
        </Text>
      ),
      width: '200px',
      wrap: true
    },
    {
      id: 'RESULT_TYPE',
      name: 'RESULT TYPE',
      selector: (row) => (
        <Text textTransform={'capitalize'}>{row?.resultType}</Text>
      ),
      width: '250px',
      wrap: true
    },
    // UPDATED AT
    {
      id: 'UPDATED_AT',
      name: 'UPDATED AT',
      selector: (row) => (
        <Tooltip label={getFullDateAndTime(row?.updatedAt)} placement={'top'}>
          {timeSince(row?.updatedAt)}
        </Tooltip>
      ),
      width: '160px',
      right: 'true',
      wrap: true
    },
    {
      id: 'ACTION',
      name: 'ACTION',
      selector: (row) => {
        return (
          <Menu>
            <MenuButton as={IconButton} icon={<FaEllipsisV />} variant='none' color='gray.400' />
            <Portal>
              <MenuList fontSize={'sm'}>
                {/* EDIT POLICY */}
                <MenuItem
                  onClick={() => {
                    setActiveRow(row)
                    onOpen()
                  }}
                >
                  Edit Policy
                </MenuItem>
                {/* ADD POLICY RULE */}
                <MenuItem
                  onClick={() => {
                    setActiveRow(row)
                    setActiveRule(null)
                    onRuleOpen()
                  }}
                >
                  Add Policy Rule
                </MenuItem>
                {/* DELETE POLICY  */}
                <MenuItem color='red' onClick={() => onDeletePolicy(row?.id)}>
                  Archive Policy
                </MenuItem>
              </MenuList>
            </Portal>
          </Menu>
        )
      },
      right: 'true'
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
        <Heading mb={6} fontFamily={'inherit'} fontSize={'sm'} color={'#555'} width={'90%'} mx={'auto'} >
          CONDITIONS
        </Heading>
        <Grid width={'90%'} templateColumns='repeat(12, 1fr)' gap={6} mb={4} mx={'auto'} >
          <GridItem colSpan={3}>
            <CustomText>subject</CustomText>
          </GridItem>
          <GridItem colSpan={3}>
            <CustomText>operator</CustomText>
          </GridItem>
          <GridItem colSpan={5}>
            <CustomText>value</CustomText>
          </GridItem>
          <GridItem colSpan={1}></GridItem>
        </Grid>
        {policyRules?.map((item, index) => (
          <Grid width={'90%'} templateColumns='repeat(12, 1fr)' gap={6} mb={3} mx={'auto'} >
            <GridItem colSpan={3}>
              <Input bg={'#EDF2F7'} size='sm' fontSize={'sm'} isReadOnly defaultValue={item?.subject} />
            </GridItem>
            <GridItem colSpan={3}>
              <Input bg={'#EDF2F7'} size='sm' fontSize={'sm'} isReadOnly defaultValue={item?.operator} />
            </GridItem>
            <GridItem colSpan={5}>
              <Input bg={'#EDF2F7'} size='sm' fontSize={'sm'} isReadOnly defaultValue={item?.value} />
            </GridItem>
            <GridItem colSpan={1}>
              <Flex gap={3} justifyContent={'flex-end'}>
                <IconButton
                  size='sm'
                  colorScheme='blue'
                  icon={<FaPen />}
                  onClick={() => {
                    setActiveRule(item)
                    onRuleOpen()
                  }}
                />
                <IconButton size='sm' colorScheme='red' icon={<FaTrash />} onClick={() => handleDeleteRule(item)} />
              </Flex>
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
    </>
  )
}

export default PolicyTable
