import CustomLoader from 'components/CustomLoader'
import DataTable from 'react-data-table-component'
import { Flex, IconButton, Text, Tooltip, useToast } from '@chakra-ui/react'
import { getFullDateAndTime, timeSince, customStyles } from 'utils'
import { useEffect, useMemo, useState } from 'react'
import { useGlobalState } from 'hooks/useGlobalState'
import { RepeatIcon } from '@chakra-ui/icons'
import Pagination from 'components/Pagination'
import { SbomPolicyScan } from 'graphQL/Mutation'
import { useMutation } from '@apollo/client'
import { useLocation } from 'react-router-dom'
import { BiScan } from 'react-icons/bi'

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
      id: 'OPERATOR',
      name: 'OPERATOR',
      selector: (row) => <Text textTransform={'capitalize'}>{row?.operator}</Text>,
      width: '200px',
      wrap: true
    },
    {
      id: 'RESULT',
      name: 'RESULT',
      selector: (row) => <Text textTransform={'capitalize'}>{row?.result}</Text>,
      width: '200px',
      wrap: true
    },
    {
      id: 'RESULT_TYPE',
      name: 'RESULT TYPE',
      selector: (row) => <Text textTransform={'capitalize'}>{row?.resultType}</Text>,
      width: '250px',
      wrap: true
    },
    // CREATED AT
    {
      id: 'CREATED_AT',
      name: 'CREATED AT',
      selector: (row) => (
        <Tooltip label={getFullDateAndTime(row?.createdAt)} placement={'top'}>
          {timeSince(row?.createdAt)}
        </Tooltip>
      ),
      right: 'true',
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
      right: 'true',
      wrap: true
    }
  ]

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
        />
      </Flex>
    </>
  )
}

export default PolicyEvalTable
