import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import {
  getFullDate,
  getSignedUrlParams,
  isSbomArchived,
  timeSince,
  truncatedValue
} from 'utils'
import SbomActions from 'views/Sbom/components/SbomActions'

import { EditIcon } from '@chakra-ui/icons'
import { Flex, TagRightIcon, Text, Tooltip } from '@chakra-ui/react'
import { Tag, TagLabel } from '@chakra-ui/react'
import { Icon } from '@chakra-ui/react'
import { Grid, GridItem } from '@chakra-ui/react'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from '@chakra-ui/react'
import { useDisclosure } from '@chakra-ui/react'

import Card from 'components/Card/Card'
import CardBody from 'components/Card/CardBody'
import { ProgressBar } from 'components/ProgressBar'
import SbomProcess from 'components/SbomProcess'

import { useGlobalQueryContext } from 'hooks/useGlobalQueryContext'
import { useGlobalState } from 'hooks/useGlobalState'
import { usePartsContext } from 'hooks/usePartsContext'
import { useProjectGroup } from 'hooks/useProjectGroup'
import { useSbomScores } from 'hooks/useSbomScores'
import { useShouldShowDemoFeatures } from 'hooks/useShouldShowDemoFeatures'
import { useThemeColor } from 'hooks/useThemeColors'

import { FaCubes, FaLongArrowAltRight } from 'react-icons/fa'

import LifecycleModal from '../../components/LifecycleModal'

const SbomDetails = ({ sbomData }) => {
  const params = useParams()
  const navigate = useNavigate()
  const partsContext = usePartsContext()
  const signedUrlParams = getSignedUrlParams()
  const { sbomHookData, isFreeTier } = useGlobalQueryContext()
  const projectId = params.productid
  const sbomId = params.sbomid

  const { shouldShowDemoFeatures } = useShouldShowDemoFeatures()

  const {
    projectVersion,
    primaryComponent,
    vulnRunStatus,
    updatedAt,
    healthScore
  } = sbomData || {}
  const { name, version, description } = primaryComponent || {}

  const hasFinished = vulnRunStatus === 'FINISHED'

  const lifecycleData = {
    stage: sbomData?.productLifeCycleStage,
    releaseDate: sbomData?.releaseDate,
    endOfLifeDate: sbomData?.endOfLifeDate,
    endOfSupportDate: sbomData?.endOfSupportDate
  }

  const isArchived = isSbomArchived(sbomData)

  const { isOpen, onOpen, onClose } = useDisclosure()

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

  const { primaryBlueText, secondaryBlueText, secondaryTextInverse } =
    useThemeColor([
      'primaryBlueText',
      'secondaryBlueText',
      'secondaryTextInverse'
    ])

  const { name: projectGroupName, loading } = useProjectGroup({
    projectGroupId: params.productgroupid
  })

  useEffect(() => {
    window.onpopstate = () => {
      console.warn(`Pressed back button`)
      handlePart()
    }
  })

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
                        cursor={'pointer'}
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
                {lifecycleData?.stage && (
                  <Tooltip label='Lifecycle stage'>
                    <Tag
                      variant='solid'
                      colorScheme='blue'
                      w={'fit-content'}
                      cursor={'pointer'}
                    >
                      <TagLabel textTransform={'capitalize'}>
                        {String(lifecycleData?.stage).replace(/_/g, ' ')}
                      </TagLabel>
                      <TagRightIcon
                        as={EditIcon}
                        onClick={onOpen}
                        hidden={isArchived}
                        label={'add_lifecycle'}
                      />
                    </Tag>
                  </Tooltip>
                )}
              </Flex>
              <Text
                wordBreak={'break-all'}
                hidden={description === ''}
                sx={{ w: '90%', mb: 1, mr: 'auto', fontSize: 'sm' }}
              >
                {description}
              </Text>
            </GridItem>
            <GridItem colSpan={4} hidden={isArchived}>
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
                  {/* PROCESS */}
                  {!signedUrlParams && (
                    <SbomProcess hasFinished={hasFinished} />
                  )}
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
              isOpen={isOpen}
              onClose={onClose}
              data={{ projectId: projectId, sbomId: sbomId }}
            />
          )}
        </Flex>
      </Flex>
    </>
  )
}

export default SbomDetails
