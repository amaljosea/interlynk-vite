// Chakra imports
import {
  Flex,
  Text,
  Tag,
  TagLabel,
  Tooltip,
  Button,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  SimpleGrid,
  FormControl,
  FormLabel,
  Select,
  Textarea,
  Stack,
  Box
} from '@chakra-ui/react'
import DataTable from 'react-data-table-component'
import { useEffect, useMemo, useState } from 'react'
import CustomLoader from 'components/CustomLoader'
import Filters from './Filters'
import { getVexStatuses, getVexJustifications } from 'graphQL/Queries'
import { useLazyQuery } from '@apollo/client'
import { useGlobalState } from 'hooks/useGlobalState'

const customStyles = {
  headCells: {
    style: {
      fontWeight: 'bold',
      color: '#2D3748',
      fontSize: '12px',
      letterSpacing: '1px'
    }
  },
  subHeader: {
    style: {
      padding: 0,
      margin: 0
    }
  }
}

const statusColor = (status) => {
  if (status && status === 'Fixed') {
    return 'blue'
  } else if (status && status === 'Not Affected') {
    return 'green'
  } else if (status && status === 'Affected') {
    return 'red'
  } else if (status && status === 'False Positive') {
    return 'purple'
  } else if (status && status === 'In Triage') {
    return 'cyan'
  } else {
    return 'gray'
  }
}

