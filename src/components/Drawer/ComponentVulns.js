import React from 'react'
import DataTable from 'react-data-table-component'
import { useNavigate } from 'react-router-dom'
import { customStyles, linkURl, statusColor } from 'utils'

import { Tag, TagLabel } from '@chakra-ui/react'
import { Flex, Stack, Text, Tooltip } from '@chakra-ui/react'
import {
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay
} from '@chakra-ui/react'

import CustomLoader from 'components/CustomLoader'
import ExternalNavIcon from 'components/Icons/ExternalNavIcon'
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
  const { generateProductVersionDetailPageUrlFromCurrentUrl } =
    useProductUrlContext()
  const { dispatch } = useGlobalState()
  const { prodVulnDispatch } = dispatch

  const { primaryBlueText, headingTextColor } = useThemeColor([
    'primaryBlueText',
    'headingTextColor'
  ])

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
            <Tooltip label={vuln.source === 'osv' ? 'OSV View' : 'NVD View'}>
              <ExternalNavIcon href={linkURl(vuln.source, vuln.vulnId)} />
            </Tooltip>
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
    <Drawer
      size='lg'
      isOpen={isOpen}
      placement='right'
      onClose={onClose}
      closeOnOverlayClick={false}
    >
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton mt={3} />
        <DrawerHeader borderBottomWidth='1px'>
          <Text mb={1} fontWeight={'medium'}>
            Vulnerabilities
          </Text>
          {data && <CompInfo data={data} />}
        </DrawerHeader>
        <DrawerBody>
          <Stack>
            <DataTable
              responsive
              columns={columns}
              data={nodes || []}
              customStyles={customStyles(headingTextColor)}
              progressPending={loading}
              progressComponent={<CustomLoader />}
              persistTableHead
            />
            <Pagination {...paginationProps} />
          </Stack>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  )
}

export default ComponentVulns
