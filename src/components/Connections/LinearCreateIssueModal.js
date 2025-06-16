import { useMutation, useQuery } from '@apollo/client'
import React, { useEffect, useState } from 'react'
import { generateDescription } from 'utils/ticketUtils'

import {
  FormControl,
  FormLabel,
  Input,
  SimpleGrid,
  Stack
} from '@chakra-ui/react'

import LynkModal from 'components/LynkModal'
import LynkSelect from 'components/LynkSelect'
import { MarkdownPreview } from 'components/MarkdownPreview'

import useCustomToast from 'hooks/useCustomToast'

import { LinearCreateIssue } from 'graphQL/Mutation'
import { LinearTeamData, LinearTeams } from 'graphQL/Queries'

import { LuBolt } from 'react-icons/lu'

const LinearCreateIssueModal = ({ row, isOpen, onClose }) => {
  const { showToast } = useCustomToast()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [team, setTeam] = useState(null)
  const [project, setProject] = useState(null)
  const [assignee, setAssignee] = useState(null)
  const [workflowState, setWorkflowState] = useState(null)

  const [createIssue, { loading: creating }] = useMutation(LinearCreateIssue, {
    refetchQueries: ['GetVulnProductDetails']
  })

  const { data, loading } = useQuery(LinearTeams, { skip: !isOpen })
  const { teams } = data?.linear || {}
  const teamList =
    teams?.length > 0
      ? teams?.map((team) => ({ value: team.id, label: team.name }))
      : []

  const { data: info, loading: infoLoading } = useQuery(LinearTeamData, {
    skip: team?.value ? false : true,
    variables: { teamId: team?.value }
  })
  const { projects, workflowStates, users } = info?.linear || {}
  const projectList =
    projects?.length > 0
      ? projects?.map((item) => ({ value: item.id, label: item.name }))
      : []
  const stateList =
    workflowStates?.length > 0
      ? workflowStates?.map((item) => ({ value: item.id, label: item.name }))
      : []
  const assigneeList =
    users?.length > 0
      ? users?.map((item) => ({ value: item.id, label: item.name }))
      : []

  const handleSave = () => {
    createIssue({
      variables: {
        title,
        description,
        componentVulnId: row?.id,
        teamId: team?.value || undefined,
        projectId: project?.value || undefined,
        assigneeId: assignee?.value || undefined,
        stateId: workflowState?.value || undefined
      }
    }).then((res) => {
      if (res?.data?.linearIssueCreate?.errors?.length === 0) {
        showToast({
          title: 'Linear Issue created.',
          description: 'Linear Issue has been successfully created.',
          status: 'success'
        })
        onClose()
      } else {
        showToast({
          title: 'Linear Issue creation failed.',
          description: 'An error occurred while creating your linear Issue.',
          status: 'error'
        })
      }
    })
  }

  const disabled = title === '' || description === '' || !team

  useEffect(() => {
    if (row) {
      setTitle(`[Vulnerability]: ${row?.vuln?.vulnId}`)
      const description = generateDescription('linear', row)
      setDescription(description)
    }
  }, [row])

  return (
    <LynkModal
      Icon={LuBolt}
      isOpen={isOpen}
      onClose={onClose}
      disabled={disabled}
      isLoading={creating}
      buttonText={'Create'}
      onSubmit={handleSave}
      title={'Create Linear Issue'}
    >
      <Stack spacing={5}>
        <FormControl isRequired>
          <FormLabel>Title</FormLabel>
          <Input
            value={title}
            placeholder='Add title'
            onChange={(e) => setTitle(e.target.value)}
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Team</FormLabel>
          <LynkSelect
            value={team}
            options={teamList}
            isClearable={true}
            isLoading={loading}
            placeholder='Select team'
            onChange={(value) => setTeam(value)}
          />
        </FormControl>

        <SimpleGrid columns={2} gap={4}>
          <FormControl hidden={!team}>
            <FormLabel>Project</FormLabel>
            <LynkSelect
              value={project}
              isClearable={true}
              options={projectList}
              isLoading={infoLoading}
              placeholder='Select project'
              onChange={(value) => setProject(value)}
            />
          </FormControl>

          <FormControl hidden={!team}>
            <FormLabel>Assignee</FormLabel>
            <LynkSelect
              value={assignee}
              isClearable={true}
              options={assigneeList}
              isLoading={infoLoading}
              placeholder='Select assignee'
              onChange={(value) => setAssignee(value)}
            />
          </FormControl>
        </SimpleGrid>

        <FormControl hidden={!team}>
          <FormLabel>Workflow State</FormLabel>
          <LynkSelect
            isClearable={true}
            options={stateList}
            value={workflowState}
            isLoading={infoLoading}
            placeholder='Select workflow state'
            onChange={(value) => setWorkflowState(value)}
          />
        </FormControl>

        <FormControl isReadOnly>
          <FormLabel>Description</FormLabel>
          <MarkdownPreview content={description} />
        </FormControl>
      </Stack>
    </LynkModal>
  )
}

export default LinearCreateIssueModal
