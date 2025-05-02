import { useQuery } from '@apollo/client'
import { useParams } from 'react-router-dom'

import { Divider, Flex } from '@chakra-ui/react'

import { useGlobalQueryContext } from 'hooks/useGlobalQueryContext'
import { useThemeColor } from 'hooks/useThemeColors'

import { GetProjectSettings } from 'graphQL/Queries'

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

const SbomProcess = ({ hasFinished }) => {
  const params = useParams()
  const { isFreeTier } = useGlobalQueryContext()
  const { sameSecondaryText } = useThemeColor(['sameSecondaryText'])

  const { data: settings } = useQuery(GetProjectSettings, {
    variables: { id: params?.productid }
  })

  const { projectSetting } = settings?.project || ''
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
        rounded
      />
      <Divider width={3} borderColor={sameSecondaryText} />
      <SettingsTag
        label={`Checks ${checksEnabled ? 'Completed' : 'Skipped'}`}
        icon={<LuSearch size={14} />}
        isDisabled={!checksEnabled}
        rounded
      />
      <Divider width={3} borderColor={sameSecondaryText} />
      <SettingsTag
        label={`Internal Labeling ${internalComp ? 'Completed' : 'Skipped'}`}
        icon={<LuTag size={14} />}
        isDisabled={!internalComp}
        rounded
      />
      <Divider width={3} borderColor={sameSecondaryText} />
      <SettingsTag
        label={`Auto Archive ${!enableAutoArchive ? 'Disabled' : hasFinished ? 'Completed' : 'Skipped'}`}
        icon={<LuArchive size={14} />}
        isDisabled={!enableAutoArchive}
        rounded
      />
      <Divider width={3} borderColor={sameSecondaryText} />
      <SettingsTag
        label={`Automation ${automatedFixesEnabled ? 'Completed' : 'Skipped'}`}
        icon={<LuBot size={14} />}
        isDisabled={!automatedFixesEnabled}
        rounded
      />
      <Divider width={3} borderColor={sameSecondaryText} />
      <SettingsTag
        label={`Vulnerability Scan ${!vulnScan ? 'Disabled' : hasFinished ? 'Completed' : 'Pending'}`}
        icon={<LuBug size={14} />}
        isDisabled={!hasFinished || !vulnScan}
        rounded
      />
      <Divider width={3} hidden={isFreeTier} borderColor={sameSecondaryText} />
      <SettingsTag
        rounded
        hidden={isFreeTier}
        label={`Component Support Analysis ${!enableSupportLevel ? 'Disabled' : hasFinished ? 'Completed' : 'Skipped'}`}
        icon={<LuActivity size={14} />}
        isDisabled={!enableSupportLevel}
      />
      <Divider width={3} borderColor={sameSecondaryText} />
      <SettingsTag
        label={`SBOM ${!isSbomPending ? 'Ready' : 'not ready'}`}
        icon={<LuCheck size={14} />}
        isDisabled={isSbomPending}
        rounded
      />
    </Flex>
  )
}

export default SbomProcess
