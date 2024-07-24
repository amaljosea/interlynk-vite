import { useLazyQuery, useMutation, useQuery } from '@apollo/client'
import { useEffect, useState } from 'react'
import ReactSelect from 'react-select'

import {
  Button,
  FormControl,
  FormLabel,
  Grid,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Textarea,
  useToast
} from '@chakra-ui/react'

import { useGlobalQueryContext } from 'hooks/useGlobalQueryContext'

import { CreateJiraIssue } from 'graphQL/Mutation'
import { GetJiraOptions, GetJiraProjects } from 'graphQL/Queries'

const JiraCreateIssueModal = ({ isOpen, onClose, row, defaultProject }) => {
  const { orgView } = useGlobalQueryContext()
  const { data: projectOptions } = useQuery(GetJiraProjects, {
    skip: !orgView,
    fetchPolicy: 'network-only'
  })

  const [getOptions, { data: options }] = useLazyQuery(GetJiraOptions, {
    fetchPolicy: 'network-only'
  })

  const [createJiraIssue] = useMutation(CreateJiraIssue)

  const toast = useToast()

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

    setDescription(
      `Vulnerability: ${vulnId}\n
      Description: ${desc}\n
      NVD ID: ${nvdAliasId}\n
      Component: ${component}\n
      Severity: ${sev}\n
      CVSS Vector: ${cvssVector}\n
      CVSS Score: ${cvssScore}\n
      EPSS Percentile: ${epssPercentile}\n
      EPSS Score: ${epssScore}\n
      KEV: ${kev}\n
      Status: ${vexStatus}\n
      Action Statement: ${actionStmt}\n
      Impact: ${impact}\n
      Justification: ${justification}\n
      `
    )
    setSummary(`[Vulnerability]: ${vulnId}`)

    setProject({
      value: defaultProject,
      label: defaultProject
    })

    if (defaultProject) {
      getOptions({ variables: { pKey: defaultProject } })
    }
  }, [defaultProject, getOptions, row])

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
        projectKey: project.value,
        issueTypeId: issueType.value,
        assignee: assignee.value,
        reporter: reporter.value,
        labels: label?.map((l) => l.value),
        priority: priority.value,
        description
      }
    }).then((res) => {
      if (res?.data?.jiraIssueCreate?.errors?.length === 0) {
        toast({
          title: 'Jira Issue created.',
          description: 'Your Jira Issue has been successfully created.',
          status: 'success',
          duration: 5000,
          isClosable: true,
          position: 'top'
        })
        onClose()
      } else {
        setIsCreateDisabled(false)
        toast({
          title: 'Jira Issue creation failed.',
          description: 'An error occurred while creating your Jira Issue.',
          status: 'error',
          duration: 5000,
          isClosable: true,
          position: 'top'
        })
      }
    })
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      motionPreset='slideInBottom'
      size='xl'
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Create Jira Issue </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <FormControl isRequired>
            <FormLabel>Summary</FormLabel>
            <Input
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder='Summary'
            />
          </FormControl>

          <Grid pt='15px' pb='15px' templateColumns='repeat(2, 1fr)' gap={6}>
            <FormControl isRequired>
              <FormLabel>Project (Default Selected)</FormLabel>
              <ReactSelect
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
              <ReactSelect
                value={issueType}
                placeholder='Issue Type'
                options={issueTypes}
                onChange={(e) => setIssueType(e)}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Reporter</FormLabel>
              <ReactSelect
                value={reporter}
                placeholder='Reporter'
                options={reporters}
                onChange={(e) => setReporter(e)}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Assignee</FormLabel>
              <ReactSelect
                value={assignee}
                placeholder='Assignee'
                options={assignees}
                onChange={(e) => setAssignee(e)}
              />
            </FormControl>
          </Grid>

          <FormControl pt='15px'>
            <FormLabel>Description</FormLabel>
            <Textarea
              height='200px'
              name='text'
              id='text'
              fontSize={'sm'}
              value={description}
              placeholder='Description'
              onChange={(e) => setDescription(e.target.value)}
              disabled={false}
              resize={'none'}
            />
          </FormControl>
        </ModalBody>
        <ModalFooter>
          <Button variant='unstyled' colorScheme='red' onClick={onClose}>
            Cancel
          </Button>
          <Button
            colorScheme='blue'
            ml={3}
            onClick={handleCreate}
            isDisabled={isCreateDisabled}
          >
            Create
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default JiraCreateIssueModal
