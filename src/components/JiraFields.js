import { gql, useMutation, useQuery } from '@apollo/client'
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getSettingsLabel } from 'utils'

import { FormControl, FormLabel, Stack } from '@chakra-ui/react'

import useCustomToast from 'hooks/useCustomToast'
import { useGlobalQueryContext } from 'hooks/useGlobalQueryContext'
import { useHasPermission } from 'hooks/useHasPermission'
import useQueryParam from 'hooks/useQueryParam'

import { ProjectSettingUpdate } from 'graphQL/Mutation'
import { GetJiraProjects, JiraInformation } from 'graphQL/Queries'

import LynkSelect from './LynkSelect'

const GetProjectSettings = gql`
  query GetProjectSettings($id: Uuid!) {
    project(id: $id) {
      projectSetting {
        id
        jiraProject
        jiraIssueType
        jiraAssignee
        jiraReporter
      }
    }
  }
`

const JiraFields = () => {
  const params = useParams()
  const productId = params.productid
  const activeTab = useQueryParam('tab')
  const { showToast } = useCustomToast()
  const { isFreeTier } = useGlobalQueryContext()

  const [projects, setProjects] = useState([])
  const [project, setProject] = useState(null)

  const [issueTypes, setIssueTypes] = useState([])
  const [issueType, setIssueType] = useState(null)

  const [assignees, setAssignees] = useState([])
  const [assignee, setAssignee] = useState(null)

  const [reporters, setReporters] = useState([])
  const [reporter, setReporter] = useState(null)

  const editControls = useHasPermission({
    parentKey: 'view_product_group',
    childKey: 'update_product_settings'
  })

  const [updateSettings] = useMutation(ProjectSettingUpdate)

  const { data: projectOptions } = useQuery(GetJiraProjects, {
    skip: activeTab === 'settings' ? false : true
  })

  const { data: options } = useQuery(JiraInformation, {
    skip: project?.value ? false : true,
    variables: { pKey: project?.value || undefined }
  })

  const { data: settings } = useQuery(GetProjectSettings, {
    variables: { id: productId }
  })

  const { projectSetting } = settings?.project || {}
  const { id } = projectSetting || {}

  const onUpdate = async (item, field) => {
    const { value } = item || {}
    await updateSettings({
      variables: {
        id,
        jiraProject: field === 'jiraProject' && value ? value : undefined,
        jiraIssueType: field === 'jiraIssueType' && value ? value : undefined,
        jiraAssignee: field === 'jiraAssignee' && value ? value : undefined,
        jiraReporter: field === 'jiraReporter' && value ? value : undefined
      }
    })
      .then((res) => res.data)
      .finally(() => {
        showToast({
          description: `${getSettingsLabel(field)} updated successfully`,
          status: 'success'
        })
      })
  }

  useEffect(() => {
    if (projectOptions) {
      setProjects(
        projectOptions.jira?.projects?.map((project) => ({
          value: project.key,
          label: project.name
        }))
      )
    }
  }, [projectOptions])

  useEffect(() => {
    if (options?.jira) {
      const { issueTypes, users } = options.jira || {}
      console.warn('JIRA INFORMATION', options.jira)
      setIssueTypes(
        issueTypes?.map((issueType) => ({
          value: issueType.id,
          label: issueType.name
        }))
      )
      setAssignees(
        users?.map((assignee) => ({
          value: assignee.accountId,
          label: assignee.name
        }))
      )
      setReporters(
        users?.map((reporter) => ({
          value: reporter.accountId,
          label: reporter.name
        }))
      )
    }
  }, [options])

  useEffect(() => {
    if (projectSetting && options) {
      const { jira } = options || {}
      const { jiraProject, jiraIssueType, jiraAssignee, jiraReporter } =
        projectSetting || {}
      console.warn('JIRA SETTINGS', projectSetting)
      const project = jira?.projects?.find((item) => item?.key === jiraProject)
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
    }
  }, [options, projectSetting])

  return (
    <Stack spacing={4}>
      <FormControl hidden={isFreeTier}>
        <FormLabel>Jira Project</FormLabel>
        <LynkSelect
          options={projects}
          isClearable={true}
          placeholder='Project'
          isDisabled={!editControls}
          onChange={(value) => onUpdate(value, 'jiraProject')}
          value={project}
        />
      </FormControl>

      <FormControl isRequired>
        <FormLabel>Issue Type</FormLabel>
        <LynkSelect
          dropDown
          value={issueType}
          isClearable={true}
          isDisabled={!editControls}
          placeholder='Select Issue Type'
          options={issueTypes}
          onChange={(value) => onUpdate(value, 'jiraIssueType')}
        />
      </FormControl>

      <FormControl isRequired hidden={!issueType}>
        <FormLabel>Assignee</FormLabel>
        <LynkSelect
          dropDown
          value={assignee}
          isClearable={true}
          isDisabled={!editControls}
          placeholder='Select Assignee'
          options={assignees}
          onChange={(value) => onUpdate(value, 'jiraAssignee')}
        />
      </FormControl>

      <FormControl isRequired hidden={!issueType}>
        <FormLabel>Reporter</FormLabel>
        <LynkSelect
          dropDown
          value={reporter}
          isClearable={true}
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
