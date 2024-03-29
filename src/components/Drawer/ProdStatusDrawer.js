import { useMutation, useQuery } from '@apollo/client'
import { CheckIcon, InfoIcon } from '@chakra-ui/icons'
import { Box, Button, FormLabel, Select, SimpleGrid, Stack, Table, Tbody, Text, Textarea, Th, Thead, Tr, Flex, FormControl, Checkbox, useDisclosure, Icon, IconButton, Alert, AlertIcon, AlertDescription } from '@chakra-ui/react'
import Card from 'components/Card/Card'
import InfoModal from 'components/InfoModal'
import VulLinkRow from 'components/Tables/VulLinkRow'
import { updateCompVulnVex } from 'graphQL/Mutation'
import { getVexStatuses, getVexJustifications, GetCdxResponses } from 'graphQL/Queries'
import { useGlobalState } from 'hooks/useGlobalState'
import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { capitalizeFirstLetter } from 'utils'

const InfoLabel = ({ title, name, onClick }) => {
  return (
    <Flex flexDirection={'row'} alignItems={'center'} gap={2} mb={1}>
      <FormLabel m={0} p={0} fontSize='sm' color={'gray.600'} htmlFor={name}>{title}</FormLabel>
      <Icon as={InfoIcon} color={'blue.500'} cursor={'pointer'} onClick={onClick} />
    </Flex>
  )
}

