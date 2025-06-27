import { useMemo } from 'react'
import { getFullDate, timeSince, truncatedValue } from 'utils'

import {
  Menu,
  MenuItem,
  MenuList,
  Portal,
  Stack,
  Text,
  Tooltip
} from '@chakra-ui/react'

import LynkAction from 'components/Misc/LynkAction'
import SeverityTag from 'components/Misc/SeverityTag'

import { useGlobalQueryContext } from 'hooks/useGlobalQueryContext'
import { useHasPermission } from 'hooks/useHasPermission'
import { useThemeColor } from 'hooks/useThemeColors'

const CustomVulnColumns = ({ handleWarning }) => {
  const { isFreeTier } = useGlobalQueryContext()

  const editVulns = useHasPermission({
    parentKey: 'view_sbom',
    childKey: 'edit_vulnerabilities'
  })

  const { primaryErrorColor, primaryTextColor, secondaryTextColor } =
    useThemeColor([
      'primaryErrorColor',
      'primaryTextColor',
      'secondaryTextColor'
    ])

  return useMemo(() => {
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
              <LynkAction
                aria-label='Options'
                data-testid='customVuln-actions'
              />
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
        omit: true
      }
    ]

    return columns
  }, [
    editVulns,
    handleWarning,
    isFreeTier,
    primaryErrorColor,
    primaryTextColor,
    secondaryTextColor
  ])
}

export default CustomVulnColumns
