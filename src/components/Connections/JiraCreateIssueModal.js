import { useLazyQuery, useMutation, useQuery } from '@apollo/client'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import { FormControl, FormLabel, Grid, Input, Textarea } from '@chakra-ui/react'

import LynkDate from 'components/LynkDate'
import LynkModal from 'components/LynkModal'
import LynkSelect from 'components/LynkSelect'

import useCustomToast from 'hooks/useCustomToast'

import { CreateJiraIssue } from 'graphQL/Mutation'
import {
  GetDefaultJiraProduct,
  GetJiraOptions,
  GetJiraProjectFields,
  GetJiraProjects
} from 'graphQL/Queries'

import { LuBolt } from 'react-icons/lu'

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
  const [project, setProject] = useState(null)

  const [issueTypes, setIssueTypes] = useState([])
  const [issueType, setIssueType] = useState(null)

  const [assignees, setAssignees] = useState([])
  const [assignee, setAssignee] = useState(null)

  const [reporters, setReporters] = useState([])
  const [reporter, setReporter] = useState(null)

  const [priorities, setPriorities] = useState([])
  const [priority, setPriority] = useState(null)

  const [labels, setLabels] = useState([])
  const [label, setLabel] = useState(null)

  const [description, setDescription] = useState('')
  const [isCreateDisabled, setIsCreateDisabled] = useState(true)

  const [formValues, setFormValues] = useState({})

  const { data } = useQuery(GetJiraProjectFields, {
    fetchPolicy: 'network-only',
    skip: issueType ? false : true,
    variables: {
      projectKey: project?.value,
      issueTypeId: issueType?.value
    }
  })
  const { projectFields } = data || {}
  const customFields = projectFields?.filter((item) => item?.custom === true)
  const componentField = customFields?.find(
    (item) => item?.name === 'Components'
  )

  const handleClear = () => {
    setReporter(null)
    setAssignee(null)
    setLabel([])
    setPriority(null)
    setFormValues({})
  }

  const handleChangeProject = (project) => {
    project && getOptions({ variables: { pKey: project.value } })
    setProject(project)
    setIssueType(null)
    handleClear()
  }

  const handleChangeIssue = (issue) => {
    setIssueType(issue)
    handleClear()
  }

  const handleChange = (name, value) => {
    setFormValues((prev) => ({ ...prev, [name]: value }))
  }

  const renderField = (field) => {
    const value = formValues[field?.name] || ''

    switch (field?.type) {
      case 'array': {
        const options =
          field?.allowedValues?.map((opt) => ({
            label: opt?.value,
            value: opt?.value
          })) || []

        const selected = Array.isArray(value)
          ? value.map((v) => ({ label: v, value: v }))
          : []

        return (
          <LynkSelect
            isCreatable
            isMulti={true}
            value={selected}
            options={options}
            isClearable={true}
            isSearchable={true}
            onChange={(vals) =>
              handleChange(
                field?.name,
                vals.map((v) => v.value)
              )
            }
          />
        )
      }
      case 'option': {
        const options =
          field?.allowedValues?.map((opt) => ({
            label: opt?.value,
            value: opt?.id
          })) || []

        const selected = options?.find((item) => item?.value === value) || null

        return (
          <LynkSelect
            dropDown
            value={selected}
            options={options}
            isClearable={true}
            onChange={(item) => handleChange(field?.name, item?.value)}
          />
        )
      }
      case 'date':
        return (
          <LynkDate
            value={value}
            onChange={(value) => handleChange(field?.name, value?._d)}
          />
        )
      default:
        return (
          <Input
            value={value}
            placeholder='Enter value'
            onChange={(e) => handleChange(field?.name, e.target.value)}
          />
        )
    }
  }

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

    if (jiraProject) {
      getOptions({ variables: { pKey: jiraProject } })
      setProject({ value: jiraProject, label: jiraProject })
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

  useEffect(() => {
    if (projectFields?.length > 0) {
      const priorityList = projectFields?.find(
        (item) => item?.type === 'priority'
      )
      if (priorityList) {
        const result = priorityList?.allowedValues?.map((item) => ({
          value: item?.name,
          label: item?.name
        }))
        setPriorities(result)
      }
    }
  }, [projectFields])

  const getComponentValue = (value) => {
    switch (componentField?.type) {
      case 'array':
        return value
      case 'option':
        return { id: value }
      default:
        return value
    }
  }

  const handleCreate = () => {
    setIsCreateDisabled(true)
    const filteredLabels = label?.map((item) => item?.value)
    const components = formValues?.Components || null
    createJiraIssue({
      variables: {
        summary,
        description,
        componentVulnId: row?.id,
        projectKey: project?.value,
        issueTypeId: issueType?.value,
        assignee: assignee?.value,
        reporter: reporter?.value,
        labels: filteredLabels?.length > 0 ? filteredLabels : undefined,
        priority: priority?.value || undefined,
        customFields: {
          components: components ? getComponentValue(components) : undefined
        }
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
      Icon={LuBolt}
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
          <FormLabel>Project</FormLabel>
          <LynkSelect
            dropDown
            value={project}
            options={projects}
            isClearable={true}
            placeholder='Select Project'
            onChange={(value) => handleChangeProject(value)}
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Issue Type</FormLabel>
          <LynkSelect
            dropDown
            value={issueType}
            isClearable={true}
            placeholder='Select Issue Type'
            options={issueTypes}
            onChange={(value) => handleChangeIssue(value)}
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Reporter</FormLabel>
          <LynkSelect
            dropDown
            value={reporter}
            isClearable={true}
            placeholder='Select Reporter'
            options={reporters}
            onChange={(e) => setReporter(e)}
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Assignee</FormLabel>
          <LynkSelect
            dropDown
            value={assignee}
            isClearable={true}
            placeholder='Select Assignee'
            options={assignees}
            onChange={(e) => setAssignee(e)}
          />
        </FormControl>

        <FormControl>
          <FormLabel>Label</FormLabel>
          <LynkSelect
            isCreatable
            value={label}
            isMulti={true}
            isClearable={true}
            isSearchable={true}
            placeholder='Add Labels'
            options={labels}
            onChange={(e) => setLabel(e)}
          />
        </FormControl>

        <FormControl>
          <FormLabel>Priority</FormLabel>
          <LynkSelect
            dropDown
            value={priority}
            isClearable={true}
            placeholder='Select Priority'
            options={priorities}
            onChange={(e) => setPriority(e)}
          />
        </FormControl>
      </Grid>

      <Grid templateColumns='repeat(2, 1fr)' gap={4}>
        {customFields?.map((field) => (
          <FormControl key={field?.id} isRequired={field?.required} mb={4}>
            <FormLabel>{field.name}</FormLabel>
            {renderField(field)}
          </FormControl>
        ))}
      </Grid>

      <FormControl isReadOnly>
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
