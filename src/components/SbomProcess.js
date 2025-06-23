import { useQuery } from '@apollo/client'
import { useParams } from 'react-router-dom'

import { Divider, Flex } from '@chakra-ui/react'

import { useGlobalQueryContext } from 'hooks/useGlobalQueryContext'
import { useThemeColor } from 'hooks/useThemeColors'

import { GetProjectSettingsForSbomProcess } from 'graphQL/Queries'

import {
  LuActivity,
  LuArchive,
  LuBot,
  LuBug,
  LuCheck,
  LuDownload,
  LuSearch,
  LuTag
} from 'react-icons/lu'

import { SettingsTag } from './Misc/SettingsTag'

const SbomProcess = ({ lifecycle, hasFinished }) => {
  const params = useParams()
  const { isFreeTier } = useGlobalQueryContext()
  const { sameSecondaryText } = useThemeColor(['sameSecondaryText'])

  const { data: settings } = useQuery(GetProjectSettingsForSbomProcess, {
    variables: { id: params?.productid }
  })

  const isInDraft = lifecycle === 'draft'

  const { projectSetting } = settings?.project || {}
  const {
    checksEnabled,
    enableAutoArchive,
    vulnScanningEnabled: vulnScan,
    internalCompMatchingEnabled: internalComp,
    automatedFixesEnabled,
    enableSupportLevel
  } = projectSetting || {}

  const isSbomPending =
    [
      checksEnabled,
      internalComp,
      automatedFixesEnabled,
      enableAutoArchive,
      vulnScan
    ].includes(undefined) ||
    (vulnScan && !hasFinished)

  return (
    <Flex gap={1} mt={0.5} alignItems={'center'}>
      <SettingsTag
        label={`Imported Successfully`}
        icon={<LuDownload size={14} />}
      />
      <Divider width={3} borderColor={sameSecondaryText} />
      <SettingsTag
        label={`Checks ${checksEnabled && !isInDraft ? 'Completed' : 'Skipped'}`}
        icon={<LuSearch size={14} />}
        isDisabled={!checksEnabled || isInDraft}
      />
      <Divider width={3} borderColor={sameSecondaryText} />
      <SettingsTag
        label={`Internal Labeling ${internalComp && !isInDraft ? 'Completed' : 'Skipped'}`}
        icon={<LuTag size={14} />}
        isDisabled={!internalComp || isInDraft}
      />
      <Divider width={3} borderColor={sameSecondaryText} />
      <SettingsTag
        label={`Auto Archive ${!enableAutoArchive ? 'Disabled' : hasFinished ? 'Completed' : 'Skipped'}`}
        icon={<LuArchive size={14} />}
        isDisabled={!enableAutoArchive || isInDraft}
      />
      <Divider width={3} borderColor={sameSecondaryText} />
      <SettingsTag
        label={`Automation ${automatedFixesEnabled && !isInDraft ? 'Completed' : 'Skipped'}`}
        icon={<LuBot size={14} />}
        isDisabled={!automatedFixesEnabled || isInDraft}
      />
      <Divider width={3} borderColor={sameSecondaryText} />
      <SettingsTag
        label={`Vulnerability Scan ${!vulnScan ? 'Disabled' : hasFinished ? 'Completed' : 'Pending'}`}
        icon={<LuBug size={14} />}
        isDisabled={!hasFinished || !vulnScan || isInDraft}
      />
      <Divider width={3} hidden={isFreeTier} borderColor={sameSecondaryText} />
      <SettingsTag
        hidden={isFreeTier}
        label={`Component Support Analysis ${!enableSupportLevel ? 'Disabled' : hasFinished ? 'Completed' : 'Skipped'}`}
        icon={<LuActivity size={14} />}
        isDisabled={!enableSupportLevel || isInDraft}
      />
      <Divider width={3} borderColor={sameSecondaryText} />
      <SettingsTag
        label={`SBOM ${!isSbomPending ? 'Ready' : 'not ready'}`}
        icon={<LuCheck size={14} />}
        isDisabled={isSbomPending || isInDraft}
      />
    </Flex>
  )
}

export default SbomProcess
