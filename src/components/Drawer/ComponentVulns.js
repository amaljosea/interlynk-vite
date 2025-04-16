import React from 'react'
import { useNavigate } from 'react-router-dom'
import { linkURl } from 'utils'
import { statusColor } from 'utils/styleUtils'

import { Tag, TagLabel } from '@chakra-ui/react'
import { Flex, Stack, Text } from '@chakra-ui/react'

import ExternalNavIcon from 'components/Icons/ExternalNavIcon'
import LynkDrawer from 'components/LynkDrawer'
import LynkTable from 'components/LynkTable'
import CompInfo from 'components/Misc/CompInfo'
import SeverityTag from 'components/Misc/SeverityTag'
import Pagination from 'components/Pagination'

import { useGlobalState } from 'hooks/useGlobalState'
import { usePaginatedQuery } from 'hooks/usePaginatedQuery'
import { useProductUrlContext } from 'hooks/useProductUrlContext'
import { useThemeColor } from 'hooks/useThemeColors'

import { GetComponentVulns } from 'graphQL/Queries'

const ComponentVulns = ({ data, isOpen, onClose }) => {
  const navigate = useNavigate()
  const { dispatch } = useGlobalState()
  const { primaryBlueText } = useThemeColor(['primaryBlueText'])
  const { generateProductVersionDetailPageUrlFromCurrentUrl } =
    useProductUrlContext()

  const { prodVulnDispatch } = dispatch

  const { nodes, paginationProps, loading } = usePaginatedQuery(
    GetComponentVulns,
    {
      skip: isOpen ? false : true,
      selector: 'component.vulns',
      variables: { id: data?.id, sbomId: data?.sbomId }
    }
  )

  const columns = [
    {
      id: 'VULN_ID',
      name: 'ID',
      selector: (row) => {
        const { vuln } = row
        const link = generateProductVersionDetailPageUrlFromCurrentUrl({
          paramsObj: { tab: 'vulnerabilities' }
        })
        const onGlobalView = () => {
          onClose()
          prodVulnDispatch({
            type: 'CHANGE_SEARCH_INPUT',
            payload: vuln?.vulnId
          })
          navigate(link)
        }
        return (
          <Flex alignItems={'center'} gap={2} my={3}>
            <ExternalNavIcon href={linkURl(vuln.source, vuln.vulnId)} />
            <Text
              my={2}
              cursor={'pointer'}
              color={primaryBlueText}
              onClick={onGlobalView}
            >
              {vuln?.vulnId || ''}
            </Text>
          </Flex>
        )
      },
      wrap: true
    },
    {
      id: 'VULNS_SEV',
      name: 'SEVERITY',
      selector: (row) => <SeverityTag value={row?.vuln?.sev} />,
      sortable: true,
      wrap: true
    },
    {
      id: 'VEX_STATUSES_NAME',
      name: 'STATUS',
      selector: (row) => {
        const { vexStatus } = row
        return (
          <Tag
            size='md'
            variant='solid'
            width={'160px'}
            colorScheme={statusColor(
              vexStatus ? vexStatus?.name : 'Unspecified'
            )}
          >
            <TagLabel mx={'auto'}>
              {vexStatus !== null ? vexStatus.name : 'Unspecified'}
            </TagLabel>
          </Tag>
        )
      },
      wrap: true
    }
  ]

  return (
    <LynkDrawer
      title={'Vulnerabilities'}
      subtitle={data && <CompInfo data={data} />}
      size='lg'
      isOpen={isOpen}
      onClose={onClose}
      noFooter
    >
      <Stack>
        <LynkTable
          columns={columns}
          data={nodes || []}
          progressPending={loading}
        />
        <Pagination {...paginationProps} />
      </Stack>
    </LynkDrawer>
  )
}

export default ComponentVulns
