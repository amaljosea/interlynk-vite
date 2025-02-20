import { useLazyQuery, useMutation, useQuery } from '@apollo/client'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import { FormControl, FormLabel, Grid, Input, Textarea } from '@chakra-ui/react'

import LynkModal from 'components/LynkModal'
import LynkSelect from 'components/LynkSelect'

import useCustomToast from 'hooks/useCustomToast'

import { CreateJiraIssue } from 'graphQL/Mutation'
import { GetJiraOptions, GetJiraProjects } from 'graphQL/Queries'
import { GetDefaultJiraProduct } from 'graphQL/Queries'

import { FaJira } from 'react-icons/fa6'

const JiraCreateIssueModal = ({ isOpen, onClose, row }) => {
  const params = useParams()

  const { data: projectOptions } = useQuery(GetJiraProjects, {
    skip: isOpen ? false : true,
    fetchPolicy: 'network-only'
  })

  const { data: settings } = useQuery(GetDefaultJiraProduct, {
    skip: isOpen ? false : true,
    variables: { id: params.productid }
  })

  const { jiraProject } = settings?.project?.projectSetting || ''

  const [getOptions, { data: options }] = useLazyQuery(GetJiraOptions, {
    fetchPolicy: 'network-only'
  })

  const [createJiraIssue, { loading }] = useMutation(CreateJiraIssue)

  const { showToast } = useCustomToast()

  const [summary, setSummary] = useState('')

  const [projects, setProjects] = useState([])
  const [project, setProject] = useState('')

  const [issueTypes, setIssueTypes] = useState([])
  const [issueType, setIssueType] = useState('')

  const [assignees, setAssignees] = useState([])
  const [assignee, setAssignee] = useState('')

  const [reporters, setReporters] = useState([])
  const [reporter, setReporter] = useState('')

  const label = []

  const priority = [
    { value: 'Medium', label: 'Medium' },
    { value: 'High', label: 'High' },
    { value: 'Low', label: 'Low' }
  ]

  const [description, setDescription] = useState('')
  const [isCreateDisabled, setIsCreateDisabled] = useState(true)

  const formatCustomVulnFields = (customFields) => {
    if (customFields.length === 0) return ''

    return customFields
      .map(
        (field) =>
          `${field.componentVulnCustomFieldDefinition.displayName}: ${field.value}`
      )
      .join('\n\n')
  }

  useEffect(() => {
    const vulnId = row.vuln?.vulnId || 'N/A'
    const desc = row.vuln?.desc || 'N/A'
    const nvdAliasId = row.vuln?.nvdAliasId || 'N/A'
    const component = row.component?.name || 'N/A'
    const sev = row.vuln?.sev || 'N/A'
    const cvssVector = row.vuln?.cvssVector || 'N/A'
    const cvssScore = row.vuln?.cvssScore || 'N/A'
    const epssPercentile = row.vuln?.vulnInfo?.epssPercentile || 'N/A'
    const epssScore = row.vuln?.vulnInfo?.epssScore || 'N/A'
    const kev = row.vuln?.vulnInfo?.kev === true ? 'True' : 'False' || 'N/A'
    const vexStatus = row.vexStatus?.name || 'N/A'
    const actionStmt = row.actionStmt || 'N/A'
    const impact = row.impact || 'N/A'
    const justification = row.vexJustification?.name || 'N/A'
    const note = row?.note || 'N/A'
    const customFields = formatCustomVulnFields(row?.componentVulnCustomFields)

    setDescription(
      `Subject: [${vulnId}]: ${desc}\n
Body:\n
Summary: ${desc || 'N/A'}\n
Issue Type:\n
Vulnerability:\n
Affected Product: ${row.component.sbom.project.projectGroup.name}\n
Affected Version (Environment): ${row.component.sbom.project.projectGroup.name} (${row.component.sbom.project.name})\n
Affected Components: ${component}: ${row.component.version}\nPURL: ${row.component.purl}\n
Description: ${desc}\n
Additional Details:\n
NVD ID: ${nvdAliasId}\n
Severity: ${sev}\n
CVSS Score: ${cvssScore}\n
CVSS Vector: ${cvssVector}\n
EPSS Percentile: ${epssPercentile}\n
EPSS Score: ${epssScore}\n
Vulnerability Status: ${vexStatus}\n
KEV: ${kev}\n
Vulnerability Action Statement: ${actionStmt}\n
Vulnerability Impact: ${impact}\n
Vulnerability Justification: ${justification}\n
Vulnerability Notes: ${note}\n
${customFields}
      `
    )
    setSummary(`[Vulnerability]: ${vulnId}`)

    setProject({
      value: jiraProject,
      label: jiraProject
    })

    if (jiraProject) {
      getOptions({ variables: { pKey: jiraProject } })
    }
  }, [jiraProject, getOptions, row])

  useEffect(() => {
    if (summary && project && issueType && reporter && assignee) {
      setIsCreateDisabled(false)
    } else {
      setIsCreateDisabled(true)
    }
  }, [summary, project, issueType, reporter, assignee])

  useEffect(() => {
    if (options) {
      setIssueTypes(
        options.jira?.issueTypes?.map((issueType) => ({
          value: issueType.id,
          label: issueType.name
        }))
      )
      setAssignees(
        options.jira?.users?.map((assignee) => ({
          value: assignee.accountId,
          label: assignee.name
        }))
      )
      setReporters(
        options.jira?.users?.map((reporter) => ({
          value: reporter.accountId,
          label: reporter.name
        }))
      )
    }
  }, [options])

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

  const handleCreate = () => {
    setIsCreateDisabled(true)
    createJiraIssue({
      variables: {
        summary,
        componentVulnId: row?.id,
        projectKey: project?.value,
        issueTypeId: issueType?.value,
        assignee: assignee?.value,
        reporter: reporter?.value,
        labels: label?.map((l) => l?.value),
        priority: priority?.value,
        description
      }
    }).then((res) => {
      if (res?.data?.jiraIssueCreate?.errors?.length === 0) {
        showToast({
          title: 'Jira Issue created.',
          description: 'Your Jira Issue has been successfully created.',
          status: 'success'
        })
        onClose()
      } else {
        setIsCreateDisabled(false)
        showToast({
          title: 'Jira Issue creation failed.',
          description: 'An error occurred while creating your Jira Issue.',
          status: 'error'
        })
      }
    })
  }

  return (
    <LynkModal
      Icon={FaJira}
      isOpen={isOpen}
      onClose={onClose}
      isLoading={loading}
      buttonText={'Create'}
      onSubmit={handleCreate}
      title={'Create Jira Issue'}
      disabled={isCreateDisabled}
    >
      <FormControl isRequired>
        <FormLabel>Summary</FormLabel>
        <Input
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          placeholder='Summary'
        />
      </FormControl>

      <Grid pt='15px' pb='15px' templateColumns='repeat(2, 1fr)' gap={4}>
        <FormControl isRequired>
          <FormLabel>Project (Default Selected)</FormLabel>
          <LynkSelect
            value={project}
            placeholder='Project'
            options={projects}
            onChange={(e) => {
              getOptions({ variables: { pKey: e.value } })
              setProject(e)
            }}
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Issue Type</FormLabel>
          <LynkSelect
            value={issueType}
            placeholder='Issue Type'
            options={issueTypes}
            onChange={(e) => setIssueType(e)}
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Reporter</FormLabel>
          <LynkSelect
            value={reporter}
            placeholder='Reporter'
            options={reporters}
            onChange={(e) => setReporter(e)}
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Assignee</FormLabel>
          <LynkSelect
            value={assignee}
            placeholder='Assignee'
            options={assignees}
            onChange={(e) => setAssignee(e)}
          />
        </FormControl>
      </Grid>

      <FormControl mt={1} isReadOnly>
        <FormLabel>Description</FormLabel>
        <Textarea
          rows={'12'}
          id='description'
          name='description'
          value={description}
          placeholder='Description'
          onChange={(e) => setDescription(e.target.value)}
        />
      </FormControl>
    </LynkModal>
  )
}

export default JiraCreateIssueModal
