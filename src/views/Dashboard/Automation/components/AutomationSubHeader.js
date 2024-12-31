import { gql, useLazyQuery } from '@apollo/client'
import { useCallback, useMemo } from 'react'
import { useParams } from 'react-router-dom'

import { Flex, IconButton, Stack, Tooltip } from '@chakra-ui/react'

import AddButton from 'components/Icons/AddButton'
import RefreshBtn from 'components/Icons/RefreshBtn'

import { useHasPermission } from 'hooks/useHasPermission'

import { FaFileExport, FaFileImport } from 'react-icons/fa'
import { TbFileExport, TbFileImport } from 'react-icons/tb'

const RuleExport = gql`
  query RuleExport($id: Uuid!) {
    project(id: $id) {
      automationRulesExport
    }
  }
`

const AutomationSubHeader = ({ RULE, RULE_IMPORT, setActiveRow, projects }) => {
  const params = useParams()
  const productId = params.productid

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

  return useMemo(
    () => (
      <Flex width={'100%'} alignItems={'center'} justifyContent={'flex-end'}>
        <Stack direction={'row'} spacing={2} alignItems={'center'}>
          <Tooltip label='Import Rules'>
            <IconButton
              colorScheme='blue'
              icon={<TbFileImport size={20} />}
              onClick={RULE_IMPORT.onOpen}
              isDisabled={!canEditAutomations}
            />
          </Tooltip>
          <Tooltip label='Export Rules'>
            <IconButton
              colorScheme='blue'
              icon={<TbFileExport size={20} />}
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
          <RefreshBtn />
        </Stack>
      </Flex>
    ),
    [
      RULE,
      RULE_IMPORT,
      handleExport,
      exportLoading,
      setActiveRow,
      canEditAutomations
    ]
  )
}

export default AutomationSubHeader