const VulnProdTable = ({ data }) => {
  const { totalRows } = useGlobalState()

  const [getStatus, { data: allVexStatus }] = useLazyQuery(getVexStatuses)

  const [selectedVulns, setSelectedVulns] = useState([])
  const [pageIndex, setPageIndex] = useState(1)
  const [isPrevActive, setIsPrevActive] = useState(false)
  const [isNextActive, setIsNextActive] = useState(false)
  const { isOpen, onOpen, onClose } = useDisclosure()

  const [statusTitle, setStatusTitle] = useState('')
  const [details, setDetails] = useState('')
  const [notes, setNotes] = useState('')

  const handleStatusChange = (e) => {
    const { value } = e.target
    const status = e.target.options[e.target.selectedIndex].text
    setStatusTitle(value)
  }

  // COLUMNS
  const columns = [
    // PRODUCTS
    {
      id: 'PRODUCT_NAME',
      name: 'PRODUCT',
      selector: (row) => {
        const { component } = row
        return (
          <Tooltip
            label={component?.sbom?.project?.projectGroup?.name || ''}
            placement='top'
          >
            <Text textTransform={'capitalize'}>
              {component?.sbom?.project?.projectGroup?.name || ''}
            </Text>
          </Tooltip>
        )
      },
      wrap: true,
      width: '15%'
    },
    // VERSION
    {
      id: 'PRODUCT_VERSIONN',
      name: 'VERSION',
      selector: (row) => (
        <Tooltip
          label={row?.component?.sbom?.primaryComponent?.version || ''}
          placement='top'
        >
          {row?.component?.sbom?.primaryComponent?.version || ''}
        </Tooltip>
      ),
      wrap: true,
      width: '12%'
    },
    // VULN COMPONENT
    {
      id: 'COMPONENTS_NAME',
      name: 'COMPONENT',
      selector: (row) => {
        const { component } = row
        return (
          <Tooltip label={component?.name} placement='top'>
            <Text textTransform={'capitalize'}>{component?.name || ''}</Text>
          </Tooltip>
        )
      },
      wrap: true,
      width: '15%'
    },
    // VULN VERSION
    {
      id: 'COMPONENTS_VERSION',
      name: 'VERSION',
      selector: (row) => (
        <Tooltip label={row?.component?.version} placement='top'>
          {row?.component?.version || ''}
        </Tooltip>
      ),
      wrap: true,
      width: '12%'
    },
    // STATUS
    {
      id: 'VEX_STATUSES_NAME',
      name: 'STATUS',
      selector: (row) => {
        const { vexStatus } = row
        return (
          <Tag
            size='md'
            variant='solid'
            width={'130px'}
            colorScheme={statusColor(vexStatus?.name || 'Unspecified')}
          >
            <TagLabel style={{ textTransform: 'capitalize' }} mx={'auto'}>
              {vexStatus?.name || 'Unspecified'}
            </TagLabel>
          </Tag>
        )
      },
      sortable: true,
      width: '150px'
    }
  ]

  const subHeaderComponent = useMemo(() => {
    return (
      <Flex
        width={'100%'}
        alignItems={'center'}
        justifyContent={'space-between'}
      >
        {/* FILTER */}
        <Filters />

        {/* UPDATE STATUES */}
        {selectedVulns.length > 0 && (
          <Button
            variant='solid'
            colorScheme='blue'
            fontWeight='normal'
            fontSize={'sm'}
            onClick={() => {
              getStatus().then((res) => res.data && onOpen())
            }}
          >
            Set Status
          </Button>
        )}
      </Flex>
    )
  }, [selectedVulns])

  const handleChange = (state) => {
    setSelectedVulns(state.selectedRows)
  }

  // ON PREV PAGE
  const handlePreviousPage = async () => {}

  // ON NEXT PAGE
  const handleNextPage = async () => {}

  // ON SET ROW
  const handleSetRow = async (e) => {}

  useEffect(() => {
    if (data) {
      setIsPrevActive(data?.pageInfo?.hasPreviousPage)
      setIsNextActive(data?.pageInfo?.hasNextPage)
    }
  }, [data])

  return (
    <>
      {/* TABLE */}
      <Flex flexDir={'column'} width={'100%'}>
        <DataTable
          columns={columns}
          data={data?.nodes || []}
          customStyles={customStyles}
          progressPending={data ? false : true}
          progressComponent={<CustomLoader />}
          subHeader
          subHeaderComponent={subHeaderComponent}
          responsive
          persistTableHead
          selectableRows
          onSelectedRowsChange={handleChange}
        />

        {data && (
          <Flex
            width={'100%'}
            flexDir={'row'}
            gap={4}
            alignItems={'center'}
            mt={6}
            justifyContent={'space-between'}
            flexWrap={'wrap'}
          >
            <Stack alignItems={'center'} direction={'row'} spacing={4}>
              <Button
                colorScheme='blue'
                onClick={handlePreviousPage}
                isDisabled={!isPrevActive}
              >
                Prev
              </Button>
              <Button
                colorScheme='blue'
                onClick={handleNextPage}
                isDisabled={!isNextActive}
              >
                Next
              </Button>
              <Box>
                Page {pageIndex} of{' '}
                {data.totalCount === 0
                  ? 1
                  : Math.ceil(data.totalCount / totalRows)}
              </Box>
            </Stack>

            <Stack alignItems={'center'} direction={'row'} spacing={4}>
              <Text>Show</Text>
              <Select
                width={20}
                value={totalRows}
                onChange={handleSetRow}
                id='rowlimit'
                name='rowlimit'
              >
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </Select>
            </Stack>
          </Flex>
        )}
      </Flex>

      {isOpen && selectedVulns.length > 0 && (
        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Update Status</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <SimpleGrid row={5} spacing={4}>
                {/* TYPES */}
                <FormControl>
                  <FormLabel htmlFor='vexType' fontSize='sm' color={'gray.600'}>
                    Status
                  </FormLabel>
                  <Select
                    id='vexType'
                    name='vexType'
                    fontSize='sm'
                    value={statusTitle}
                    onChange={handleStatusChange}
                  >
                    <option value=''>-- Select Status --</option>
                    {allVexStatus ? (
                      allVexStatus.vexStatuses.map((st, idx) => (
                        <option key={idx} value={st.id}>
                          {st.name}
                        </option>
                      ))
                    ) : (
                      <option value={''}>No data found</option>
                    )}
                  </Select>
                </FormControl>
                {/* DETAILS */}
                <FormControl>
                  <FormLabel htmlFor='details' fontSize='sm' color={'gray.600'}>
                    Details
                  </FormLabel>
                  <Textarea
                    rows={2}
                    name='details'
                    id='details'
                    placeholder='Add details'
                    fontSize='sm'
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                  />
                </FormControl>
                {/* INTERNAL NOTES */}
                <FormControl>
                  <FormLabel
                    htmlFor='internalNotes'
                    fontSize='sm'
                    color={'gray.600'}
                  >
                    Internal Notes
                  </FormLabel>
                  <Textarea
                    rows={2}
                    name='internalNotes'
                    id='internalNotes'
                    placeholder='Add notes'
                    fontSize='sm'
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </FormControl>
              </SimpleGrid>
            </ModalBody>
            <ModalFooter>
              <Button mr={3} onClick={onClose}>
                Close
              </Button>
              <Button variant='solid' colorScheme='blue' m>
                Save
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </>
  )
}

export default VulnProdTable
