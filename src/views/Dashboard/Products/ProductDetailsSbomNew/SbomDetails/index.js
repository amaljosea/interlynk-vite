import { useLazyQuery, useQuery } from '@apollo/client'
import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { getFullDateAndTime, timeSince, truncatedValue } from 'utils'
import SbomActions from 'views/Sbom/components/SbomActions'

import { DownloadIcon, Search2Icon } from '@chakra-ui/icons'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Divider,
  Flex,
  Grid,
  GridItem,
  Icon,
  IconButton,
  Tag,
  TagLabel,
  Text,
  Tooltip,
  useColorModeValue,
  useDisclosure
} from '@chakra-ui/react'

import Card from 'components/Card/Card'
import CardBody from 'components/Card/CardBody'
import GraphDrawer from 'components/Drawer/GraphDrawer'
import { ProgressBar } from 'components/ProgressBar'

import { useGlobalQueryContext } from 'hooks/useGlobalQueryContext'
import { useGlobalState } from 'hooks/useGlobalState'
import { usePartsContext } from 'hooks/usePartsContext'
import { useProjectGroup } from 'hooks/useProjectGroup'
import { useSbomScores } from 'hooks/useSbomScores'
import { useShouldShowDemoFeatures } from 'hooks/useShouldShowDemoFeatures'
import { useThemeColor } from 'hooks/useThemeColors'

import {
  GetPrimaryComponent,
  GetProjectSettings,
  GetSharPrimartComp
} from 'graphQL/Queries'

import { FaBug, FaCubes, FaLongArrowAltRight, FaRobot } from 'react-icons/fa'
import { FaCircleCheck, FaTag } from 'react-icons/fa6'

const SettingsTag = ({ icon, label, color }) => {
  return (
    <Tooltip label={label}>
      <IconButton
        borderRadius={'full'}
        size='xs'
        icon={icon}
        colorScheme={color}
      />
    </Tooltip>
  )
}

const SbomDetails = ({ sbomData }) => {
  const params = useParams()
  const partsContext = usePartsContext()
  const { sbomHookData } = useGlobalQueryContext()
  const projectId = params.productid
  const sbomId = params.sbomid

  const { shouldShowDemoFeatures } = useShouldShowDemoFeatures()

  const {
    projectVersion,
    primaryComponent,
    vulnRunStatus,
    updatedAt,
    lifecycle
  } = sbomData || ''
  const { name, version, description } = primaryComponent || ''

  const { prodCompState } = useGlobalState()
  const { field, direction } = prodCompState

  const signedUrlParams = sessionStorage.getItem('signedUrlParams')
  const scanColor = useColorModeValue('blackAlpha', 'whiteAlpha')

  const { isOpen, onOpen, onClose } = useDisclosure()

  // GET PRIMARY COMPONENT
  const [getPrimaryComp, { data: primaryComp }] = useLazyQuery(
    signedUrlParams ? GetSharPrimartComp : GetPrimaryComponent,
    {
      fetchPolicy: 'network-only'
    }
  )

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

  const handleRelationView = async () => {
    await getPrimaryComp({
      variables: {
        projectId: signedUrlParams ? undefined : projectId,
        sbomId: sbomId,
        primary: true,
        field,
        direction
      }
    }).then((res) => res?.data && onOpen())
  }

  const handlePart = () => {
    partsContext.pop()
  }

  const {
    qualityScore,
    healthScore,
    loading: scoreLoading
  } = useSbomScores({
    sbomId,
    projectId: projectId,
    skip: !shouldShowDemoFeatures
  })

  const { primaryBlueText } = useThemeColor(['primaryBlueText'])

  const filterText = (item) => {
    return item?.length > 10 ? `${item?.substring(0, 10)}...` : item
  }

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
          h={'64px'}
          w={'64px'}
          color='blue.300'
          onClick={handleRelationView}
          cursor={'pointer'}
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
                separator={<FaLongArrowAltRight color='darkgray' />}
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
                  ].map((part) => {
                    return (
                      <BreadcrumbItem
                        isCurrentPage={!!part.url}
                        key={part.url}
                        color={primaryBlueText}
                      >
                        <BreadcrumbLink _hover={{ textDecoration: 'none' }}>
                          {filterText(part.projectGroupName)} (
                          {filterText(part.versionName)})
                        </BreadcrumbLink>
                      </BreadcrumbItem>
                    )
                  })}
              </Breadcrumb>
              <Flex
                gap={1}
                flexDir={'row'}
                flexWrap={'wrap'}
                alignItems={'center'}
                fontWeight={'semibold'}
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
                mb={1}
                width={'90%'}
                mr={'auto'}
                fontSize={'sm'}
                wordBreak={'break-all'}
                hidden={description === ''}
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
            <GridItem colSpan={4}>
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
                      color={'blue'}
                      label={'Imported'}
                      icon={<DownloadIcon />}
                    />
                    <Divider width={3} borderColor={'gray.500'} />
                    <SettingsTag
                      color={checksEnabled ? 'blue' : scanColor}
                      label={'Checks'}
                      icon={<Search2Icon />}
                    />
                    <Divider width={3} borderColor={'gray.500'} />
                    <SettingsTag
                      color={internalComp ? 'blue' : scanColor}
                      label={'Internal Labeling'}
                      icon={<FaTag />}
                    />
                    <Divider width={3} borderColor={'gray.500'} />
                    <SettingsTag
                      color={automatedFixesEnabled ? 'blue' : scanColor}
                      label={'Automation'}
                      icon={<FaRobot />}
                    />
                    <Divider width={3} borderColor={'gray.500'} />
                    <SettingsTag
                      color={hasFinished && vulnScan ? 'blue' : scanColor}
                      label={'Vulnerability Scan'}
                      icon={<FaBug />}
                    />
                    <Divider width={3} borderColor={'gray.500'} />
                    <SettingsTag
                      label={'Ready'}
                      color={hasFinished ? 'blue' : scanColor}
                      icon={<FaCircleCheck />}
                    />
                  </Flex>
                </CardBody>
              </Card>
            </GridItem>
            <GridItem colSpan={shouldShowDemoFeatures ? 4 : 8}>
              <ProgressBar
                value={qualityScore}
                loading={scoreLoading}
                text='SBOM Quality Score'
              />
            </GridItem>
            {shouldShowDemoFeatures && (
              <GridItem colSpan={4}>
                <ProgressBar
                  value={healthScore}
                  loading={scoreLoading}
                  text='Version Health Score'
                />
              </GridItem>
            )}
          </Grid>
        </Flex>
      </Flex>

      {isOpen && primaryComp && (
        <GraphDrawer
          isOpen={isOpen}
          onClose={onClose}
          primaryComp={
            signedUrlParams
              ? primaryComp?.shareLynkQuery?.sbom?.components
              : primaryComp?.sbom?.components
          }
          activeComp={null}
        />
      )}
    </>
  )
}

export default SbomDetails
