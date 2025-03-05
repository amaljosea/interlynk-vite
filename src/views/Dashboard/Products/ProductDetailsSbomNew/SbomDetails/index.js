import { useQuery } from '@apollo/client'
import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import { getFullDate, timeSince, truncatedValue } from 'utils'
import { getSignedUrlParams } from 'utils'
import SbomActions from 'views/Sbom/components/SbomActions'

import { DownloadIcon, Search2Icon } from '@chakra-ui/icons'
import { Divider, Flex, Text, Tooltip } from '@chakra-ui/react'
import { Tag, TagLabel } from '@chakra-ui/react'
import { Icon } from '@chakra-ui/react'
import { Grid, GridItem } from '@chakra-ui/react'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from '@chakra-ui/react'
import { useDisclosure } from '@chakra-ui/react'

import Card from 'components/Card/Card'
import CardBody from 'components/Card/CardBody'
import ActiveBtn from 'components/Misc/ActiveBtn'
import { SettingsTag } from 'components/Misc/SettingsTag'
import { ProgressBar } from 'components/ProgressBar'

import { useGlobalQueryContext } from 'hooks/useGlobalQueryContext'
import { useGlobalState } from 'hooks/useGlobalState'
import { usePartsContext } from 'hooks/usePartsContext'
import { useProjectGroup } from 'hooks/useProjectGroup'
import { useSbomScores } from 'hooks/useSbomScores'
import { useShouldShowDemoFeatures } from 'hooks/useShouldShowDemoFeatures'
import { useThemeColor } from 'hooks/useThemeColors'

import { GetProjectSettings } from 'graphQL/Queries'

import {
  FaArchive,
  FaBug,
  FaCubes,
  FaLongArrowAltRight,
  FaRobot
} from 'react-icons/fa'
import { FaCircleCheck, FaTag } from 'react-icons/fa6'
import { TbActivity } from 'react-icons/tb'

import LifecycleModal from '../../components/LifecycleModal'

