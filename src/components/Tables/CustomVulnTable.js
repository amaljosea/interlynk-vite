import { useMutation } from '@apollo/client'
import { useMemo, useState } from 'react'
import DataTable from 'react-data-table-component'
import { getFullDate, timeSince, truncatedValue } from 'utils'
import { customStyles } from 'utils/styleUtils'
import ConfirmationModal from 'views/Dashboard/Products/components/ConfirmationModal'

import {
  Flex,
  Menu,
  MenuItem,
  MenuList,
  Portal,
  Stack,
  Text,
  Tooltip,
  useDisclosure
} from '@chakra-ui/react'
import { IconButton } from '@chakra-ui/react'

import CustomLoader from 'components/CustomLoader'
import RefreshBtn from 'components/Icons/RefreshBtn'
import LynkAction from 'components/Misc/LynkAction'
import SeverityTag from 'components/Misc/SeverityTag'
import CustomVuln from 'components/Modal/CustomVuln'
import Pagination from 'components/Pagination'

import useCustomToast from 'hooks/useCustomToast'
import { useGlobalQueryContext } from 'hooks/useGlobalQueryContext'
import { useHasPermission } from 'hooks/useHasPermission'
import { usePaginatedQuery } from 'hooks/usePaginatedQuery'
import useQueryParam from 'hooks/useQueryParam'
import { useThemeColor } from 'hooks/useThemeColors'

import { CustomVulnDelete } from 'graphQL/Mutation'
import { GetCustomVulns } from 'graphQL/Queries'

import { FaPlus } from 'react-icons/fa6'

const CustomVulnTable = () => {
  const tab = useQueryParam('tab')
  const { showToast } = useCustomToast()
  const { isFreeTier } = useGlobalQueryContext()

  const editVulns = useHasPermission({
    parentKey: 'view_sbom',
    childKey: 'edit_vulnerabilities'
  })

  const EDIT = useDisclosure()
  const DELETE = useDisclosure()
  const [activeRow, setActiveRow] = useState(null)

  const {
    headingTextColor,
    primaryTextColor,
    secondaryTextColor,
    primaryErrorColor
  } = useThemeColor([
    'headingTextColor',
    'primaryTextColor',
    'secondaryTextColor',
    'primaryErrorColor'
  ])

  const [deleteVuln, { loading: deleteLoading }] = useMutation(CustomVulnDelete)
  const { nodes, paginationProps, loading } = usePaginatedQuery(
    GetCustomVulns,
    {
      skip: tab === 'customVulnerabilities' && editVulns ? false : true,
      selector: 'organization.customVulns'
    }
  )

  const handleWarning = (row) => {
    setActiveRow(row)
    DELETE.onOpen()
  }

  const handleRemove = (id) => {
    deleteVuln({ variables: { id: id } }).then((res) => {
      if (res?.data?.customVulnDelete?.errors?.length > 0) {
        showToast({
          description: res?.data?.customVulnDelete?.errors[0],
          status: 'error'
        })
      } else {
        showToast({
          description: 'Vulnerability removed successfully',
          status: 'success'
        })
        DELETE.onClose()
      }
    })
  }

  const SubHeader = useMemo(() => {
    return (
      <Flex gap={2} alignItems={'center'} justifyContent={'flex-end'}>
        {!isFreeTier && (
          <Tooltip label={'Add Custom Vulnerability'}>
            <IconButton
              onClick={EDIT.onOpen}
              icon={<FaPlus />}
              colorScheme='blue'
              isDisabled={!editVulns}
            />
          </Tooltip>
        )}
        <RefreshBtn />
      </Flex>
    )
  }, [editVulns, isFreeTier, EDIT.onOpen])

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
            <Text fontSize='sm' color={primaryTextColor}>
              {vulnIdentifier || ''}
            </Text>
            {desc && (
              <Text fontSize='sm' color={secondaryTextColor}>
                {truncatedValue(desc, 100)}
              </Text>
            )}
          </Stack>
        )
      },
      width: '35%',
      sortable: true
    },
    // SEVERITY
    {
      id: 'VULNS_SEV',
      name: 'SEVERITY',
      selector: (row) => <SeverityTag value={row?.sev} />,
      sortable: true,
      width: '12%',
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
    },
    // ACTION
    {
      id: 'ACTION',
      name: 'ACTION',
      selector: (row) => {
        return (
          <Menu>
            <LynkAction aria-label='Options' data-testid='customVuln-actions' />
            <Portal>
              <MenuList fontSize='sm'>
                <MenuItem
                  hidden={isFreeTier}
                  isDisabled={!editVulns}
                  color={primaryErrorColor}
                  onClick={() => handleWarning(row)}
                >
                  Delete
                </MenuItem>
              </MenuList>
            </Portal>
          </Menu>
        )
      },
      right: 'true',
      omit: true // isFreeTier
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

      {/* EDIT CUSTOM VULNS */}
      {EDIT.isOpen && (
        <CustomVuln isOpen={EDIT.isOpen} onClose={EDIT.onClose} />
      )}

      {/* DELETE CUSTOM VULN */}
      {DELETE.isOpen && (
        <ConfirmationModal
          name={activeRow?.name}
          isOpen={DELETE?.isOpen}
          onClose={DELETE?.onClose}
          isLoading={deleteLoading}
          title={'Remove Vulnerability'}
          onConfirm={() => handleRemove(activeRow?.id)}
          description={`You are about to delete the custom vulnerability`}
        />
      )}
    </>
  )
}

export default CustomVulnTable
