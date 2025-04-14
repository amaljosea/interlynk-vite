import { addDays, differenceInDays, parseISO } from 'date-fns'
import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  getSignedUrlParams,
  getUndefinedIfEmptyOrAll,
  truncatedValue
} from 'utils'

import { Search2Icon } from '@chakra-ui/icons'
import { Flex, Icon, IconButton, Stack, Text, Tooltip } from '@chakra-ui/react'

import { SettingsTag } from 'components/Misc/SettingsTag'

import useFetchAllNodes from 'hooks/useFetchAllNodes'
import { useGlobalQueryContext } from 'hooks/useGlobalQueryContext'
import { useGlobalState } from 'hooks/useGlobalState'
import { useThemeColor } from 'hooks/useThemeColors'

import { GetVersionsDate } from 'graphQL/Queries'

import { FaArchive } from 'react-icons/fa'
import { FaBug, FaRobot, FaTag, FaWindowMaximize } from 'react-icons/fa6'
import { IoMdWarning } from 'react-icons/io'
import { TbActivity } from 'react-icons/tb'

const ProductInfo = ({ settings, data }) => {
  const params = useParams()
  const { versionState, dispatch } = useGlobalState()
  const signedUrlParams = getSignedUrlParams()
  const { isFreeTier } = useGlobalQueryContext()

  const { field, direction, searchInput, lifestage } = versionState
  const { versionDispatch } = dispatch

  const { name, description } = data || ''

  const { primaryErrorColor, secondaryBlueText } = useThemeColor([
    'primaryErrorColor',
    'secondaryBlueText'
  ])

  const [warning, setWarning] = useState(false)
  const [exceedingCount, setExceedingCount] = useState(0)

  const {
    checksEnabled,
    enableAutoArchive,
    dataRetentionDays,
    enableSupportLevel,
    vulnScanningEnabled,
    internalCompMatchingEnabled,
    automatedFixesEnabled
  } = settings || ''

  const variables = useMemo(
    () => ({
      id: params?.productid,
      field: field,
      direction: direction,
      lifestage: getUndefinedIfEmptyOrAll(lifestage),
      search: searchInput === '' ? undefined : searchInput
    }),
    [direction, field, lifestage, params?.productid, searchInput]
  )

  const { data: versionDates } = useFetchAllNodes({
    query: GetVersionsDate,
    variables,
    selector: 'project.sbomVersions',
    skip: signedUrlParams
  })

  const handleSort = (column, sortDirection) => {
    versionDispatch({
      type: 'SET_SORT_ORDER',
      payload: {
        field: column?.id,
        direction: sortDirection === 'asc' ? 'ASC' : 'DESC'
      }
    })
  }

  useEffect(() => {
    if (versionDates && dataRetentionDays) {
      const currentDate = new Date()
      const retentionTimeInt = Math.floor(dataRetentionDays)
      const exceedingItems = versionDates?.filter((item) => {
        const createdDate = parseISO(item?.createdAt)
        const expirationDate = addDays(createdDate, retentionTimeInt)
        const daysUntilDeletion = differenceInDays(expirationDate, currentDate)
        return (
          daysUntilDeletion <= 7 &&
          daysUntilDeletion >= 0 &&
          retentionTimeInt !== 0
        )
      })
      setExceedingCount(exceedingItems?.length)
      setWarning(exceedingItems?.length > 0)
    } else {
      setWarning(false)
    }
  }, [dataRetentionDays, versionDates])

  return (
    <Flex direction={'row'} alignItems={'flex-start'} gap={5} width={'100%'}>
      <Icon
        h={'64px'}
        w={'64px'}
        as={FaWindowMaximize}
        color={secondaryBlueText}
      />
      <Flex gap={1} direction={'column'} alignItems={'flex-start'}>
        {/* PRODUCT TITLE */}
        <Text fontWeight={'semibold'} fontSize={22} lineHeight={1.2}>
          <Tooltip label={name}>{truncatedValue(name, 50)}</Tooltip>
        </Text>
        {/* PRODUCT DESCRIPTION */}
        <Text fontSize={'sm'} wordBreak={'break-all'}>
          {description || ''}
        </Text>
        {/* SETTINGS */}
        <Stack mt={description ? 1 : 0} direction='row' alignItems={'center'}>
          <SettingsTag
            icon={<Search2Icon />}
            isDisabled={!checksEnabled}
            label={`Checks ${checksEnabled ? 'Enabled' : 'Disabled'}`}
          />
          <SettingsTag
            icon={<FaTag />}
            isDisabled={!internalCompMatchingEnabled}
            label={`Internal Labeling ${internalCompMatchingEnabled ? 'Enabled' : 'Disabled'}`}
          />
          <SettingsTag
            icon={<FaArchive />}
            isDisabled={!enableAutoArchive}
            label={`Auto Archive ${enableAutoArchive ? 'Enabled' : 'Disabled'}`}
          />
          <SettingsTag
            icon={<FaRobot />}
            isDisabled={!automatedFixesEnabled}
            label={`Automation ${automatedFixesEnabled ? 'Enabled' : 'Disabled'}`}
          />
          <SettingsTag
            icon={<FaBug />}
            isDisabled={!vulnScanningEnabled}
            label={`Vulnerability Scan ${vulnScanningEnabled ? 'Enabled' : 'Disabled'}`}
          />
          <SettingsTag
            hidden={isFreeTier}
            icon={<TbActivity />}
            isDisabled={!enableSupportLevel}
            label={`Component Support Analysis ${enableSupportLevel ? 'Enabled' : 'Disabled'}`}
          />
          {warning && (
            <Tooltip
              label={`${exceedingCount} SBOM${exceedingCount > 1 ? 's are' : ' is'} marked for deletion in the next 7 days. This is based on the data retention under Settings tab.`}
            >
              <IconButton
                size='xs'
                color={primaryErrorColor}
                icon={<IoMdWarning size={16} />}
                onClick={() => handleSort({ id: 'SBOMS_CREATED_AT' }, 'desc')}
                bg='transparent'
              />
            </Tooltip>
          )}
        </Stack>
      </Flex>
    </Flex>
  )
}

export default ProductInfo
