import { useLazyQuery, useMutation } from '@apollo/client'
import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { getFullDate, timeSince } from 'utils'

import { CheckIcon } from '@chakra-ui/icons'
import { Box, Button, IconButton, Stack, Text, Tooltip } from '@chakra-ui/react'

import SeverityTag from 'components/Misc/SeverityTag'
import RowComponent from 'components/RowComponent'

import useCustomToast from 'hooks/useCustomToast'
import { useHasPermission } from 'hooks/useHasPermission'
import { useRouteFlags } from 'hooks/useRouteFlags'
import { useThemeColor } from 'hooks/useThemeColors'

import { checkResultUpdate } from 'graphQL/Mutation'
import { recheckHealth } from 'graphQL/Mutation'
import { UpdateComponent } from 'graphQL/Mutation'
import { sbomUpdate } from 'graphQL/Mutation'
import { GetExistingRules } from 'graphQL/Queries'

import { GoSkip } from 'react-icons/go'
import { LuWrench } from 'react-icons/lu'

const ChecksColumns = (
  setActiveRow,
  isArchived,
  activeRow,
  FIXED,
  setRuleExists,
  handleOpen
) => {
  const { showToast } = useCustomToast()
  const params = useParams()
  const productId = params.productid
  const sbomId = params.sbomid

  const { isCustomerView } = useRouteFlags()

  const { primaryTextColor } = useThemeColor([
    'headingTextColor',
    'primaryTextColor'
  ])

  const editChecks = useHasPermission({
    parentKey: 'view_sbom',
    childKey: 'edit_checks'
  })

  const updateComp = useHasPermission({
    parentKey: 'view_sbom',
    childKey: 'update_sbom_components'
  })

  const [getRules, { loading: loadingRules }] = useLazyQuery(GetExistingRules)
  const [updateResult] = useMutation(checkResultUpdate)
  const [healthRecheck] = useMutation(recheckHealth)
  const [updateComponent] = useMutation(UpdateComponent)
  const [updateSbom] = useMutation(sbomUpdate)

  return useMemo(() => {
    const updateIssue = async (id, newStatus) => {
      await updateResult({
        variables: {
          id: id,
          status: newStatus
        }
      })
    }

    const handleComUpdate = async (row) => {
      await updateComponent({
        variables: {
          id: row.componentId,
          sbomId: sbomId,
          uniqueId: true
        }
      })
        .then((res) => {
          if (res.data) {
            healthRecheck({
              variables: {
                checkId: row.organizationRule.rule.friendlyId,
                compId: row.componentId,
                sbomId: sbomId
              }
            })
          }
        })
        .finally(() => {
          setTimeout(() => {
            showToast({
              description:
                'A unique identifier has been added to the component',
              status: 'success'
            })
          }, 1000)
        })
    }

    const handleSbomUpdate = async (row) => {
      await updateSbom({
        variables: {
          id: row.sbomId,
          spec: row.sbom.spec,
          generateUniqueId: true
        }
      })
        .then((res) => {
          if (res.data) {
            healthRecheck({
              variables: {
                checkId: row.organizationRule.rule.friendlyId,
                sbomId: sbomId
              }
            })
          }
        })
        .finally(() => {
          setTimeout(() => {
            showToast({
              description:
                'A unique identifier has been added to the component',
              status: 'success'
            })
          }, 1000)
        })
    }

    const onCheckOpen = (row) => {
      setActiveRow(row)
      const { component, organizationRule } = row
      const { name, version } = component || ''
      const { shortDesc, friendlyId } = organizationRule?.rule || ''
      if (shortDesc === 'Component has a unique identifier') {
        handleComUpdate(row)
      } else if (shortDesc === 'Document has a unique identifier') {
        handleSbomUpdate(row)
      } else {
        getRules({
          variables: {
            id: productId,
            checkIdentifier: friendlyId,
            checkComponent: component ? name : undefined,
            checkVersion: component ? version : undefined
          }
        })
          .then((res) => {
            const result = res?.data?.project?.automationRules?.nodes
            if (result?.length > 0) {
              setRuleExists(true)
            } else {
              setRuleExists(false)
            }
          })
          .finally(() => handleOpen(row))
      }
    }

    const columns = [
      // HEALTH CHECK ID
      {
        id: 'RULES_FRIENDLY_ID',
        name: 'CHECK ID',
        selector: (row) => {
          const { organizationRule } = row
          return (
            <Text fontSize={14} color={primaryTextColor}>
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
              <Text fontSize={14} color={primaryTextColor}>
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
          <Tooltip label={getFullDate(row.updatedAt)} placement={'top'}>
            <Text fontSize={14} color={primaryTextColor}>
              {timeSince(row.updatedAt)}
            </Text>
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
          const fixedIDs = [
            'SB-HC-4',
            'SB-HC-5',
            'SB-HC-6',
            'SB-HC-16',
            'SB-HC-11'
          ]
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
                      icon={<LuWrench size={18} />}
                      onClick={() => onCheckOpen(row)}
                      disabled={isCustomerView || !isEditable || isArchived}
                    />
                  </Tooltip>

                  <Tooltip label='Ignore'>
                    <IconButton
                      size='sm'
                      variant='solid'
                      colorScheme='blue'
                      fontWeight='normal'
                      icon={<GoSkip size={18} />}
                      onClick={() => updateIssue(id, 'ignored')}
                      disabled={isCustomerView || !editChecks || isArchived}
                    />
                  </Tooltip>
                </Stack>
              )}

              {fixedByDefault && (
                <Button
                  size='sm'
                  fontSize={'xs'}
                  colorScheme='green'
                  leftIcon={<CheckIcon />}
                  title={isPrimary ? 'Fixed' : 'View'}
                  onClick={() => (isPrimary ? null : FIXED.onOpen())}
                  disabled={isCustomerView || !editChecks || isArchived}
                >
                  {isPrimary ? 'Fixed' : 'View'}
                </Button>
              )}

              {!fixedByDefault && status === 'resolved' && (
                <Button
                  size='sm'
                  fontSize={'xs'}
                  colorScheme='green'
                  isDisabled={isArchived}
                  leftIcon={<CheckIcon />}
                  title={isPrimary ? 'Fixed' : 'View'}
                  onClick={() => (isPrimary ? null : onCheckOpen(row))}
                  isLoading={activeRow?.id === id && loadingRules}
                >
                  {isPrimary ? 'Fixed' : 'View'}
                </Button>
              )}

              {status === 'ignored' && (
                <Button
                  size='sm'
                  title='Unignore'
                  width={'74px'}
                  fontSize={'xs'}
                  variant='outline'
                  onClick={() => updateIssue(id, 'unresolved')}
                >
                  Unignore
                </Button>
              )}
            </>
          )
        },
        right: 'true'
      }
    ]
    return columns
  }, [
    setActiveRow,
    updateComp,
    editChecks,
    isCustomerView,
    isArchived,
    activeRow,
    loadingRules,
    FIXED,
    primaryTextColor,
    updateResult,
    getRules,
    healthRecheck,
    productId,
    sbomId,
    setRuleExists,
    showToast,
    updateComponent,
    updateSbom,
    handleOpen
  ])
}

export default ChecksColumns
