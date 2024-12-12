import { useQuery } from '@apollo/client'
import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import { getFullDateAndTime, timeSince, truncatedValue } from 'utils'
import { getSignedUrlParams } from 'utils'
import SbomActions from 'views/Sbom/components/SbomActions'

import { DownloadIcon, Search2Icon } from '@chakra-ui/icons'
import { Divider, Flex, Text, Tooltip } from '@chakra-ui/react'
import { Tag, TagLabel } from '@chakra-ui/react'
import { Icon } from '@chakra-ui/react'
import { Grid, GridItem } from '@chakra-ui/react'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from '@chakra-ui/react'

import Card from 'components/Card/Card'
import CardBody from 'components/Card/CardBody'
import { SettingsTag } from 'components/Misc/SettingsTag'
import { ProgressBar } from 'components/ProgressBar'

import { useGlobalQueryContext } from 'hooks/useGlobalQueryContext'
import { usePartsContext } from 'hooks/usePartsContext'
import { useProjectGroup } from 'hooks/useProjectGroup'
import { useSbomScores } from 'hooks/useSbomScores'
import { useShouldShowDemoFeatures } from 'hooks/useShouldShowDemoFeatures'
import { useThemeColor } from 'hooks/useThemeColors'

import { GetProjectSettings } from 'graphQL/Queries'

import { FaBug, FaCubes, FaLongArrowAltRight, FaRobot } from 'react-icons/fa'
import { FaCircleCheck, FaTag } from 'react-icons/fa6'

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

  const signedUrlParams = getSignedUrlParams()

  const { data: settings } = useQuery(GetProjectSettings, {
    variables: { id: projectId }
  })

  const { projectSetting } = settings?.project || ''
  const {
    checksEnabled,
    vulnScanningEnabled: vulnScan,
    internalCompMatchingEnabled: internalComp,
    automatedFixesEnabled
  } = projectSetting || ''
  const hasFinished = vulnRunStatus === 'FINISHED'

  const handlePart = () => {
    partsContext.pop()
  }

  const { qualityScore, loading: scoreLoading } = useSbomScores({
    sbomId,
    projectId: projectId,
    skip: !shouldShowDemoFeatures
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

  return (
    <>
      <Flex direction={'row'} alignItems={'flex-start'} gap={5} width={'100%'}>
        <Icon
          as={FaCubes}
          cursor={'pointer'}
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
                    size={'sm'}
                    variant='solid'
                    colorScheme='blue'
                    w={'fit-content'}
                  >
                    <TagLabel textTransform={'capitalize'}>
                      {lifecycle}
                    </TagLabel>
                  </Tag>
                </Tooltip>
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
                  <Tooltip
                    placement='top'
                    label={getFullDateAndTime(updatedAt)}
                  >
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
                      label={'Imported'}
                      icon={<DownloadIcon />}
                      rounded
                    />
                    <Divider width={3} borderColor={sameSecondaryText} />
                    <SettingsTag
                      label={'Checks'}
                      icon={<Search2Icon />}
                      isDisabled={!checksEnabled}
                      rounded
                    />
                    <Divider width={3} borderColor={sameSecondaryText} />
                    <SettingsTag
                      label={'Internal Labeling'}
                      icon={<FaTag />}
                      isDisabled={!internalComp}
                      rounded
                    />
                    <Divider width={3} borderColor={sameSecondaryText} />
                    <SettingsTag
                      label={'Automation'}
                      icon={<FaRobot />}
                      isDisabled={!automatedFixesEnabled}
                      rounded
                    />
                    <Divider width={3} borderColor={sameSecondaryText} />
                    <SettingsTag
                      label={'Vulnerability Scan'}
                      icon={<FaBug />}
                      isDisabled={!hasFinished || !vulnScan}
                      rounded
                    />
                    <Divider width={3} borderColor={sameSecondaryText} />
                    <SettingsTag
                      label={'Ready'}
                      icon={<FaCircleCheck />}
                      isDisabled={!hasFinished}
                      rounded
                    />
                  </Flex>
                </CardBody>
              </Card>
            </GridItem>
            {!isFreeTier && (
              <GridItem colSpan={4}>
                <ProgressBar
                  value={healthScore}
                  loading={scoreLoading}
                  text='Version Health Score'
                />
              </GridItem>
            )}
            <GridItem colSpan={isFreeTier ? 6 : 4}>
              <ProgressBar
                value={qualityScore}
                loading={scoreLoading}
                text='SBOM Quality Score'
              />
            </GridItem>
          </Grid>
        </Flex>
      </Flex>
    </>
  )
}

export default SbomDetails
