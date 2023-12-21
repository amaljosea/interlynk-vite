import { useMutation, useQuery } from '@apollo/client'
import {
  Box,
  Button,
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
  FormControl
} from '@chakra-ui/react'
import VulLinkRow from 'components/Tables/VulLinkRow'
import GlobalContext from 'context/GlobalContext'
import { updateCompVulnVex } from 'graphQL/Mutation'
import {
  getVexStatuses,
  getVexJustifications,
  GetCdxResponses
} from 'graphQL/Queries'
import { useEffect, useState, useContext } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

const ProdStatusDrawer = ({
  data,
  textColor,
  refetch,
  filteredData,
  filterRefetch,
  setPageIndex,
}) => {
  const location = useLocation()
  const navigate = useNavigate()
  const queryParams = new URLSearchParams(location.search)
  const productId = queryParams.get('id')
  const sbomId = queryParams.get('sbom')
  const currentProduct = JSON.parse(localStorage.getItem(`product`))
  const { data: res } = useQuery(GetCdxResponses)

  const {
    totalRows,
    setVulnFilters,
    vulnField,
    vulnDirection,
    vulnSearchInput,
    vulnSeverity,
    vulnComponent,
    vulnStatus,
    vulnKev,
    vulnEpss,
    setActiveProdTab
  } = useContext(GlobalContext)

  const { id, componentVulnLogs } = data

  const [statusTitle, setStatusTitle] = useState('')
  const [statusName, setStatusName] = useState('')
  const [justification, setJustification] = useState('')
  const [justifyName, setJustifyName] = useState('')
  const [selectedTag, setSelectedTag] = useState('')
  const [actionStatement, setActionStatement] = useState('')
  const [response, setResponse] = useState('')
  const [responseTitle, setResponseTitle] = useState('')
  const [details, setDetails] = useState('')
  const [notes, setNotes] = useState('')
  const [impactData, setImpactData] = useState('')

  const [statusResults, setStatusResults] = useState([])
  const [newVulnLogs, setNewVulnLogs] = useState([])


  const { data: allVexStatus } = useQuery(getVexStatuses)
  const { data: allVexJustify } = useQuery(getVexJustifications)

  const handleRefetch = async () => {
    const epssRange = (vulnEpss !== '' || vulnEpss !== '0-0') && vulnEpss.split('-')
    const range = {
      min: parseFloat(epssRange[0]) / 10000,
      max: parseFloat(epssRange[1]) / 10000
    }
    await refetch({
      variables: {
        projectId: productId,
        sbomId: sbomId,
        search: vulnSearchInput !== '' ? vulnSearchInput : undefined,
        severity: !vulnSeverity.includes('all') && vulnSeverity.length > 0 ? vulnSeverity : undefined,
        componentName: !vulnComponent.includes('all') && vulnComponent.length > 0 ? vulnComponent : undefined,
        status: !vulnStatus.includes('all') && vulnStatus.length > 0 ? vulnStatus : undefined,
        kev: vulnKev === 'all' || vulnKev === '' ? undefined : vulnKev === 'yes' ? true : false,
        epss: vulnEpss === 'all' || vulnEpss === '0-0' || vulnEpss === '' ? undefined : range,
        first: totalRows,
        // after: vulnAfter !== '' ? vulnAfter : undefined,
        // last: vulnBefore !== '' ? totalRows : undefined,
        // before: vulnBefore !== '' ? vulnBefore : undefined,
        field: vulnField,
        direction: vulnDirection
      }
    }).then(res => {
      if(res.data) {
        navigate(`/vendor/products/${currentProduct.name}?id=${productId}&sbom=${sbomId}`)
      }
    }).finally(()=> setActiveProdTab(3))
  }

  const [compVexCreate] = useMutation(updateCompVulnVex, {
    fetchPolicy: 'network-only',
    onCompleted: () => handleRefetch()
  })


  const handleStatusChange = (e) => {
    const { value } = e.target
    const status = e.target.options[e.target.selectedIndex].text
    setStatusTitle(value)
    setStatusName(status)
    if(status === 'False Positive') {
      setJustification(allVexJustify.vexJustifications[9].id)
    }
    if (status === 'Not Affected' || status === 'Affected') {
      setJustification('')
      setJustifyName('')
      setImpactData('')
    }
  }

  const handleResponseChange = (e) => {
    const { value } = e.target
    const title = e.target.options[e.target.selectedIndex].text
    setResponse(value)
    setResponseTitle(title)
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
    await compVexCreate({
      variables: {
        compVulnId: id,
        vexStatusId: statusTitle,
        details: details !== '' ? details : undefined,
        note: notes !== '' ? notes : undefined,
        vexJustificationId: justification !== '' ? justification : undefined,
        cdxResponseId: response !== '' ? response : undefined,
        impact: impactData === '' ? undefined : impactData,
        action: actionStatement !== '' ? actionStatement : undefined,
        fixedIn: selectedTag !== '' ? selectedTag : undefined
      }
    }).then((res) => res.data && setPageIndex(1))
  }

  const fixedVersions = filteredData.filter((item) => item.value !== sbomId)

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
  }, [componentVulnLogs])

  return (
    <Stack spacing='24px'>
      <Box>
        <SimpleGrid row={5} spacing={4}>
          {!location.pathname.startsWith('/customer') && (
            <>
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
              {/* JUSTIFICATION */}
              {(statusName === 'Not Affected' ||
                statusName === 'False Positive') && (
                <FormControl>
                  <FormLabel
                    htmlFor='justification'
                    fontSize='sm'
                    color='gray.600'
                  >
                    Justification
                  </FormLabel>
                  <Select
                    id='justification'
                    name='justification'
                    value={justification}
                    onChange={handleJustifyChange}
                    fontSize='sm'
                    color='gray.600'
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
                </FormControl>
              )}
              {/* RESPONSE */}
              {statusName === 'Affected' && (
                <FormControl>
                  <FormLabel htmlFor='response' fontSize='sm' color='gray.600'>
                    Response
                  </FormLabel>
                  {res && (
                    <Select
                      id='response'
                      name='response'
                      value={response}
                      onChange={handleResponseChange}
                      fontSize='sm'
                      color='gray.600'
                    >
                      <option value=''>-- Select --</option>
                      {res.cdxResponses.length > 0 &&
                        res.cdxResponses.map((item, idx) => (
                          <option key={idx} value={item.id}>
                            {item.name}
                          </option>
                        ))}
                    </Select>
                  )}
                </FormControl>
              )}
              {/* FIXED VERSION */}
              {statusName === 'Affected' && responseTitle === 'Update' && (
                <Stack
                  width={'100%'}
                  direction={'column'}
                  spacing={4}
                  alignItems={'flex-start'}
                >
                  <FormControl width={'100%'}>
                    <FormLabel
                      htmlFor='fixedVersion'
                      fontSize='sm'
                      color='gray.600'
                    >
                      Fixed Version
                    </FormLabel>
                    <Select
                      id='fixedVersion'
                      name='fixedVersion'
                      value={selectedTag}
                      onChange={(e) => setSelectedTag(e.target.value)}
                      fontSize='sm'
                      color='gray.600'
                    >
                      <option value=''>-- Select --</option>
                      {fixedVersions.length > 0 ? (
                        fixedVersions.map((item, index) => (
                          <option
                            key={index}
                            value={item.value}
                            name={item.label}
                          >
                            {item.label}
                          </option>
                        ))
                      ) : (
                        <option value=''>-- --</option>
                      )}
                    </Select>
                  </FormControl>
                </Stack>
              )}
              {/* IMPACT STATEMENT */}
              {(statusName === 'Not Affected' ||
                statusName === 'False Positive') && (
                <FormControl>
                  <FormLabel
                    htmlFor='impactStatement'
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
                    fontSize='sm'
                  />
                </FormControl>
              )}
              {/* ACTION STATEMENT */}
              {statusName === 'Affected' && (
                <FormControl>
                  <FormLabel
                    htmlFor='actionStatement'
                    fontSize='sm'
                    color={'gray.600'}
                  >
                    Action Statement
                  </FormLabel>
                  <Textarea
                    rows={2}
                    name='actionStatement'
                    id='actionStatement'
                    placeholder='Add statement'
                    fontSize='sm'
                    value={actionStatement}
                    onChange={(e) => setActionStatement(e.target.value)}
                  />
                </FormControl>
              )}
              {/* DETAILS */}
              {(statusName === 'In Triage' || statusName === 'Affected') && (
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
              )}
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
                (statusName === 'False Positive' && (justification === '' || impactData === '')) ||
                (statusName === 'Affected' &&
                  responseTitle === '' &&
                  actionStatement === '') ||
                (responseTitle !== '' && actionStatement === '') ||
                (responseTitle === 'update' && selectedTag === '')
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
      </Box>
    </Stack>
  )
}

export default ProdStatusDrawer
