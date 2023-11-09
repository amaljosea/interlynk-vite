import { useMutation, useQuery } from '@apollo/client'
import {
  Box,
  Button,
  Divider,
  FormLabel,
  Select,
  SimpleGrid,
  Stack,
  Table,
  Tbody,
  Text,
  Textarea,
  Th,
  Thead,
  Tr,
  Flex,
  Input,
  FormControl
} from '@chakra-ui/react'
import VulLinkRow from 'components/Tables/VulLinkRow'
import GlobalContext from 'context/GlobalContext'
import { updateCompVulnVex } from 'graphQL/Mutation'
import { getVexStatuses, getVexJustifications } from 'graphQL/Queries'
import { useEffect, useState, useContext } from 'react'
import { useLocation } from 'react-router-dom'

const ProdStatusDrawer = ({
  data,
  textColor,
  refetch,
  filteredData,
  totalRows,
  filterRefetch
}) => {
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const productId = queryParams.get('p')
  const sbomId = queryParams.get('sbom')

  const { setVulnFilters, vulnField, vulnDirection } = useContext(GlobalContext)

  const { vexStatus, id, componentVulnLogs, vexJustification, impact } = data

  const [statusTitle, setStatusTitle] = useState('')
  const [statusName, setStatusName] = useState('')
  const [otherVersion, setOtherVersion] = useState('')
  const [justification, setJustification] = useState('')
  const [justifyName, setJustifyName] = useState('')
  const [selectedTag, setSelectedTag] = useState('')
  const [notes, setNotes] = useState('')
  const [impactData, setImpactData] = useState('')

  const [statusResults, setStatusResults] = useState([])
  const [newVulnLogs, setNewVulnLogs] = useState([])

  const { data: allVexStatus } = useQuery(getVexStatuses)
  const { data: allVexJustify } = useQuery(getVexJustifications)

  const [compVexCreate] = useMutation(updateCompVulnVex, {
    onCompleted: () => {
      refetch({
        variables: {
          projectId: productId,
          sbomId: sbomId,
          first: totalRows,
          field: vulnField,
          direction: vulnDirection
        }
      })
    }
  })

  const handleStatusChange = (e) => {
    const { value } = e.target
    const status = e.target.options[e.target.selectedIndex].text
    setStatusTitle(value)
    setStatusName(status)
    if (status === 'Not Affected' || status === 'Affected') {
      setJustifyName('')
      setImpactData('')
    }
  }

  const handleJustifyChange = (e) => {
    const { value } = e.target
    setJustification(value)
    setJustifyName(e.target.options[e.target.selectedIndex].text)
  }

  const onFilterRefetch = () => {
    filterRefetch({
      projectId: productId,
      sbomId: sbomId
    }).then((res) => setVulnFilters(res.data.sbom.filters))
  }

  const handleSave = async () => {
    try {
      await compVexCreate({
        variables: {
          compVulnId: id,
          notes: notes,
          sbomId: sbomId,
          vexStatusId: statusTitle,
          vexJustificationId:
            statusName === 'Not Affected' ? justification : undefined,
          impact: impactData
        }
      }).then((res) => {
        if (res.data) {
          onFilterRefetch()
        }
      })
    } catch (error) {
      console.log('Mutation error', error)
    }
  }

  useEffect(() => {
    if (componentVulnLogs) {
      const sortedData =
        componentVulnLogs &&
        [...componentVulnLogs].sort((a, b) => {
          const dateA = new Date(a.updatedAt).getTime()
          const dateB = new Date(b.updatedAt).getTime()
          return dateB - dateA
        })
      setStatusResults(sortedData)
    }
  }, [data])

  return (
    <Stack spacing='24px'>
      <Box>
        <SimpleGrid row={5} spacing={4}>
          {!location.pathname.startsWith('/customer') && (
            <>
              <Box>
                <FormLabel mb={1} fontSize='sm' color='gray.600'>
                  Status
                </FormLabel>
                <Select
                  id='product'
                  size='sm'
                  color='gray.500'
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
              </Box>
              {statusName === 'Not Affected' && (
                <Box>
                  <FormLabel htmlFor='product' fontSize='sm' color='gray.600'>
                    Justification
                  </FormLabel>
                  <Select
                    id='justification'
                    value={justification}
                    onChange={handleJustifyChange}
                    size='sm'
                    color='gray.500'
                  >
                    <option value=''>-- Select --</option>
                    {allVexJustify ? (
                      allVexJustify.vexJustifications.map((justify, idx) => (
                        <option key={idx} value={justify.id}>
                          {justify.name}
                        </option>
                      ))
                    ) : (
                      <option value={''}>No data found</option>
                    )}
                  </Select>
                </Box>
              )}
              {statusName === 'Fixed' && (
                <Stack
                  width={'100%'}
                  direction={'column'}
                  spacing={4}
                  alignItems={'flex-start'}
                >
                  <Box width={'100%'}>
                    <Text mb={1} fontSize='sm' color='gray.600'>
                      Version
                    </Text>
                    <Select
                      id='tag'
                      value={selectedTag}
                      onChange={(e) => setSelectedTag(e.target.value)}
                      size='sm'
                      color='gray.500'
                    >
                      {filteredData && filteredData.length > 0 ? (
                        filteredData.map((item, index) => (
                          <option
                            key={index}
                            value={item.id}
                            name={item.version}
                          >
                            {item.version}
                          </option>
                        ))
                      ) : (
                        <option value=''>-- --</option>
                      )}
                    </Select>
                  </Box>
                  <Box width={'100%'}>
                    <Text mb={1} fontSize='sm' color='gray.600'>
                      Other Version
                    </Text>
                    <Input
                      size='sm'
                      value={otherVersion}
                      onChange={(e) => setOtherVersion(e.target.value)}
                    />
                  </Box>
                </Stack>
              )}
              {(statusName === 'Affected' || statusName === 'Not Affected') && (
                <FormControl>
                  <FormLabel
                    htmlFor='impactStatement'
                    mb={1}
                    fontSize='sm'
                    color='gray.600'
                  >
                    Impact Statement
                  </FormLabel>
                  <Textarea
                    type='text'
                    name='impactStatement'
                    rows={2}
                    id='impactStatement'
                    placeholder='Add impact statement'
                    value={impactData}
                    onChange={(e) => setImpactData(e.target.value)}
                    size='sm'
                  />
                </FormControl>
              )}
              <Box>
                <FormLabel mb={1} fontSize='sm' color='gray.600'>
                  Notes
                </FormLabel>
                <Textarea
                  placeholder='Add notes'
                  size='sm'
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </Box>
            </>
          )}
          {!location.pathname.startsWith('/customer') && (
            <Button
              width={'fit-content'}
              colorScheme='blue'
              onClick={handleSave}
              disabled={
                statusTitle === '' ||
                (statusName === 'Not Affected' && justification === '') ||
                (justifyName === 'Other (impact statment required)' &&
                  impactData === '') ||
                (statusName === 'Affected' && impactData === '')
              }
            >
              Add
            </Button>
          )}
          {/* STATUS HISTORY */}
          <Flex flexDir={'column'}>
            <Text size='md' my={2}>
              Status History
            </Text>
            {(componentVulnLogs.length > 0 || newVulnLogs.length > 0) && (
              <Table variant='simple' color={textColor} size='sm' my={2}>
                <Thead>
                  <Tr my='.8rem'>
                    {[
                      'Username',
                      'Status',
                      'Justification',
                      'Timestamp',
                      'Impact',
                      'Note'
                    ].map((item, index) => (
                      <Th key={index} color='gray.400' pl={0}>
                        <Box>{item}</Box>
                      </Th>
                    ))}
                  </Tr>
                </Thead>
                <Tbody>
                  {statusResults.length > 0 &&
                    statusResults.map((item) => (
                      <VulLinkRow
                        key={item.id}
                        id={item.id}
                        username={item.changedBy}
                        justification={item.justification}
                        status={item.status}
                        timestamp={item.updatedAt}
                        note={item.note}
                        impact={item.impact}
                      />
                    ))}
                </Tbody>
              </Table>
            )}

            {componentVulnLogs.length === 0 && newVulnLogs.length === 0 && (
              <Text color={'darkgrey'}>No status history found</Text>
            )}
          </Flex>
        </SimpleGrid>
        <Divider />
      </Box>
    </Stack>
  )
}

export default ProdStatusDrawer
