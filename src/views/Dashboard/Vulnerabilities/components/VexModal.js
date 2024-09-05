import { useLazyQuery, useMutation, useQuery } from '@apollo/client'
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { filterEnvList } from 'utils'

import {
  Alert,
  Checkbox,
  FormControl,
  FormLabel,
  Select,
  SimpleGrid,
  Stack,
  Textarea
} from '@chakra-ui/react'

import LynkModal from 'components/LynkModal'

import useCustomToast from 'hooks/useCustomToast'

import { updateBulkCompVex } from 'graphQL/Mutation'
import {
  GetCdxResponses,
  GetProject,
  GetProjectGroup,
  getVexJustifications,
  getVexStatuses
} from 'graphQL/Queries'

import { FaPenToSquare } from 'react-icons/fa6'

const VexModal = ({
  selectedGroup,
  checkEquals,
  isOpen,
  onClose,
  selectedVulns,
  setSelectedVulns,
  setToggleClear
}) => {
  const { showToast } = useCustomToast()
  const params = useParams()
  const sbomId = params.sbomid

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
  const [disabled, setDisabled] = useState(false)

  const disableButtonTemporarily = () => {
    setDisabled(true)
    setTimeout(() => {
      setDisabled(false)
    }, 3000)
  }

  const [getProject, { data }] = useLazyQuery(GetProject)
  const { data: allVexStatus } = useQuery(getVexStatuses)
  const { data: allVexJustify } = useQuery(getVexJustifications)
  const { data: allCdx } = useQuery(GetCdxResponses)

  const [compVexCreate] = useMutation(updateBulkCompVex, {
    onCompleted: (data) => {
      if (data) {
        setSelectedVulns([])
        setToggleClear(true)
      }
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
    disableButtonTemporarily()
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
      if (errors?.length > 0) {
        showToast({
          description: errors[0],
          status: 'error'
        })
      } else {
        onClose()
      }
    })
  }

  const isInvalid =
    disabled ||
    statusTitle === '' ||
    (statusName === 'Not Affected' && justification === '') ||
    (statusName === 'Not Affected' &&
      justifyName === 'Other (impact statment required)' &&
      impactData === '') ||
    (statusName === 'Affected' &&
      responseTitle === '' &&
      actionStatement === '') ||
    (responseTitle !== '' && actionStatement === '') ||
    (responseTitle === 'update' && selectedTag === '')

  const handleClose = () => {
    setSelectedVulns([])
    onClose()
  }

  useEffect(() => {
    if (statusName === 'Not Affected') {
      setUpstream(true)
    } else {
      setUpstream(false)
    }
  }, [statusName])

  return (
    <LynkModal
      isOpen={isOpen}
      onSubmit={handleSave}
      onClose={handleClose}
      title={'Update Status'}
      Icon={FaPenToSquare}
      disabled={isInvalid}
      buttonText={'Save'}
    >
      <SimpleGrid row={5} spacing={4}>
        {/* STATUS */}
        <FormControl>
          <FormLabel htmlFor='vexType' fontSize='sm'>
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
        {statusName === 'Not Affected' && (
          <FormControl>
            <FormLabel htmlFor='justification' fontSize='sm'>
              Justification
            </FormLabel>
            <Select
              fontSize='sm'
              id='justification'
              name='justification'
              value={justification}
              onChange={handleJustifyChange}
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
            <FormLabel htmlFor='response' fontSize='sm'>
              Response
            </FormLabel>
            {allCdx && (
              <Select
                fontSize='sm'
                id='response'
                name='response'
                value={response}
                onChange={handleResponseChange}
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
        {statusName === 'Affected' && responseTitle === 'Update' && groups && (
          <Stack
            spacing={4}
            width={'100%'}
            direction={'column'}
            alignItems={'flex-start'}
          >
            <FormControl width={'100%'}>
              <FormLabel htmlFor='fixedVersion' fontSize='sm'>
                Project Environment
              </FormLabel>
              <Select
                id='env'
                name='env'
                fontSize='sm'
                value={selectEnv}
                onChange={handleEnvChange}
                textTransform={'capitalize'}
              >
                <option value=''>-- Select --</option>
                {groups?.projectGroup?.projects.length > 0 ? (
                  filterEnvList(groups?.projectGroup?.projects).map(
                    (item, index) => (
                      <option key={index} value={item.id} name={item.name}>
                        {item.name}
                      </option>
                    )
                  )
                ) : (
                  <option value=''>-- --</option>
                )}
              </Select>
            </FormControl>
            <FormControl width={'100%'}>
              <FormLabel htmlFor='fixedVersion' fontSize='sm'>
                Fixed Version
              </FormLabel>
              <Select
                fontSize='sm'
                id='fixedVersion'
                name='fixedVersion'
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                textTransform={'capitalize'}
              >
                <option value=''>-- Select --</option>
                {data?.project?.sboms?.length > 0 ? (
                  data?.project?.sboms
                    ?.filter((item) => item?.id !== sbomId)
                    ?.map((item, index) => (
                      <option
                        key={index}
                        value={item?.projectVersion}
                        name={item?.projectVersion}
                      >
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
        {statusName === 'Affected' && responseTitle === 'Update' && !groups && (
          <Alert status='error' borderRadius={4} size={'sm'} fontSize={'sm'}>
            Product versions are different. Please select same version.
          </Alert>
        )}
        {/* IMPACT STATEMENT */}
        {statusName === 'Not Affected' && (
          <FormControl>
            <FormLabel htmlFor='impactStatement' fontSize='sm'>
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
            <FormLabel htmlFor='actionStatement' fontSize='sm'>
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
        {statusName === 'In Triage' && (
          <FormControl>
            <FormLabel htmlFor='details' fontSize='sm'>
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
          <FormLabel htmlFor='internalNotes' fontSize='sm'>
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
        {/* UPSTERAM PRODUCT */}
        <FormControl>
          <Checkbox
            size='sm'
            isChecked={upstream}
            isDisabled={statusTitle === ''}
            onChange={(e) => setUpstream(e.target.checked)}
          >
            Also update upstream products
          </Checkbox>
        </FormControl>
      </SimpleGrid>
    </LynkModal>
  )
}

export default VexModal
