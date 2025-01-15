import { useMemo } from 'react'
import DataTable from 'react-data-table-component'
import { getFullDate, timeSince } from 'utils'
import { customStyles } from 'utils/styleUtils'

import { Flex, Stack, Text, Tooltip, useDisclosure } from '@chakra-ui/react'
import { IconButton } from '@chakra-ui/react'

import CustomLoader from 'components/CustomLoader'
import RefreshBtn from 'components/Icons/RefreshBtn'
import SeverityTag from 'components/Misc/SeverityTag'
import CustomVuln from 'components/Modal/CustomVuln'
import Pagination from 'components/Pagination'

import { useGlobalState } from 'hooks/useGlobalState'
import { useHasPermission } from 'hooks/useHasPermission'
import { usePaginatedQuery } from 'hooks/usePaginatedQuery'
import useQueryParam from 'hooks/useQueryParam'
import { useThemeColor } from 'hooks/useThemeColors'

import { GetCustomVulns } from 'graphQL/Queries'

import { FaPlus } from 'react-icons/fa6'

const CustomVulnTable = () => {
  const tab = useQueryParam('tab')
  const { organization } = useGlobalState()
  const isFreeTier = organization?.tier === 'free'

  const editVulns = useHasPermission({
    parentKey: 'view_sbom',
    childKey: 'edit_vulnerabilities'
  })

  const { isOpen, onOpen, onClose } = useDisclosure()

  const {
    headingTextColor,
    primaryTextColor,
    primaryBlueText,
    secondaryTextColor
  } = useThemeColor([
    'headingTextColor',
    'primaryTextColor',
    'primaryBlueText',
    'secondaryTextColor'
  ])

  const { nodes, paginationProps, loading } = usePaginatedQuery(
    GetCustomVulns,
    {
      skip: tab === 'customVulnerabilities' && editVulns ? false : true,
      selector: 'organization.customVulns'
    }
  )

  const SubHeader = useMemo(() => {
    return (
      <Flex
        width={'100%'}
        alignItems={'center'}
        justifyContent={'space-between'}
      >
        <Flex></Flex>
        <Flex gap={2}>
          {!isFreeTier && (
            <Tooltip label={'Add Custom Vulnerability'}>
              <IconButton
                onClick={onOpen}
                icon={<FaPlus />}
                colorScheme='blue'
                isDisabled={!editVulns}
              />
            </Tooltip>
          )}
          <RefreshBtn />
        </Flex>
      </Flex>
    )
  }, [editVulns, isFreeTier, onOpen])

  const columns = [
    // CVE ID
    {
      id: 'VULNS_VULN_ID',
      name: 'ID',
      wrap: true,
      selector: (row) => {
        const { desc, vulnIdentifier } = row
        return (
          <Stack spacing={1} my={4}>
            <Text fontSize='sm' color={primaryBlueText}>
              {vulnIdentifier || ''}
            </Text>
            <Text fontSize='sm' color={secondaryTextColor}>
              {desc || ''}
            </Text>
          </Stack>
        )
      },
      width: '18%',
      sortable: true
    },
    // SEVERITY
    {
      id: 'VULNS_SEV',
      name: 'SEVERITY',
      selector: (row) => <SeverityTag value={row?.sev} />,
      sortable: true,
      width: '10%',
      wrap: true
    },
    // REPORTED AT
    {
      id: 'VULNS_REPORTED_AT',
      name: 'REPORTED',
      selector: (row) => {
        const { reportedAt } = row
        const reported = reportedAt ? timeSince(reportedAt) : ''
        return (
          <Tooltip
            label={reported ? getFullDate(reportedAt) : 'N/A'}
            placement={'top'}
          >
            <Text color={primaryTextColor} textAlign={'right'}>
              {reported || 'N/A'}
            </Text>
          </Tooltip>
        )
      },
      sortable: true,
      sortFunction: (a, b) => {
        const dateA = new Date(a?.publishedAt)
        const dateB = new Date(b?.publishedAt)
        return dateA - dateB // Sort in descending order
      },
      wrap: true,
      right: 'true'
    },
    // PUBLISHED AT
    {
      id: 'VULNS_PUBLISHED_AT',
      name: 'PUBLISHED',
      selector: (row) => {
        const { publishedAt } = row
        const published = publishedAt ? timeSince(publishedAt) : ''
        return (
          <Tooltip
            label={published ? getFullDate(publishedAt) : 'N/A'}
            placement={'top'}
          >
            <Text color={primaryTextColor} textAlign={'right'}>
              {published || 'N/A'}
            </Text>
          </Tooltip>
        )
      },
      sortable: true,
      sortFunction: (a, b) => {
        const dateA = new Date(a?.publishedAt)
        const dateB = new Date(b?.publishedAt)
        return dateA - dateB // Sort in descending order
      },
      wrap: true,
      right: 'true'
    },
    // MODIFIED AT
    {
      id: 'VULNS_LAST_MODIFIED_AT',
      name: 'MODIFIED',
      selector: (row) => {
        const { lastModifiedAt } = row
        const modified = lastModifiedAt ? timeSince(lastModifiedAt) : ''
        return (
          <Tooltip
            label={modified ? getFullDate(lastModifiedAt) : 'N/A'}
            placement={'top'}
          >
            <Text color={primaryTextColor} textAlign={'right'}>
              {modified || 'N/A'}
            </Text>
          </Tooltip>
        )
      },
      sortable: true,
      sortFunction: (a, b) => {
        const dateA = new Date(a?.lastModifiedAt)
        const dateB = new Date(b?.lastModifiedAt)
        return dateA - dateB // Sort in descending order
      },
      wrap: true,
      right: 'true'
    }
  ]

  return (
    <>
      {/* TABLE */}
      <Flex flexDir={'column'} width={'100%'}>
        <DataTable
          subHeader
          responsive
          data={nodes}
          keyField='key'
          persistTableHead
          columns={columns}
          progressPending={loading}
          subHeaderComponent={SubHeader}
          progressComponent={<CustomLoader />}
          customStyles={customStyles(headingTextColor)}
        />
        <Pagination {...paginationProps} />
      </Flex>

      {/* CUSTOM VULNS */}
      {isOpen && <CustomVuln isOpen={isOpen} onClose={onClose} />}
    </>
  )
}

export default CustomVulnTable
