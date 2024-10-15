import { gql, useLazyQuery } from '@apollo/client'
import { useCallback, useMemo } from 'react'
import { useParams } from 'react-router-dom'

import { AddIcon } from '@chakra-ui/icons'
import { Flex, IconButton, Stack, Tooltip } from '@chakra-ui/react'

import RefreshBtn from 'components/Icons/RefreshBtn'

import { FaFileExport, FaFileImport } from 'react-icons/fa'

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
              icon={<FaFileImport />}
              onClick={RULE_IMPORT.onOpen}
            />
          </Tooltip>
          <Tooltip label='Export Rules'>
            <IconButton
              colorScheme='blue'
              icon={<FaFileExport />}
              onClick={handleExport}
              isLoading={exportLoading}
            />
          </Tooltip>
          <Tooltip label='Add Rule'>
            <IconButton
              onClick={() => {
                setActiveRow(null)
                RULE.onOpen()
              }}
              colorScheme='blue'
              icon={<AddIcon />}
            />
          </Tooltip>
          <RefreshBtn />
        </Stack>
      </Flex>
    ),
    [RULE, RULE_IMPORT, handleExport, exportLoading, setActiveRow]
  )
}

export default AutomationSubHeader