const ProdStatusDrawer = ({ data, textColor, refetch, filteredData }) => {
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const productId = queryParams.get('id')
  const sbomId = queryParams.get('sbom')
  const signedUrlParams = sessionStorage.getItem('signedUrlParams')
  const { data: res } = useQuery(GetCdxResponses, { skip: signedUrlParams })

  const { totalRows, userPermissions, prodVulnState, dispatch } = useGlobalState()
  const { field, direction, searchInput, severities, components, statues, kev, epss } = prodVulnState
  const { prodVulnDispatch } = dispatch

  const sboms = userPermissions?.find((item) => item.key === 'view_sbom')
  const editVulns = sboms?.supersededBy?.some((permission) =>permission.key === 'edit_vulnerabilities' && permission.value === true)

  const { id, componentVulnLogs, vexStatus, vexJustification, cdxResponse } = data

  const {isOpen, onOpen, onClose} = useDisclosure()

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
  const [upstream, setUpstream] = useState(false)
  const [statusResults, setStatusResults] = useState([])
  const [newVulnLogs, setNewVulnLogs] = useState([])
  const [infoHeading, setInfoHeading] = useState('')
  const [infoText, setInfoText] = useState('')
  const [infoUrl, setInfoUrl] = useState('')
  const [error, setError] = useState('')

  const { data: allVexStatus } = useQuery(getVexStatuses, {skip: signedUrlParams})
  const { data: allVexJustify } = useQuery(getVexJustifications, {skip: signedUrlParams})

  const onCheckStatus = () => {
    setInfoHeading(`Status`)
    setInfoText(`Declares the current state of an occurrence of a vulnerability, after automated or manual analysis.`)
    setInfoUrl(``)
    onOpen()
  }

  const onCheckJustify = () => {
    setInfoHeading(`Justification`)
    setInfoText(`For statements conveying a "not affected" status, a VEX statement MUST include either a status justification or
    an impact statement informing why the product is not affected by the vulnerability.
    Justifications are fixed labels defined by VEX. See Status Justifications below for valid values.`)
    setInfoUrl(``)
    onOpen()
  }

  const onCheckResponse = () => {
    setInfoHeading(`Response`)
    setInfoText(`A response to the vulnerability by the manufacturer, supplier, or project responsible for the affected component or service. Responses are strongly encouraged for vulnerabilities where the analysis state is exploitable.`)
    setInfoUrl(``)
    onOpen()
  }

  const onCheckFixedVersion = () => {
    setInfoHeading(`Fixed Version`)
    setInfoText(`For "affected" status with "update" response, Fixed Version can be used to indicate which version of the product includes a fix.`)
    setInfoUrl(``)
    onOpen()
  }

  const onCheckImpact = () => {
    setInfoHeading(`Impact Statement`)
    setInfoText(`For status “not affected”, if justification is not provided, an impact statement must be included \
    that further explains how or why the listed product is “not affected” by this vulnerability. Impact Statement is optional if a justification is provided.`)
    setInfoUrl(``)
    onOpen()
  }

  const onCheckAction = () => {
    setInfoHeading(`Action Statement`)
    setInfoText(`For status “affected”, an action statement must be included that describes actions to remediate or mitigate the vulnerability.`)
    setInfoUrl(``)
    onOpen()
  }

  const onCheckDetails = () => {
    setInfoHeading(`Details`)
    setInfoText(`Detailed description of the impact including methods used during assessment. If a vulnerability is not exploitable, this field should include specific details on why the component or service is not impacted by this vulnerability.`)
    setInfoUrl(``)
    onOpen()
  }

  const onCheckNotes = () => {
    setInfoHeading(`Internal Notes`)
    setInfoText(` Internal notes or observations made by the team handling the vulnerability, which may include additional context, discussions, or considerations relevant to the analysis or response process. \
    These notes are not exported with the product SBOM or VEX are only used for internal communication and documentation purposes.`)
    setInfoUrl(``)
    onOpen()
  }

  const handleRefetch = async () => {
    const epssRange = (epss !== '' || epss !== '0-0') && epss.split('-')
    const range = { min: parseFloat(epssRange[0]) / 100, max: parseFloat(epssRange[1]) / 100 }
    await refetch({
      projectId: productId,
      sbomId: sbomId,
      search: searchInput !== '' ? searchInput : undefined,
      severity: !severities.includes('all') && severities.length > 0 ? severities : undefined,
      componentName: !components.includes('all') && components.length > 0 ? components : undefined,
      status: !statues.includes('all') && statues.length > 0 ? statues : undefined,
      kev: kev === 'all' || kev === '' ? undefined : kev === 'yes' ? true : false,
      epss: epss === 'all' || epss === '0-0' || epss === '' ? undefined : range,
      first: totalRows,
      last: undefined,
      after: undefined,
      before: undefined,
      field: field,
      direction: direction
    })
  }

  const [compVexCreate] = useMutation(updateCompVulnVex, {
    fetchPolicy: 'network-only',
    onCompleted: handleRefetch
  })

  const fixedVersions = filteredData?.filter((item) => item.value !== sbomId)

  const handleStatusChange = (e) => {
    const { value } = e.target
    const status = e.target.options[e.target.selectedIndex].text
    setError('')
    setStatusTitle(value)
    setStatusName(status)
    setJustification('')
    setJustifyName('')
    setSelectedTag('')
    setActionStatement('')
    setResponse('')
    setResponseTitle('')
    setDetails('')
    setNotes('')
    setImpactData('')
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

  const handleSave = () => {
    compVexCreate({
      variables: {
        sbomId: sbomId,
        compVulnId: id,
        vexStatusId: statusTitle,
        propagateVex: upstream,
        details: details !== '' ? details : undefined,
        note: notes !== '' ? notes : undefined,
        vexJustificationId: justification !== '' ? justification : undefined,
        cdxResponseId: response !== '' ? response : undefined,
        impact: impactData === '' ? undefined : impactData,
        action: actionStatement !== '' ? actionStatement : undefined,
        fixedIn: selectedTag !== '' ? selectedTag : undefined
      }
    }).then((res) => {
      const errors = res?.data?.componentVexUpdate?.errors
      if(errors?.length > 0) {
        setError(errors[0])
      } else  {
        prodVulnDispatch({ type: 'FETCH_DATA_SUCCESS' })
      }
    })
    setStatusTitle('')
    setStatusName('')
    setJustification('')
    setJustifyName('')
    setSelectedTag('')
    setActionStatement('')
    setResponse('')
    setResponseTitle('')
    setDetails('')
    setNotes('')
    setImpactData('')
  }

  const handleSelect = (item) => {
    setStatusTitle(vexStatus?.id || '')
    setStatusName(vexStatus?.name || '')
    setJustification(vexJustification?.id || '')
    setJustifyName(item?.justification || '')
    setActionStatement(item?.actionStmt || '')
    setResponse(cdxResponse?.id || '')
    setResponseTitle(capitalizeFirstLetter(item?.response) || '')
    setSelectedTag(item?.fixedIn || '')
    setDetails(item?.detail || '')
    setNotes(item?.note || '')
    setImpactData(item?.impact || '')
  }

  useEffect(() => {
    if (statusName === 'Not Affected' || statusName === 'False Positive') {
      setUpstream(true)
    } else {
      setUpstream(false)
    }
  }, [statusName])

  useEffect(() => {
    if (componentVulnLogs?.length > 0) {
      const currentOne = componentVulnLogs[componentVulnLogs?.length - 1]
      handleSelect(currentOne)
      const sortedData = componentVulnLogs && [...componentVulnLogs].sort((a, b) => {
        const dateA = new Date(a.updatedAt).getTime()
        const dateB = new Date(b.updatedAt).getTime()
        return dateB - dateA
      })
      setStatusResults(sortedData)
    }
  }, [componentVulnLogs])

  return (
    <>
    <Stack spacing='24px'>
      <Box>
        <SimpleGrid row={5} spacing={4}>
          {!signedUrlParams && (
            <>
              {error !== '' && (
                <Alert status='error' borderRadius={4}>
                  <AlertIcon />
                  <AlertDescription fontSize={'sm'} pr={2}>{error}</AlertDescription>
                </Alert>
              )}
              {/* STATUS */}
              <Card position='relative' p={6} border={`1px solid lightgray`}>
                {statusTitle !== '' && <IconButton size='xs' position={'absolute'} left={'-4%'} top={'49%'} colorScheme='green' rounded={'full'} icon={<CheckIcon />} zIndex={9999} />}
                <FormControl isRequired>
                  <InfoLabel title={'Status'} name={'vexType'} onClick={onCheckStatus} />
                  <Select id='vexType' name='vexType' fontSize='sm' value={statusTitle} onChange={handleStatusChange}>
                    <option value=''>-- Select Status --</option>
                    {allVexStatus ? (
                      allVexStatus.vexStatuses.map((st, idx) => (
                        <option key={idx} value={st.id}>{st.name}</option>
                      ))
                    ) : (
                      <option value={''}>No data found</option>
                    )}
                  </Select>
                </FormControl>
              </Card>
              {/* JUSTIFICATION */}
              {(statusName === 'Not Affected' || statusName === 'False Positive') && (
              <Card position='relative' p={6} border={`1px solid lightgray`}>
                {statusTitle !== '' && <IconButton size='xs' position={'absolute'} left={'-4%'} top={'49%'} colorScheme={justification !== '' && impactData !== '' ? 'green' : 'red'} rounded={'full'} icon={<CheckIcon />} zIndex={9999} />}
                <FormControl isRequired={statusName === 'Not Affected' || statusName === 'False Positive'}>
                  <InfoLabel title={'Justification'} name={justification} onClick={onCheckJustify} />
                  <Select id='justification' name='justification' value={justification} onChange={handleJustifyChange} fontSize='sm' color='gray.600'>
                    <option value=''>-- Select --</option>
                    {allVexJustify ? (
                      allVexJustify.vexJustifications.map((justify, idx) => (
                        <option key={idx} value={justify.id}>{justify.name}</option>
                      ))
                    ) : (
                      <option value={''}>No data found</option>
                    )}
                  </Select>
                </FormControl>
                <Text fontSize={'xs'} mt={5}>AND / OR</Text>
                {/* IMPACT STATEMENT */}
                <FormControl mt={5} isRequired={(statusName === 'Not Affected' && justifyName === 'Other (impact statment required)') || (statusName === 'False Positive' && justifyName === 'Other (impact statment required)')}>
                  <InfoLabel title={'Impact Statement'} name={'impactStatement'} onClick={onCheckImpact} />
                  <Textarea type='text' name='impactStatement' rows={2} id='impactStatement' placeholder='Exmple: The product is not affected by this vulnerability because ....' value={impactData} onChange={(e) => setImpactData(e.target.value)} fontSize='sm' />
                </FormControl>
              </Card>
              )}
              {/* RESPONSE */}
              {statusName === 'Affected' && (
                <Card position='relative' p={6} border={`1px solid lightgray`}>
                  {statusTitle !== '' && <IconButton size='xs' position={'absolute'} left={'-4%'} top={'49%'} colorScheme={actionStatement === '' ? 'red' : 'green'} rounded={'full'} icon={<CheckIcon />} zIndex={9999} />}
                  <FormControl>
                    <InfoLabel title={'Response'} name={'response'} onClick={onCheckResponse} />
                    {res && (
                      <Select id='response' name='response' value={response} onChange={handleResponseChange} fontSize='sm' color='gray.600'>
                        <option value=''>-- Select --</option>
                        {res?.cdxResponses?.length > 0 &&
                          res?.cdxResponses?.map((item, idx) => (
                            <option key={idx} value={item.id}>{item.name}</option>
                          ))}
                      </Select>
                    )}
                  </FormControl>
                  {/* FIXED VERSION */}
                  {responseTitle === 'Update' && (
                    <FormControl mt={5} width={'100%'} isRequired={responseTitle === 'Update'}>
                      <InfoLabel title={'Fixed Version'} name={'fixedVersion'} onClick={onCheckFixedVersion} />
                      <Select id='fixedVersion' name='fixedVersion' value={selectedTag} onChange={(e) => setSelectedTag(e.target.value)} fontSize='sm' color='gray.600'>
                        <option value=''>-- Select --</option>
                        {fixedVersions.length > 0 ? (
                          fixedVersions.map((item, index) => (
                            <option key={index} value={item.label} name={item.label}>{item.label}</option>
                          ))
                        ) : (
                          <option value=''>-- --</option>
                        )}
                      </Select>
                    </FormControl>
                  )}
                  {/* ACTION STATEMENT */}
                  <FormControl mt={5} isRequired={statusName === 'Affected'}>
                    <InfoLabel title={'Action Statement'} name={'actionStatement'} onClick={onCheckAction} />
                    <Textarea rows={2} name='actionStatement' id='actionStatement' placeholder='Example: This vulnerability can be mitigate by running the application with ENV_PROTECTED enabled or turning off Notifications under settings.' fontSize='sm' value={actionStatement} onChange={(e) => setActionStatement(e.target.value)} />
                  </FormControl>
                </Card>
              )}
              {/* INTERNAL NOTES */}
              <Card position='relative' p={6} border={`1px solid lightgray`}>
                {(details !== '' || notes !== '') && <IconButton size='xs' position={'absolute'} left={'-4%'} top={'49%'} colorScheme='green' rounded={'full'} icon={<CheckIcon />} zIndex={9999} />}
                {/* DETAILS */}
                {(statusName === 'In Triage') && (
                  <FormControl>
                    <InfoLabel title={'Details'} name={'details'} onClick={onCheckDetails} />
                    <Textarea rows={2} name='details' id='details' placeholder='Example: The vulnerability surfaced in the reports on March 13th 3pm and has been sent to PSIRT for analysis by 7pm.' fontSize='sm' value={details} onChange={(e) => setDetails(e.target.value)} />
                  </FormControl>
                )}
                <FormControl mt={statusName === 'In Triage' ? 5 : 0}>
                  <InfoLabel title={'Internal Notes'} name={'internalNotes'} onClick={onCheckNotes} />
                  <Textarea rows={2} name='internalNotes' id='internalNotes' placeholder='Example: John Appleseed has scan the codebase and found two instances of function alls encrypt(). Next step: exploitability analysis.' fontSize='sm' value={notes} onChange={(e) => setNotes(e.target.value)} />
                </FormControl>
              </Card>
              {/* UPSTERAM PRODUCT */}
              <FormControl>
                <Checkbox size='sm' isChecked={upstream} onChange={(e) => setUpstream(e.target.checked)} isDisabled={statusTitle === ''}>
                  Also update upstream products
                </Checkbox>
              </FormControl>
            </>
          )}
          {!signedUrlParams && (
            <Button
              width={'fit-content'}
              colorScheme='blue'
              onClick={handleSave}
              isDisabled={statusTitle === '' || (statusName === 'Not Affected' && justification === '') || (statusName === 'Not Affected' && justifyName === 'Other (impact statment required)' && impactData === '') || (statusName === 'False Positive' && justification === '') || (statusName === 'False Positive' &&justifyName === 'Other (impact statment required)' && impactData === '') || (statusName === 'Affected' && actionStatement === '') || (responseTitle !== '' && actionStatement === '') || (responseTitle === 'update' && selectedTag === '') || !editVulns }
            >
              Add
            </Button>
          )}
          {/* STATUS HISTORY */}
          <Flex flexDir={'column'}>
            <Text size='md' my={2}>Status History</Text>
            {(componentVulnLogs?.length > 0 || newVulnLogs?.length > 0) && (
              <Table variant='simple' color={textColor} size='sm' my={2}>
                <Thead>
                  <Tr my='.8rem'>
                    {['Status','Justification','Impact','Notes','By','Created'].map((item, index) => (
                      <Th key={index} color='gray.500' pl={0}><Box>{item}</Box></Th>
                    ))}
                  </Tr>
                </Thead>
                <Tbody>
                  {statusResults.length > 0 &&
                    statusResults.map((item) => (
                      <VulLinkRow key={item.id} id={item.id} username={item.changedBy} justification={item.justification} status={item.status} timestamp={item.updatedAt} note={item.note} impact={item.impact} onSelect={() => handleSelect(item)} />
                    ))}
                </Tbody>
              </Table>
            )}

            {componentVulnLogs?.length === 0 && newVulnLogs?.length === 0 && (
              <Text color={'darkgrey'}>No status history found</Text>
            )}
          </Flex>
        </SimpleGrid>
      </Box>
    </Stack>
     {/* INFO MODAL */}
     {isOpen && <InfoModal isOpen={isOpen} onClose={onClose} heading={infoHeading} body={infoText} url={infoUrl} /> }
    </>
  )
}

export default ProdStatusDrawer
