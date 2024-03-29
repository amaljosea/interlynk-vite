import CustomLoader from 'components/CustomLoader'
import DataTable from 'react-data-table-component'
import { Box, Flex, Grid, GridItem, Heading, IconButton, Tag, TagLabel, Text, Tooltip, useToast } from '@chakra-ui/react'
import styled from '@emotion/styled'
import { getFullDateAndTime, timeSince, customStyles } from 'utils'
import { useEffect, useMemo, useState } from 'react'
import { useGlobalState } from 'hooks/useGlobalState'
import { RepeatIcon } from '@chakra-ui/icons'
import Pagination from 'components/Pagination'
import { SbomPolicyScan } from 'graphQL/Mutation'
import { useMutation } from '@apollo/client'
import { useLocation } from 'react-router-dom'
import { BiScan } from 'react-icons/bi'
import { updatedValue } from 'utils'

const PolicyEvalTable = ({ data }) => {
  const toast = useToast()
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const productId = queryParams.get('id')
  const sbomId = queryParams.get('sbom')

  const paginationSizes = [25, 50, 100]
  const [activeRow, setActiveRow] = useState(null)
  const [activeRule, setActiveRule] = useState(null)
  const [filterText, setFilterText] = useState('')
  const [isPrevActive, setIsPrevActive] = useState(false)
  const [isNextActive, setIsNextActive] = useState(false)

  const [policyScan] = useMutation(SbomPolicyScan)

  const setPaginationControl = (data) => {
    setIsPrevActive(data?.pageInfo?.hasPreviousPage)
    setIsNextActive(data?.pageInfo?.hasNextPage)
  }

  const disablePaginationControl = () => {
    setIsPrevActive(false)
    setIsNextActive(false)
  }

  const handleRefresh = async () => {
    disablePaginationControl()
    await policyScan({ variables: { sbomId } }).then(
      (res) => res?.data && console.log(res?.data)
    )
  }

  const handlePreviousPage = () => {}
  const handleNextPage = () => {}
  const handleSetRow = () => {}

  // SUB HEADER
  const subHeader = useMemo(() => {
    return (
      <Flex width={'100%'} alignItems={'center'} justifyContent={'flex-end'}>
        <Tooltip label='Policy Scan'>
          <IconButton  colorScheme='blue' onClick={handleRefresh} icon={<BiScan size={20}/>} />
        </Tooltip>
      </Flex>
    )
  }, [handleRefresh])

  // COLUMNS
  const columns = [
    {
      id: 'POLICY',
      name: 'POLICY',
      selector: (row) => <Text textTransform={'capitalize'}>{row?.policy?.name}</Text>,
      width: '400px',
      wrap: true
    },
    {
      id: 'RESULT',
      name: 'RESULT',
      selector: (row) => {
        const {resultType} = row
        return (
        <Tag width={'80px'} colorScheme={resultType === 'inform' ? 'blue' : resultType === 'warn' ? 'orange' : 'red'}>  
          <TagLabel fontSize={'xs'} style={{ textTransform: 'uppercase' }} mx={'auto'}>{resultType}</TagLabel>
        </Tag>
      )},
      width: '250px',
      wrap: true
    },
    // CREATED AT
    {
      id: 'CHECKED_AT',
      name: 'CHECKED AT',
      selector: (row) => (
        <Tooltip label={getFullDateAndTime(row?.createdAt)} placement={'top'}>
          {timeSince(row?.createdAt)}
        </Tooltip>
      ),
      right: 'true',
      wrap: true
    }
  ]

   // EXPAND VIEW
   const ExpandedComponent = ({ data }) => {
    const { policyRules } = data?.policy
    const CustomText = styled(Text)`
      font-size: 13px;
      font-weight: bold;
      color: #718096;
      text-transform: uppercase;
      letter-spacing: 0.6px;
    `
    return (
      <Box width={'100%'} p={5} boxShadow='inset 0px -5px 5px rgba(0, 0, 0, 0.08), inset 0px 5px 5px rgba(0, 0, 0, 0.08)'>
        <Heading mb={6} fontFamily={'inherit'} fontSize={'sm'} color={'#555'} width={'90%'} mx={'auto'} >
          CONDITIONS
        </Heading>
        <Grid width={'90%'} templateColumns='repeat(3, 1fr)' gap={6} mb={4} mx={'auto'} >
          <GridItem><CustomText>subject</CustomText></GridItem>
          <GridItem><CustomText>operator</CustomText></GridItem>
          <GridItem><CustomText>value</CustomText></GridItem>
        </Grid>
        {policyRules?.map((item, index) => (
          <Grid width={'90%'} templateColumns='repeat(3, 1fr)' gap={6} mb={1} mx={'auto'} bg={'#EDF2F7'} p={2}>
            <GridItem>
              <Text fontSize={'sm'}>{updatedValue(item?.subject)}</Text>
            </GridItem>
            <GridItem>
              <Text fontSize={'sm'}>{updatedValue(item?.operator)}</Text>
            </GridItem>
            <GridItem>
              <Text fontSize={'sm'} hidden={item?.operator === 'EXISTS' || item?.operator === 'NOT_EXISTS'}>{updatedValue(item?.value)} {item?.subject === 'VULNERABILITY_EPSS' && (item?.operator === 'LESS_THAN' || item?.operator === 'MORE_THAN') ? ' %' : ''}</Text>
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
        <DataTable columns={columns} data={data?.nodes || []} customStyles={customStyles} progressPending={data ? false : true} progressComponent={<CustomLoader />} subHeader subHeaderComponent={subHeader} persistTableHead responsive={true} expandableRows expandOnRowClicked expandableRowsComponent={ExpandedComponent} />
      </Flex>
    </>
  )
}

export default PolicyEvalTable
