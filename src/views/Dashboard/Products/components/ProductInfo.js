import { addDays, differenceInDays, parseISO } from 'date-fns'
import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import {
  getSignedUrlParams,
  getUndefinedIfEmptyOrAll,
  truncatedValue
} from 'utils'

import { Flex, Icon, IconButton, Stack, Text, Tooltip } from '@chakra-ui/react'

import ExpandableText from 'components/ExpandableText'
import { SettingsTag } from 'components/Misc/SettingsTag'

import useFetchAllNodes from 'hooks/useFetchAllNodes'
import { useGlobalQueryContext } from 'hooks/useGlobalQueryContext'
import { useGlobalState } from 'hooks/useGlobalState'
import { useThemeColor } from 'hooks/useThemeColors'

import { GetVersionsDate } from 'graphQL/Queries'

import {
  LuActivity,
  LuArchive,
  LuBot,
  LuBox,
  LuBug,
  LuOctagonAlert,
  LuSearch,
  LuTag
} from 'react-icons/lu'

const ProductInfo = ({ settings = {}, data = {} }) => {
  const params = useParams()
  const { versionState, dispatch } = useGlobalState()
  const signedUrlParams = getSignedUrlParams()
  const { isFreeTier } = useGlobalQueryContext()
  const { secondaryBlueText } = useThemeColor(['secondaryBlueText'])
  const { field, direction, searchInput, lifestage } = versionState
  const { versionDispatch } = dispatch
  const { name = '', description = '' } = data

  const {
    checksEnabled = false,
    enableAutoArchive = false,
    dataRetentionDays = 0,
    enableSupportLevel = false,
    vulnScanningEnabled = false,
    internalCompMatchingEnabled = false,
    automatedFixesEnabled = false
  } = settings

  const variables = useMemo(
    () => ({
      id: params?.productid,
      field,
      direction,
      lifestage: getUndefinedIfEmptyOrAll(lifestage),
      search: searchInput || undefined
    }),
    [params?.productid, field, direction, lifestage, searchInput]
  )

  const { data: versionDates } = useFetchAllNodes({
    query: GetVersionsDate,
    variables,
    selector: 'project.sbomVersions',
    skip: signedUrlParams
  })

  const exceedingCount = useMemo(() => {
    if (!versionDates || !dataRetentionDays) return 0
    const now = new Date()
    const retention = Math.floor(dataRetentionDays)
    return versionDates.filter((item) => {
      const createdDate = parseISO(item?.createdAt)
      const expirationDate = addDays(createdDate, retention)
      const daysLeft = differenceInDays(expirationDate, now)
      return daysLeft <= 7 && daysLeft >= 0 && retention !== 0
    }).length
  }, [versionDates, dataRetentionDays])

  const handleSort = (column, sortDirection) => {
    versionDispatch({
      type: 'SET_SORT_ORDER',
      payload: {
        field: column?.id,
        direction: sortDirection === 'asc' ? 'ASC' : 'DESC'
      }
    })
  }

  return (
    <Flex direction={'row'} alignItems={'flex-start'} gap={5} width={'100%'}>
      <Icon h={'64px'} w={'64px'} as={LuBox} color={secondaryBlueText} />
      <Flex gap={1} direction={'column'} alignItems={'flex-start'}>
        {/* PRODUCT TITLE */}
        <Tooltip label={name}>
          <Text
            wordBreak={'break-all'}
            fontWeight={'semibold'}
            sx={{ fontSize: 22, lineHeight: 1.2 }}
          >
            {truncatedValue(name, 50)}
          </Text>
        </Tooltip>
        {/* PRODUCT DESCRIPTION */}
        <ExpandableText text={description || ''} fontSize={'sm'} />
        {/* SETTINGS */}
        <Stack mt={description ? 1 : 0} direction='row' alignItems={'center'}>
          <SettingsTag
            icon={<LuSearch size={14} />}
            isDisabled={!checksEnabled}
            label={`Checks ${checksEnabled ? 'Enabled' : 'Disabled'}`}
          />
          <SettingsTag
            icon={<LuTag size={14} />}
            isDisabled={!internalCompMatchingEnabled}
            label={`Internal Labeling ${internalCompMatchingEnabled ? 'Enabled' : 'Disabled'}`}
          />
          <SettingsTag
            icon={<LuArchive size={14} />}
            isDisabled={!enableAutoArchive}
            label={`Auto Archive ${enableAutoArchive ? 'Enabled' : 'Disabled'}`}
          />
          <SettingsTag
            icon={<LuBot size={14} />}
            isDisabled={!automatedFixesEnabled}
            label={`Automation ${automatedFixesEnabled ? 'Enabled' : 'Disabled'}`}
          />
          <SettingsTag
            icon={<LuBug size={14} />}
            isDisabled={!vulnScanningEnabled}
            label={`Vulnerability Scan ${vulnScanningEnabled ? 'Enabled' : 'Disabled'}`}
          />
          <SettingsTag
            hidden={isFreeTier}
            icon={<LuActivity size={14} />}
            isDisabled={!enableSupportLevel}
            label={`Component Support Analysis ${enableSupportLevel ? 'Enabled' : 'Disabled'}`}
          />
          {exceedingCount > 0 && (
            <Tooltip
              label={`${exceedingCount} SBOM${exceedingCount > 1 ? 's are' : ' is'} marked for deletion in the next 7 days. This is based on the data retention under Settings tab.`}
            >
              <IconButton
                size='xs'
                colorScheme='red'
                icon={<LuOctagonAlert size={14} />}
                onClick={() => handleSort({ id: 'SBOMS_CREATED_AT' }, 'desc')}
              />
            </Tooltip>
          )}
        </Stack>
      </Flex>
    </Flex>
  )
}

export default ProductInfo
