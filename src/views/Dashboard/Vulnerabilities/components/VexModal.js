import React, { useEffect, useState } from 'react'
import {Modal,ModalOverlay,ModalContent,ModalHeader,ModalFooter,ModalBody,ModalCloseButton,Button,SimpleGrid,FormLabel,Select,Stack,Textarea,FormControl,Alert,Checkbox, useToast} from '@chakra-ui/react'
import { getVexStatuses, getVexJustifications, GetCdxResponses, GetProject, GetProjectGroup } from 'graphQL/Queries'
import { useLazyQuery, useMutation, useQuery } from '@apollo/client'
import { useLocation } from 'react-router-dom'
import { useGlobalState } from 'hooks/useGlobalState'
import { filterEnvList } from 'utils'
import { updateBulkCompVex } from 'graphQL/Mutation'

const VexModal = ({ selectedGroup, checkEquals, isOpen, onClose, refetch, selectedVulns, setSelectedVulns, setToggleClear }) => {
  const toast = useToast()
  const { totalRows, prodVulnState } = useGlobalState()
  const { field, direction } = prodVulnState
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const vulnId = queryParams.get('vulnId')
  const productId = queryParams.get('id')
  const sbomId = queryParams.get('sbom')

  const [statusTitle, setStatusTitle] = useState('')
  const [statusName, setStatusName] = useState('')
  const [justification, setJustification] = useState('')
  const [justifyName, setJustifyName] = useState('')
  const [selectEnv, setSelectEnv] = useState('')
  const [selectedTag, setSelectedTag] = useState('')
  const [actionStatement, setActionStatement] = useState('')
  const [response, setResponse] = useState('')
  const [responseTitle, setResponseTitle] = useState('')
  const [details, setDetails] = useState('')
  const [notes, setNotes] = useState('')
  const [impactData, setImpactData] = useState('')
  const [upstream, setUpstream] = useState(false)

  const [getProject, { data }] = useLazyQuery(GetProject)
  const { data: allVexStatus } = useQuery(getVexStatuses)
  const { data: allVexJustify } = useQuery(getVexJustifications)
  const { data: allCdx } = useQuery(GetCdxResponses)

  const [compVexCreate] = useMutation(updateBulkCompVex, {
    fetchPolicy: 'network-only',
    onCompleted: () => {
      if (sbomId) {
        refetch({ projectId: productId, sbomId: sbomId, first: totalRows, last: undefined, field, direction })
      } else {
        refetch({ id: vulnId, first: totalRows, last: undefined })
      }
      setSelectedVulns([])
      setToggleClear(true)
    }
  })

  const handleStatusChange = (e) => {
    const { value } = e.target
    const status = e.target.options[e.target.selectedIndex].text
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

  const handleEnvChange = async (e) => {
    setSelectEnv(e.target.value)
    await getProject({
      variables: { id: e.target.value }
    }).then((res) => console.log(res.data))
  }

  const { data: groups } = useQuery(GetProjectGroup, {
    skip: checkEquals ? false : true,
    variables: { id: selectedGroup }
  })

  const handleSave = () => {
    setToggleClear(false)
    const vulnIds = selectedVulns?.map((item) => item?.id)
    compVexCreate({
      variables: {
        comVulnIds: vulnIds,
        sbomId: sbomId || undefined,
        propagateVex: sbomId ? undefined : upstream,
        vexStatusId: statusTitle,
        detail: details !== '' ? details : undefined,
        note: notes !== '' ? notes : undefined,
        vexJustificationId: justification !== '' ? justification : undefined,
        cdxResponseId: response !== '' ? response : undefined,
        impact: impactData === '' ? undefined : impactData,
        action: actionStatement !== '' ? actionStatement : undefined,
        fixedIn: selectedTag !== '' ? selectedTag : undefined
      }
    }).then((res) => {
      const errors = res?.data?.componentVexBulkUpdate?.errors
      if(errors?.length > 0) {
        toast({description:errors[0], status:'error', duration:2000, position:'top'})
      } else {
        onClose()
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

  useEffect(() => {
    if (statusName === 'Not Affected') {
      setUpstream(true)
    } else {
      setUpstream(false)
    }
  }, [statusName])

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Update Status</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <SimpleGrid row={5} spacing={4}>
            {/* STATUS */}
            <FormControl>
              <FormLabel htmlFor='vexType' fontSize='sm' color={'gray.600'}>Status</FormLabel>
              <Select id='vexType' name='vexType' fontSize='sm' value={statusTitle} onChange={handleStatusChange}>
                <option value=''>-- Select Status --</option>
                {allVexStatus ? (allVexStatus.vexStatuses.map((st, idx) => (
                  <option key={idx} value={st.id}>{st.name}</option>
                )) ) : (
                  <option value={''}>No data found</option>
                )}
              </Select>
            </FormControl>
            {/* JUSTIFICATION */}
            {statusName === 'Not Affected' && (
              <FormControl>
                <FormLabel htmlFor='justification' fontSize='sm' color='gray.600'>Justification</FormLabel>
                <Select id='justification' name='justification' value={justification} onChange={handleJustifyChange} fontSize='sm' color='gray.600'>
                  <option value=''>-- Select --</option>
                  {allVexJustify ? (allVexJustify.vexJustifications.map((justify, idx) => (
                    <option key={idx} value={justify.id}>{justify.name}</option>
                  ))) : (
                    <option value={''}>No data found</option>
                  )}
                </Select>
              </FormControl>
            )}
            {/* RESPONSE */}
            {statusName === 'Affected' && (
              <FormControl>
                <FormLabel htmlFor='response' fontSize='sm' color='gray.600'>Response</FormLabel>
                {allCdx && (
                  <Select id='response' name='response' value={response} onChange={handleResponseChange} fontSize='sm' color='gray.600'>
                    <option value=''>-- Select --</option>
                    {allCdx?.cdxResponses.length > 0 && allCdx?.cdxResponses.map((item, idx) => (
                      <option key={idx} value={item.id}>{item.name}</option>
                    ))}
                  </Select>
                )}
              </FormControl>
            )}
            {/* FIXED VERSION */}
            {statusName === 'Affected' && responseTitle === 'Update' && groups && (
                <Stack width={'100%'} direction={'column'} spacing={4} alignItems={'flex-start'}>
                  <FormControl width={'100%'}>
                    <FormLabel htmlFor='fixedVersion' fontSize='sm' color='gray.600'>Project Environment</FormLabel>
                    <Select id='env' name='env' value={selectEnv} onChange={handleEnvChange} textTransform={'capitalize'} fontSize='sm' color='gray.600'>
                      <option value=''>-- Select --</option>
                      {groups?.projectGroup?.projects.length > 0 ? (
                        filterEnvList(groups?.projectGroup?.projects).map(
                          (item, index) => (
                            <option key={index} value={item.id} name={item.name}>{item.name}</option>
                          )
                        )
                      ) : (
                        <option value=''>-- --</option>
                      )}
                    </Select>
                  </FormControl>
                  <FormControl width={'100%'}>
                    <FormLabel htmlFor='fixedVersion' fontSize='sm' color='gray.600'>Fixed Version</FormLabel>
                    <Select id='fixedVersion' name='fixedVersion' value={selectedTag} onChange={(e) => setSelectedTag(e.target.value)} textTransform={'capitalize'} fontSize='sm' color='gray.600'>
                      <option value=''>-- Select --</option>
                      {data?.project?.sboms?.length > 0 ? (
                        data?.project?.sboms
                          ?.filter((item) => item?.id !== sbomId)
                          ?.map((item, index) => (
                            <option key={index} value={item?.projectVersion} name={item?.projectVersion}>
                              {item?.projectVersion}
                            </option>
                          ))
                      ) : (
                        <option value=''>-- --</option>
                      )}
                    </Select>
                  </FormControl>
                </Stack>
              )}
            {statusName === 'Affected' &&
              responseTitle === 'Update' &&
              !groups && (
                <Alert status='error' borderRadius={4} size={'sm'} fontSize={'sm'}>
                  Product versions are different. Please select same version.
                </Alert>
              )}
            {/* IMPACT STATEMENT */}
            {statusName === 'Not Affected' && (
              <FormControl>
                <FormLabel htmlFor='impactStatement' fontSize='sm' color='gray.600'>
                  Impact Statement
                </FormLabel>
                <Textarea type='text' name='impactStatement' rows={2} id='impactStatement' placeholder='Add impact statement' value={impactData} onChange={(e) => setImpactData(e.target.value)} fontSize='sm'/>
              </FormControl>
            )}
            {/* ACTION STATEMENT */}
            {statusName === 'Affected' && (
              <FormControl>
                <FormLabel htmlFor='actionStatement' fontSize='sm' color={'gray.600'} >
                  Action Statement
                </FormLabel>
                <Textarea rows={2} name='actionStatement' id='actionStatement' placeholder='Add statement' fontSize='sm' value={actionStatement} onChange={(e) => setActionStatement(e.target.value)} />
              </FormControl>
            )}
            {/* DETAILS */}
            {(statusName === 'In Triage') && (
              <FormControl>
                <FormLabel htmlFor='details' fontSize='sm' color={'gray.600'}>Details</FormLabel>
                <Textarea rows={2} name='details' id='details' placeholder='Add details' fontSize='sm' value={details} onChange={(e) => setDetails(e.target.value)}/>
              </FormControl>
            )}
            {/* INTERNAL NOTES */}
            <FormControl>
              <FormLabel htmlFor='internalNotes' fontSize='sm' color={'gray.600'} >
                Internal Notes
              </FormLabel>
              <Textarea rows={2} name='internalNotes' id='internalNotes' placeholder='Add notes' fontSize='sm' value={notes} onChange={(e) => setNotes(e.target.value)} />
            </FormControl>
            {/* UPSTERAM PRODUCT */}
            <FormControl>
              <Checkbox size='sm' isChecked={upstream} onChange={(e) => setUpstream(e.target.checked)} >
                Also update upstream products
              </Checkbox>
            </FormControl>
          </SimpleGrid>
        </ModalBody>

        <ModalFooter>
          <Button mr={3} onClick={onClose}>Cancel</Button>
          <Button variant='solid' colorScheme='blue' onClick={handleSave} disabled={ statusTitle === '' || (statusName === 'Not Affected' && justification === '') || (statusName === 'Not Affected' && justifyName === 'Other (impact statment required)' && impactData === '') || (statusName === 'Affected' && responseTitle === '' && actionStatement === '') || (responseTitle !== '' && actionStatement === '') ||(responseTitle === 'update' && selectedTag === '')}>
            Save
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default VexModal