const SbomDetails = ({ sbomData }) => {
  const params = useParams()
  const navigate = useNavigate()
  const partsContext = usePartsContext()
  const { sbomHookData, isFreeTier } = useGlobalQueryContext()
  const projectId = params.productid
  const sbomId = params.sbomid

  const { shouldShowDemoFeatures } = useShouldShowDemoFeatures()

  const {
    projectVersion,
    primaryComponent,
    vulnRunStatus,
    updatedAt,
    lifecycle,
    healthScore
  } = sbomData || ''
  const { name, version, description } = primaryComponent || ''

  const lifecycleData = {
    stage: sbomData?.productLifeCycleStage,
    releaseDate: sbomData?.releaseDate,
    endOfLifeDate: sbomData?.endOfLifeDate,
    endOfSupportDate: sbomData?.endOfSupportDate
  }

  const isArchived = sbomData?.lifecycle === 'archived'
  const { isOpen, onOpen, onClose } = useDisclosure()

  const signedUrlParams = getSignedUrlParams()

  const { data: settings } = useQuery(GetProjectSettings, {
    variables: { id: projectId }
  })

  const { projectSetting } = settings?.project || ''
  const {
    checksEnabled,
    enableAutoArchive,
    vulnScanningEnabled: vulnScan,
    internalCompMatchingEnabled: internalComp,
    automatedFixesEnabled,
    enableSupportLevel
  } = projectSetting || ''
  const hasFinished = vulnRunStatus === 'FINISHED'

  const handlePart = () => {
    partsContext.pop()
  }

  const { organization } = useGlobalState()
  const { activeCompliances } = organization || ''

  const result = activeCompliances?.find((item) => item?.scoreEnabled)

  const isUnspecified =
    result === undefined || result?.complianceType === 'unspecified'

  const { qualityScore, loading: scoreLoading } = useSbomScores({
    sbomId,
    projectId: projectId,
    skip: !shouldShowDemoFeatures,
    format: isUnspecified ? undefined : result?.complianceType?.toUpperCase()
  })

  const {
    primaryBlueText,
    sameSecondaryText,
    secondaryBlueText,
    secondaryTextInverse
  } = useThemeColor([
    'primaryBlueText',
    'sameSecondaryText',
    'secondaryBlueText',
    'secondaryTextInverse'
  ])

  const { name: projectGroupName, loading } = useProjectGroup({
    projectGroupId: params.productgroupid
  })

  useEffect(() => {
    window.onpopstate = () => {
      console.log(`Pressed back button`)
      handlePart()
    }
  })

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
    <>
      <Flex direction={'row'} alignItems={'flex-start'} gap={5} width={'100%'}>
        <Icon
          as={FaCubes}
          sx={{ w: '64px', h: '64px', color: secondaryBlueText }}
        />
        <Flex width={'100%'} flexDir={'column'} gap={5}>
          <Grid
            gap={10}
            alignItems={'flex-start'}
            justifyContent={'space-between'}
            templateColumns='repeat(12, 1fr)'
          >
            <GridItem colSpan={8}>
              <Breadcrumb
                fontSize={'sm'}
                separator={<FaLongArrowAltRight color={secondaryTextInverse} />}
              >
                {!loading &&
                  partsContext.isParts &&
                  [
                    ...partsContext.parts,
                    {
                      projectGroupName: projectGroupName,
                      versionName: sbomHookData.versionName,
                      url: null
                    }
                  ].map((part, index) => {
                    return (
                      <BreadcrumbItem
                        isCurrentPage={!!part.url}
                        key={part.url}
                        color={primaryBlueText}
                      >
                        <BreadcrumbLink
                          onClick={() => {
                            if (part.url) {
                              partsContext.goTo(index)
                              navigate(part.url)
                            }
                          }}
                          _hover={{ textDecoration: 'none' }}
                        >
                          {truncatedValue(part.projectGroupName)} (
                          {truncatedValue(part.versionName)})
                        </BreadcrumbLink>
                      </BreadcrumbItem>
                    )
                  })}
              </Breadcrumb>
              <Flex
                alignItems={'center'}
                sx={{ gap: 1, fontWeight: 'semibold', flexWrap: 'wrap' }}
              >
                {name && (
                  <Text fontSize={22} wordBreak={'break-all'}>
                    {truncatedValue(name, 40)}
                  </Text>
                )}
                {version && <Text fontSize={22}>:</Text>}
                <Text mr={2} fontSize={22} wordBreak={'breal-all'}>
                  {truncatedValue(projectVersion, 40)}
                </Text>
                <Tooltip label='Lifecycle stage' fontSize='md'>
                  <Tag
                    hidden={!lifecycleData?.stage}
                    size={'sm'}
                    variant='solid'
                    colorScheme='blue'
                    w={'fit-content'}
                    cursor={'pointer'}
                  >
                    <TagLabel textTransform={'capitalize'}>
                      {lifecycleData?.stage
                        ? String(lifecycleData?.stage).replace(/_/g, ' ')
                        : ''}
                    </TagLabel>
                  </Tag>
                </Tooltip>
                <Flex paddingTop={1}>
                  <ActiveBtn
                    onClick={onOpen}
                    hidden={isArchived}
                    label={'add_lifecycle'}
                    editable={lifecycleData?.stage ? true : false}
                    title={lifecycleData?.stage ? 'Update' : 'Add Lifecycle'}
                    color={
                      lifecycleData?.stage ? sameSecondaryText : primaryBlueText
                    }
                  />
                </Flex>
              </Flex>
              <Text
                wordBreak={'break-all'}
                hidden={description === ''}
                sx={{ w: '90%', mb: 1, mr: 'auto', fontSize: 'sm' }}
              >
                {description}
              </Text>
            </GridItem>
            <GridItem colSpan={4} hidden={lifecycle === 'archived'}>
              <SbomActions sbom={sbomData} />
            </GridItem>
          </Grid>
          {/* STATS */}
          <Grid
            gap={4}
            alignItems={'flex-end'}
            templateColumns='repeat(12, 1fr)'
          >
            <GridItem colSpan={isFreeTier ? 6 : 4}>
              <Card px={0} shadow='none' py={0}>
                <CardBody px={0} flexDir='column' gap={1}>
                  {/* UPDATED AT */}
                  <Tooltip placement='top' label={getFullDate(updatedAt)}>
                    <Text
                      fontSize='sm'
                      cursor={'pointer'}
                      width={'fit-content'}
                    >
                      Updated {timeSince(updatedAt)}
                    </Text>
                  </Tooltip>
                  <Flex
                    gap={1}
                    mt={0.5}
                    flexDir='row'
                    alignItems={'center'}
                    hidden={signedUrlParams}
                  >
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
                    <Divider
                      width={3}
                      hidden={isFreeTier}
                      borderColor={sameSecondaryText}
                    />
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
                </CardBody>
              </Card>
            </GridItem>
            {!isFreeTier && (
              <GridItem colSpan={isUnspecified ? 8 : 4}>
                <ProgressBar
                  value={healthScore}
                  loading={scoreLoading}
                  text='Version Health Score'
                />
              </GridItem>
            )}
            {!isUnspecified && (
              <GridItem colSpan={isFreeTier ? 6 : 4}>
                <ProgressBar
                  value={qualityScore}
                  loading={scoreLoading}
                  text={`SBOM Quality Score ${`(${result?.complianceType?.toUpperCase()})`}`}
                />
              </GridItem>
            )}
          </Grid>
          {isOpen && (
            <LifecycleModal
              data={lifecycleData}
              isOpen={isOpen}
              onClose={onClose}
            />
          )}
        </Flex>
      </Flex>
    </>
  )
}

export default SbomDetails
