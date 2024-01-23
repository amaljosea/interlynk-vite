import React, { useState } from 'react'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  SimpleGrid,
  FormLabel,
  Select,
  Stack,
  Textarea,
  FormControl
} from '@chakra-ui/react'
import {
  getVexStatuses,
  getVexJustifications,
  GetCdxResponses
} from 'graphQL/Queries'
import { updateCompVulnVex } from 'graphQL/Mutation'
import { useMutation, useQuery } from '@apollo/client'
import { useLocation } from 'react-router-dom'
import { GetProject } from 'graphQL/Queries'
import { removeDuplicates, getFullDateAndTime, normalizeSBOMVersion } from 'utils'
import { useGlobalState } from 'hooks/useGlobalState'

const VexModal = ({
  isOpen,
  onClose,
  refetch,
  selectedVulns,
  setSelectedVulns,
  setPageIndex,
  setToggleClear
}) => {
  const { totalRows } = useGlobalState()

  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const vulnId = queryParams.get('vulnId')

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

  const { data } = useQuery(GetProject, { variables: { id: vulnId } })
  const { data: allVexStatus } = useQuery(getVexStatuses)
  const { data: allVexJustify } = useQuery(getVexJustifications)
  const { data: allCdx } = useQuery(GetCdxResponses)

  const [compVexCreate] = useMutation(updateCompVulnVex, {
    fetchPolicy: 'network-only',
    onCompleted: () => setSelectedVulns([])
  })

  const handleStatusChange = (e) => {
    const { value } = e.target
    const status = e.target.options[e.target.selectedIndex].text
    setStatusTitle(value)
    setStatusName(status)
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

  const uniqVersions = []

  const filteredDuplicated =
    data?.project?.sboms?.length > 0
      ? removeDuplicates(data?.project?.sboms)
      : []

  filteredDuplicated &&
    filteredDuplicated.map((project) => {
      uniqVersions.push({
        label: normalizeSBOMVersion(project),
      })
    })

  const fixedVersions = uniqVersions.filter((item) => item.value !== sbomId)

  const handleSave = () => {
    setToggleClear(false)
    if (selectedVulns?.length > 0) {
      selectedVulns?.map((item) => {
        compVexCreate({
          variables: {
            compVulnId: item?.id,
            vexStatusId: statusTitle,
            details: details !== '' ? details : undefined,
            note: notes !== '' ? notes : undefined,
            vexJustificationId:
              justification !== '' ? justification : undefined,
            cdxResponseId: response !== '' ? response : undefined,
            impact: impactData === '' ? undefined : impactData,
            action: actionStatement !== '' ? actionStatement : undefined,
            fixedIn: selectedTag !== '' ? selectedTag : undefined
          }
        })
          .then((res) => {
            if (res.data) {
              refetch({ variables: { id: vulnId, first: totalRows } })
              setPageIndex(1)
              setToggleClear(true)
            }
          })
          .finally(() => onClose())
      })
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Modal Title</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <SimpleGrid row={5} spacing={4}>
            {/* STATUS */}
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
                {allCdx && (
                  <Select
                    id='response'
                    name='response'
                    value={response}
                    onChange={handleResponseChange}
                    fontSize='sm'
                    color='gray.600'
                  >
                    <option value=''>-- Select --</option>
                    {allCdx?.cdxResponses.length > 0 &&
                      allCdx?.cdxResponses.map((item, idx) => (
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
          </SimpleGrid>
        </ModalBody>

        <ModalFooter>
          <Button mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant='solid'
            colorScheme='blue'
            onClick={handleSave}
            disabled={
              statusTitle === '' ||
              (statusName === 'Not Affected' && justification === '') ||
              (statusName === 'Not Affected' &&
                justifyName === 'Other (impact statment required)' &&
                impactData === '') ||
              (statusName === 'False Positive' && justification === '') ||
              (statusName === 'False Positive' &&
                justifyName === 'Other (impact statment required)' &&
                impactData === '') ||
              (statusName === 'Affected' &&
                responseTitle === '' &&
                actionStatement === '') ||
              (responseTitle !== '' && actionStatement === '') ||
              (responseTitle === 'update' && selectedTag === '')
            }
          >
            Save
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default VexModal
