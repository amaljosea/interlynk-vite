import { gql, useLazyQuery, useQuery } from '@apollo/client'
import { useCallback, useMemo } from 'react'
import { useParams } from 'react-router-dom'

import { Flex, IconButton, Stack, Text, Tooltip } from '@chakra-ui/react'

import AddButton from 'components/Icons/AddButton'
import RefreshBtn from 'components/Icons/RefreshBtn'

import { useHasPermission } from 'hooks/useHasPermission'
import useQueryParam from 'hooks/useQueryParam'

import { LuCircleAlert, LuFolderUp, LuImport } from 'react-icons/lu'

const RuleExport = gql`
  query RuleExport($id: Uuid!) {
    project(id: $id) {
      automationRulesExport
    }
  }
`

export const GetVulnSetting = gql`
  query GetVulnSetting($id: Uuid!) {
    project(id: $id) {
      projectSetting {
        automatedFixesEnabled
      }
    }
  }
`

const AutomationSubHeader = ({ RULE, RULE_IMPORT, setActiveRow, projects }) => {
  const params = useParams()
  const activeTab = useQueryParam('tab')
  const productId = params.productid

  const { data: settings, loading } = useQuery(GetVulnSetting, {
    variables: { id: params?.productid },
    skip: activeTab === 'automation rules' ? false : true
  })
  const { projectSetting } = settings?.project || {}
  const { automatedFixesEnabled } = projectSetting || {}

  const [exportRule, { loading: exportLoading }] = useLazyQuery(RuleExport)

  const activeProject = projects?.find((item) => item?.id === productId)

  const canEditAutomations = useHasPermission({
    parentKey: 'view_product_group',
    childKey: 'edit_product_automations'
  })

  const downloadJsonFile = useCallback(
    (data) => {
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json'
      })
      const link = document.createElement('a')
      link.download = `${activeProject?.projectGroup?.name}-${activeProject?.name}.json`
      link.href = window.URL.createObjectURL(blob)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    },
    [activeProject]
  )

  const handleExport = useCallback(() => {
    exportRule({
      variables: {
        id: productId
      }
    }).then((res) => {
      if (res.called) {
        const data = res?.data?.project?.automationRulesExport
        data && downloadJsonFile(data)
      }
    })
  }, [downloadJsonFile, exportRule, productId])

  return useMemo(() => {
    if (loading) return null

    return (
      <Flex
        width={'100%'}
        alignItems={'center'}
        justifyContent={!automatedFixesEnabled ? 'space-between' : 'flex-end'}
      >
        {!automatedFixesEnabled && (
          <Flex gap={2} alignItems={'center'} w={'fit-content'}>
            <LuCircleAlert size={18} color={'darkorange'} />
            <Text fontSize={'sm'} color={'darkorange'}>
              Automation is disabled under Product Settings
            </Text>
          </Flex>
        )}
        <Stack direction={'row'} spacing={2} alignItems={'center'}>
          <Tooltip label='Import Rules'>
            <IconButton
              colorScheme='blue'
              icon={<LuImport size={18} />}
              onClick={RULE_IMPORT.onOpen}
              isDisabled={!canEditAutomations}
            />
          </Tooltip>
          <Tooltip label='Export Rules'>
            <IconButton
              colorScheme='blue'
              icon={<LuFolderUp size={18} />}
              onClick={handleExport}
              isLoading={exportLoading}
            />
          </Tooltip>
          <AddButton
            label='Add Rule'
            onClick={() => {
              setActiveRow(null)
              RULE.onOpen()
            }}
            aria-label='add_automation_rule'
            isDisabled={!canEditAutomations}
          />
          <RefreshBtn queries={['GetProjectAutomations']} />
        </Stack>
      </Flex>
    )
  }, [
    automatedFixesEnabled,
    loading,
    RULE_IMPORT.onOpen,
    canEditAutomations,
    handleExport,
    exportLoading,
    setActiveRow,
    RULE
  ])
}

export default AutomationSubHeader
