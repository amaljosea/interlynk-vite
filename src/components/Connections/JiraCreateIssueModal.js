import { gql, useLazyQuery, useMutation, useQuery } from '@apollo/client'
import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import {
  FormControl,
  FormLabel,
  Grid,
  Input,
  Stack,
  Textarea
} from '@chakra-ui/react'

import LynkDate from 'components/LynkDate'
import LynkModal from 'components/LynkModal'
import LynkSelect from 'components/LynkSelect'

import useCustomToast from 'hooks/useCustomToast'

import { CreateBulkJiraIssue, CreateJiraIssue } from 'graphQL/Mutation'
import {
  GetJiraProjectFields,
  GetJiraProjects,
  JiraInformation
} from 'graphQL/Queries'

import { LuBolt } from 'react-icons/lu'

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

const JiraCreateIssueModal = ({
  isOpen,
  onClose,
  row,
  selectedVulns,
  setSelectedVulns,
  setToggleClear
}) => {
  const params = useParams()
  const { showToast } = useCustomToast()

  const [summary, setSummary] = useState('')
  const [issueTypeList, setIssueTypeList] = useState([])
  const [assigneeList, setAssigneeList] = useState([])
  const [reporterList, setReporterList] = useState([])

  const [project, setProject] = useState(null)
  const [issueType, setIssueType] = useState(null)
  const [assignee, setAssignee] = useState(null)
  const [reporter, setReporter] = useState(null)

  const [priorities, setPriorities] = useState([])
  const [priority, setPriority] = useState(null)

  const [labels, setLabels] = useState([])
  const [label, setLabel] = useState(null)

  const [description, setDescription] = useState('')
  const [isCreateDisabled, setIsCreateDisabled] = useState(true)

  const [formValues, setFormValues] = useState({})

  const { data: projectOptions, loading: projectsLoading } = useQuery(
    GetJiraProjects,
    {
      skip: isOpen ? false : true,
      fetchPolicy: 'network-only'
    }
  )
  const { projects: jiraProjects } = projectOptions?.jira || {}
  const projectList =
    jiraProjects?.length > 0
      ? jiraProjects?.map((project) => ({
          value: project.key,
          label: project.name
        }))
      : []

  const { data: settings } = useQuery(GetProjectSettings, {
    skip: isOpen ? false : true,
    variables: { id: params.productid }
  })

  const { projectSetting } = settings?.project || {}

  const [getJiraInformation, { data: info, loading: infoLoading }] =
    useLazyQuery(JiraInformation)

  const [createJiraIssue, { loading }] = useMutation(CreateJiraIssue)
  const [createBulkIssue, { loading: bulkLoading }] = useMutation(
    CreateBulkJiraIssue,
    {
      onCompleted: (data) => {
        if (data) {
          setSelectedVulns([])
          setToggleClear(true)
        }
      }
    }
  )

  const { data } = useQuery(GetJiraProjectFields, {
    fetchPolicy: 'network-only',
    skip: issueType ? false : true,
    variables: {
      projectKey: project?.value,
      issueTypeId: issueType?.value
    }
  })
  const { fields } = data?.jira?.project || {}
  // const customFields = fields?.filter((item) => item?.custom === true)
  const componentField = fields?.find((item) => item?.name === 'Components')

  const handleClear = () => {
    setReporter(null)
    setAssignee(null)
    setLabel([])
    setPriority(null)
    setFormValues({})
  }

  const handleChangeProject = async (project) => {
    setProject(project)
    setIssueType(null)
    setIssueTypeList([])
    setAssigneeList([])
    setReporterList([])
    handleClear()
    if (project) {
      await getJiraInformation({
        variables: { pKey: project?.value }
      })
    }
  }

  const handleChangeIssue = (issue) => {
    setIssueType(issue)
    handleClear()
  }

  const handleChange = (name, value) => {
    setFormValues((prev) => ({ ...prev, [name]: value }))
  }

  const renderField = (field) => {
    const value = formValues[field?.name] || []

    switch (field?.type) {
      case 'array': {
        const options =
          field?.allowedValues?.map((opt) => ({
            label: opt?.value || opt?.name,
            value: opt?.id
          })) || []

        const selected =
          field?.allowedValues?.length > 0
            ? field?.allowedValues
                .filter((item) => value.includes(item?.id))
                .map((item) => ({
                  value: item?.id,
                  label: item?.value || item?.name
                }))
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
            placeholder='Add value'
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

  const handleApply = useCallback(async () => {
    const { jiraProject, jiraIssueType, jiraAssignee, jiraReporter } =
      projectSetting || {}
    const project = projectOptions?.jira?.projects?.find(
      (item) => item?.key === jiraProject
    )
    setProject(project ? { value: project?.key, label: project.name } : null)
    if (project) {
      await getJiraInformation({ variables: { pKey: project?.key } }).then(
        (res) => {
          if (res?.data?.jira) {
            const { jira } = res?.data || {}
            const issueType = jira?.issueTypes?.find(
              (item) => item?.id === jiraIssueType
            )
            const assignee = jira?.users?.find(
              (item) => item?.accountId === jiraAssignee
            )
            const reporter = jira?.users?.find(
              (item) => item?.accountId === jiraReporter
            )
            setIssueType(
              issueType
                ? { value: issueType?.id, label: issueType?.name }
                : null
            )
            setAssignee(
              assignee
                ? { value: assignee?.accountId, label: assignee?.name }
                : null
            )
            setReporter(
              reporter
                ? { value: reporter?.accountId, label: reporter?.name }
                : null
            )
          }
        }
      )
    }
  }, [getJiraInformation, projectOptions?.jira?.projects, projectSetting])

  useEffect(() => {
    if (info?.jira) {
      const { jira } = info || {}
      const issueTypes =
        jira?.issueTypes?.length > 0
          ? jira?.issueTypes?.map((issueType) => ({
              value: issueType.id,
              label: issueType.name
            }))
          : []
      setIssueTypeList(issueTypes)
      const assignees =
        jira?.users?.length > 0
          ? jira?.users?.map((assignee) => ({
              value: assignee.accountId,
              label: assignee.name
            }))
          : []
      setAssigneeList(assignees)
      const reporters =
        jira?.users?.length > 0
          ? jira?.users?.map((assignee) => ({
              value: assignee.accountId,
              label: assignee.name
            }))
          : []
      setReporterList(reporters)
    }
  }, [info])

  useEffect(() => {
    if (selectedVulns?.length === 0) {
      const vulnId = row?.vuln?.vulnId || 'N/A'
      const desc = row?.vuln?.desc || 'N/A'
      const nvdAliasId = row?.vuln?.nvdAliasId || 'N/A'
      const component = row?.component?.name || 'N/A'
      const sev = row?.vuln?.sev || 'N/A'
      const cvssVector = row?.vuln?.cvssVector || 'N/A'
      const cvssScore = row?.vuln?.cvssScore || 'N/A'
      const epssPercentile = row?.vuln?.vulnInfo?.epssPercentile || 'N/A'
      const epssScore = row?.vuln?.vulnInfo?.epssScore || 'N/A'
      const kev = row?.vuln?.vulnInfo?.kev === true ? 'True' : 'False' || 'N/A'
      const vexStatus = row?.vexStatus?.name || 'N/A'
      const actionStmt = row?.actionStmt || 'N/A'
      const impact = row?.impact || 'N/A'
      const justification = row?.vexJustification?.name || 'N/A'
      const note = row?.note || 'N/A'
      const customFields = formatCustomVulnFields(
        row?.componentVulnCustomFields
      )

      setDescription(
        `Subject: [${vulnId}]: ${desc}\n
Body:\n
Summary: ${desc || 'N/A'}\n
Issue Type:\n
Vulnerability:\n
Affected Product: ${row?.component?.sbom?.project?.projectGroup?.name}\n
Affected Version (Environment): ${row?.component?.sbom?.project?.projectGroup?.name} (${row?.component?.sbom?.project?.name})\n
Affected Components: ${component}: ${row?.component?.version}\nPURL: ${row?.component?.purl}\n
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
    } else {
      const vulnIds = selectedVulns?.map((item) => item?.vuln?.vulnId)
      setSummary(`[Vulnerability]: ${vulnIds?.join(', ')}`)
    }

    handleApply()
  }, [handleApply, row, selectedVulns])

  useEffect(() => {
    if (summary && project && issueType && reporter && assignee) {
      setIsCreateDisabled(false)
    } else {
      setIsCreateDisabled(true)
    }
  }, [summary, project, issueType, reporter, assignee])

  useEffect(() => {
    if (fields?.length > 0) {
      const priorityList = fields?.find((item) => item?.type === 'priority')
      if (priorityList) {
        const result = priorityList?.allowedValues?.map((item) => ({
          value: item?.name,
          label: item?.name
        }))
        setPriorities(result)
      }
    }
  }, [fields])

  const getComponentValue = (value) => {
    switch (componentField?.type) {
      case 'array':
        return value?.map((item) => ({ id: item }))
      case 'option':
        return [{ id: value }]
      default:
        return [{ id: value }]
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
        components: components ? getComponentValue(components) : undefined
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

  const handleBulkCreate = () => {
    setIsCreateDisabled(true)
    const filteredLabels = label?.map((item) => item?.value)
    const vulnIds = selectedVulns?.map((item) => item?.id)
    createBulkIssue({
      variables: {
        vulnIds: vulnIds,
        projectKey: project?.value,
        issueTypeId: issueType?.value,
        assignee: assignee?.value,
        reporter: reporter?.value,
        labels: filteredLabels?.length > 0 ? filteredLabels : undefined,
        priority: priority?.value || undefined
      }
    }).then((res) => {
      const ticketErrors = res?.data?.jiraIssueBulkCreate?.results?.flatMap(
        (result) => result?.errors
      )
      if (ticketErrors?.length > 0) {
        showToast({
          title: 'Jira Issue creation failed.',
          description: 'An error occurred while creating your Jira Issue.',
          status: 'error'
        })
      } else {
        showToast({
          title: 'Jira Issue created.',
          description: 'Your Jira Issues has been successfully created.',
          status: 'success'
        })
        onClose()
      }
    })
  }

  const hasMultipleVuln = selectedVulns?.length > 0

  return (
    <LynkModal
      Icon={LuBolt}
      isOpen={isOpen}
      onClose={onClose}
      buttonText={'Create'}
      title={'Create Jira Issue'}
      disabled={isCreateDisabled}
      isLoading={loading || bulkLoading}
      onSubmit={hasMultipleVuln ? handleBulkCreate : handleCreate}
    >
      <FormControl pt={'15px'} isRequired hidden={hasMultipleVuln}>
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
            value={project}
            isClearable={true}
            options={projectList}
            isLoading={projectsLoading}
            placeholder='Select Project'
            onChange={(value) => handleChangeProject(value)}
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Issue Type</FormLabel>
          <LynkSelect
            value={issueType}
            isClearable={true}
            options={issueTypeList}
            isLoading={infoLoading}
            placeholder='Select Issue Type'
            onChange={(value) => handleChangeIssue(value)}
          />
        </FormControl>

        <FormControl isRequired hidden={!issueType}>
          <FormLabel>Reporter</FormLabel>
          <LynkSelect
            value={reporter}
            isClearable={true}
            options={reporterList}
            placeholder='Select Reporter'
            onChange={(e) => setReporter(e)}
          />
        </FormControl>

        <FormControl isRequired hidden={!issueType}>
          <FormLabel>Assignee</FormLabel>
          <LynkSelect
            value={assignee}
            isClearable={true}
            options={assigneeList}
            placeholder='Select Assignee'
            onChange={(e) => setAssignee(e)}
          />
        </FormControl>
      </Grid>

      <Stack spacing={4}>
        <FormControl hidden={!issueType || hasMultipleVuln}>
          <FormLabel>Create/Assign Label</FormLabel>
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

        <FormControl hidden={!issueType || hasMultipleVuln}>
          <FormLabel>Priority</FormLabel>
          <LynkSelect
            value={priority}
            isClearable={true}
            placeholder='Select Priority'
            options={priorities}
            onChange={(e) => setPriority(e)}
          />
        </FormControl>

        {componentField && (
          <FormControl
            key={componentField?.id}
            isRequired={componentField?.required}
            hidden={!issueType || hasMultipleVuln}
          >
            <FormLabel>{componentField?.name}</FormLabel>
            {renderField(componentField)}
          </FormControl>
        )}

        <FormControl isReadOnly hidden={hasMultipleVuln}>
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
      </Stack>
    </LynkModal>
  )
}

export default JiraCreateIssueModal
