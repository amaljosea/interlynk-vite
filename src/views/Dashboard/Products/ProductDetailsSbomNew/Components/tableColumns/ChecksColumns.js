import { useMemo } from 'react'
import { getFullDateAndTime, timeSince } from 'utils'

import { CheckIcon } from '@chakra-ui/icons'
import { Box, Button, IconButton, Stack, Text, Tooltip } from '@chakra-ui/react'

import SeverityTag from 'components/Misc/SeverityTag'
import RowComponent from 'components/RowComponent'

import { useThemeColor } from 'hooks/useThemeColors'

import { BiSolidWrench } from 'react-icons/bi'
import { GoSkip } from 'react-icons/go'

const ChecksColumns = (
  setActiveRow,
  updateComp,
  editChecks,
  onCheckOpen,
  customerView,
  isArchived,
  activeRow,
  loadingRules,
  FIXED,
  updateIssue
) => {
  const { primaryTextColor } = useThemeColor([
    'headingTextColor',
    'primaryTextColor'
  ])
  return useMemo(() => {
    const columns = [
      // HEALTH CHECK ID
      {
        id: 'RULES_FRIENDLY_ID',
        name: 'CHECK ID',
        selector: (row) => {
          const { organizationRule } = row
          return (
            <Text color={primaryTextColor}>
              {organizationRule.rule.friendlyId}
            </Text>
          )
        },
        sortable: true,
        width: '10%'
      },
      // SEVERITY
      {
        id: 'ORGANIZATION_RULES_SEVERITY',
        name: 'SEVERITY',
        selector: (row) => (
          <SeverityTag value={row?.organizationRule?.severity} />
        ),
        width: '10%',
        sortable: true
      },
      // LONG DESCRIPTION
      {
        id: 'COMPONENTS_NAME',
        name: 'DESCRIPTION',
        selector: (row) => {
          const { organizationRule, component } = row
          return (
            <Stack spacing={2} my={3}>
              {component !== null && (
                <Box
                  width={'fit-content'}
                  onClick={() => setActiveRow(component)}
                >
                  <RowComponent content={component} />
                </Box>
              )}
              <Text color={primaryTextColor}>
                {organizationRule.rule.longDesc !== null
                  ? `${organizationRule.rule.shortDesc?.substring(0, 300)}${
                      organizationRule.rule.shortDesc.length > 300 ? '...' : ''
                    }`
                  : ''}
              </Text>
            </Stack>
          )
        },
        sortable: true,
        wrap: true
      },
      // UPDATED AT
      {
        id: 'CHECK_RESULTS_UPDATED_AT',
        name: 'UPDATED',
        selector: (row) => (
          <Tooltip label={getFullDateAndTime(row.updatedAt)} placement={'top'}>
            <Text color={primaryTextColor}>{timeSince(row.updatedAt)}</Text>
          </Tooltip>
        ),
        sortable: true,
        sortFunction: (a, b) => {
          const dateA = new Date(a.updatedAt)
          const dateB = new Date(b.updatedAt)
          return dateA - dateB // Sort in descending order
        },
        right: 'true'
      },
      // ACTION
      {
        id: 'RESOLUTION',
        name: 'RESOLUTION',
        selector: (row) => {
          const { status, id, componentId } = row
          const { friendlyId } = row?.organizationRule?.rule || ''
          const fixedIDs = ['SB-HC-4', 'SB-HC-5', 'SB-HC-6', 'SB-HC-16']
          const fixedByDefault = fixedIDs.includes(friendlyId)
          const isPrimary = friendlyId === 'SB-HC-10'
          const isEditable = componentId ? updateComp : editChecks
          return (
            <>
              {status === 'unresolved' && !fixedByDefault && (
                <Stack direction={'row'} alignItems={'center'} spacing={2}>
                  <Tooltip label='Fix'>
                    <IconButton
                      size='sm'
                      variant='solid'
                      colorScheme='blue'
                      fontWeight='normal'
                      icon={<BiSolidWrench size={18} />}
                      onClick={() => onCheckOpen(row)}
                      disabled={customerView || !isEditable || isArchived}
                    />
                  </Tooltip>

                  <Tooltip label='Ignore'>
                    <IconButton
                      size='sm'
                      variant='solid'
                      colorScheme='blue'
                      fontWeight='normal'
                      icon={<GoSkip size={18} />}
                      onClick={() => updateIssue(id)}
                      disabled={customerView || !editChecks || isArchived}
                    />
                  </Tooltip>
                </Stack>
              )}

              {fixedByDefault && (
                <Button
                  size='sm'
                  variant='solid'
                  fontSize={'xs'}
                  fontWeight='normal'
                  colorScheme='whatsapp'
                  leftIcon={<CheckIcon />}
                  onClick={() => (isPrimary ? null : FIXED.onOpen())}
                  disabled={customerView || !editChecks || isArchived}
                >
                  {isPrimary ? 'Fixed' : 'View'}
                </Button>
              )}

              {!fixedByDefault && status === 'resolved' && (
                <Button
                  size='sm'
                  fontSize={'xs'}
                  variant='solid'
                  colorScheme='whatsapp'
                  isDisabled={isArchived}
                  leftIcon={<CheckIcon />}
                  onClick={() => (isPrimary ? null : onCheckOpen(row))}
                  isLoading={activeRow?.id === id && loadingRules}
                >
                  {isPrimary ? 'Fixed' : 'View'}
                </Button>
              )}

              {status === 'ignored' && (
                <Button
                  size='sm'
                  width={'74px'}
                  fontSize={'xs'}
                  variant='solid'
                >
                  Ignored
                </Button>
              )}
            </>
          )
        },
        width: '12%',
        right: 'true'
      }
    ]
    return columns
  }, [
    setActiveRow,
    updateComp,
    editChecks,
    onCheckOpen,
    customerView,
    isArchived,
    activeRow,
    loadingRules,
    FIXED,
    updateIssue,
    primaryTextColor
  ])
}

export default ChecksColumns
