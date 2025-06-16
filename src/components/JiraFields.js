import { useMutation, useQuery } from '@apollo/client'
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getSettingsLabel } from 'utils'

import { FormControl, FormLabel, Stack, Text } from '@chakra-ui/react'

import useCustomToast from 'hooks/useCustomToast'
import { useGlobalQueryContext } from 'hooks/useGlobalQueryContext'
import { useHasPermission } from 'hooks/useHasPermission'
import { useJiraConnection } from 'hooks/useJiraConnection'
import useQueryParam from 'hooks/useQueryParam'

import { ProjectSettingUpdate } from 'graphQL/Mutation'
import {
  GetJiraProjects,
  GetJiraSettings,
  JiraInformation
} from 'graphQL/Queries'

import LynkSelect from './LynkSelect'

const JiraFields = () => {
  const params = useParams()
  const productId = params.productid
  const activeTab = useQueryParam('tab')
  const { showToast } = useCustomToast()
  const { isFreeTier } = useGlobalQueryContext()

  const [project, setProject] = useState(null)

  const [issueType, setIssueType] = useState(null)

  const [assignee, setAssignee] = useState(null)

  const [reporter, setReporter] = useState(null)

  const editControls = useHasPermission({
    parentKey: 'view_product_group',
    childKey: 'edit_product_settings'
  })

  const [updateSettings] = useMutation(ProjectSettingUpdate)

  const { connection } = useJiraConnection()

  const { data: projectOptions, loading: projectLoading } = useQuery(
    GetJiraProjects,
    {
      skip: activeTab === 'settings' ? false : true
    }
  )
  const { projects: jiraProjects } = projectOptions?.jira || {}
  const projects =
    jiraProjects?.length > 0
      ? jiraProjects?.map((project) => ({
          value: project.key,
          label: project.name
        }))
      : []

  const { data: options, loading } = useQuery(JiraInformation, {
    skip: project?.value ? false : true,
    variables: { pKey: project?.value || undefined }
  })
  const { issueTypes: jiraIssueTypes, users } = options?.jira || {}
  const issueTypes =
    jiraIssueTypes?.length > 0
      ? jiraIssueTypes?.map((issueType) => ({
          value: issueType.id,
          label: issueType.name
        }))
      : []
  const assignees =
    users?.length > 0
      ? users?.map((assignee) => ({
          value: assignee.accountId,
          label: assignee.name
        }))
      : []
  const reporters =
    users?.length > 0
      ? users?.map((assignee) => ({
          value: assignee.accountId,
          label: assignee.name
        }))
      : []

  const { data: settings } = useQuery(GetJiraSettings, {
    skip: activeTab === 'settings' ? false : true,
    variables: { id: productId }
  })

  const { projectSetting } = settings?.project || {}

  const { id } = projectSetting || {}

  const onUpdate = async (item, field) => {
    const { value } = item || {}
    await updateSettings({ variables: { id, [field]: value ? value : '' } })
      .then((res) => res.data)
      .finally(() => {
        showToast({
          description: `${getSettingsLabel(field)} updated successfully`,
          status: 'success'
        })
      })
  }

  useEffect(() => {
    const { jira } = options || {}
    const { jiraProject, jiraIssueType, jiraAssignee, jiraReporter } =
      projectSetting || {}
    const project = projectOptions?.jira?.projects?.find(
      (item) => item?.key === jiraProject
    )
    const issueType = jira?.issueTypes?.find(
      (item) => item?.id === jiraIssueType
    )
    const assignee = jira?.users?.find(
      (item) => item?.accountId === jiraAssignee
    )
    const reporter = jira?.users?.find(
      (item) => item?.accountId === jiraReporter
    )
    setProject(project ? { value: project?.key, label: project.name } : null)
    setIssueType(
      issueType ? { value: issueType?.id, label: issueType?.name } : null
    )
    setAssignee(
      assignee ? { value: assignee?.accountId, label: assignee?.name } : null
    )
    setReporter(
      reporter ? { value: reporter?.accountId, label: reporter?.name } : null
    )
  }, [options, projectOptions?.jira?.projects, projectSetting])

  if (!connection) return null

  return (
    <Stack spacing={4}>
      <Text fontSize={14} fontWeight={'semibold'}>
        JIRA Defaults
      </Text>

      <FormControl hidden={isFreeTier}>
        <FormLabel>Project</FormLabel>
        <LynkSelect
          options={projects}
          isClearable={true}
          name='jiraProject'
          aria-label='jiraProject'
          placeholder='Select Project'
          isLoading={projectLoading}
          isDisabled={!editControls}
          onChange={(value) => onUpdate(value, 'jiraProject')}
          value={project}
        />
      </FormControl>

      <FormControl>
        <FormLabel>Issue Type</FormLabel>
        <LynkSelect
          value={issueType}
          isClearable={true}
          isLoading={loading}
          isDisabled={!editControls}
          placeholder='Select Issue Type'
          options={issueTypes}
          onChange={(value) => onUpdate(value, 'jiraIssueType')}
        />
      </FormControl>

      <FormControl hidden={!issueType}>
        <FormLabel>Assignee</FormLabel>
        <LynkSelect
          value={assignee}
          isClearable={true}
          isLoading={loading}
          isDisabled={!editControls}
          placeholder='Select Assignee'
          options={assignees}
          onChange={(value) => onUpdate(value, 'jiraAssignee')}
        />
      </FormControl>

      <FormControl hidden={!issueType}>
        <FormLabel>Reporter</FormLabel>
        <LynkSelect
          value={reporter}
          isClearable={true}
          isLoading={loading}
          isDisabled={!editControls}
          placeholder='Select Reporter'
          options={reporters}
          onChange={(value) => onUpdate(value, 'jiraReporter')}
        />
      </FormControl>
    </Stack>
  )
}

export default JiraFields
