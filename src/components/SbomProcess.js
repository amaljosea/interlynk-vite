import { useQuery } from '@apollo/client'
import { useParams } from 'react-router-dom'

import { DownloadIcon, Search2Icon } from '@chakra-ui/icons'
import { Divider, Flex } from '@chakra-ui/react'

import { useGlobalQueryContext } from 'hooks/useGlobalQueryContext'
import { useThemeColor } from 'hooks/useThemeColors'

import { GetProjectSettings } from 'graphQL/Queries'

import { FaArchive, FaBug, FaRobot } from 'react-icons/fa'
import { FaCircleCheck, FaTag } from 'react-icons/fa6'
import { TbActivity } from 'react-icons/tb'

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
        icon={<DownloadIcon />}
        rounded
      />
      <Divider width={3} borderColor={sameSecondaryText} />
      <SettingsTag
        label={`Checks ${checksEnabled ? 'Completed' : 'Skipped'}`}
        icon={<Search2Icon />}
        isDisabled={!checksEnabled}
        rounded
      />
      <Divider width={3} borderColor={sameSecondaryText} />
      <SettingsTag
        label={`Internal Labeling ${internalComp ? 'Completed' : 'Skipped'}`}
        icon={<FaTag />}
        isDisabled={!internalComp}
        rounded
      />
      <Divider width={3} borderColor={sameSecondaryText} />
      <SettingsTag
        label={`Auto Archive ${!enableAutoArchive ? 'Disabled' : hasFinished ? 'Completed' : 'Skipped'}`}
        icon={<FaArchive />}
        isDisabled={!enableAutoArchive}
        rounded
      />
      <Divider width={3} borderColor={sameSecondaryText} />
      <SettingsTag
        label={`Automation ${automatedFixesEnabled ? 'Completed' : 'Skipped'}`}
        icon={<FaRobot />}
        isDisabled={!automatedFixesEnabled}
        rounded
      />
      <Divider width={3} borderColor={sameSecondaryText} />
      <SettingsTag
        label={`Vulnerability Scan ${!vulnScan ? 'Disabled' : hasFinished ? 'Completed' : 'Pending'}`}
        icon={<FaBug />}
        isDisabled={!hasFinished || !vulnScan}
        rounded
      />
      <Divider width={3} hidden={isFreeTier} borderColor={sameSecondaryText} />
      <SettingsTag
        rounded
        hidden={isFreeTier}
        label={`Component Support Analysis ${!enableSupportLevel ? 'Disabled' : hasFinished ? 'Completed' : 'Skipped'}`}
        icon={<TbActivity />}
        isDisabled={!enableSupportLevel}
      />
      <Divider width={3} borderColor={sameSecondaryText} />
      <SettingsTag
        label={`SBOM ${!isSbomPending ? 'Ready' : 'not ready'}`}
        icon={<FaCircleCheck />}
        isDisabled={isSbomPending}
        rounded
      />
    </Flex>
  )
}

export default SbomProcess
