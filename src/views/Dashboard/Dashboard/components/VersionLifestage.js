import { useQuery } from '@apollo/client'
import { useNavigate } from 'react-router-dom'

import { Grid, GridItem, SimpleGrid, Stack, Text } from '@chakra-ui/react'
import { Tag, TagLabel } from '@chakra-ui/react'
import { Stat, StatGroup, StatNumber } from '@chakra-ui/react'

import LynkLoader from 'components/Misc/LynkLoader'

import { useGlobalState } from 'hooks/useGlobalState'
import { useThemeColor } from 'hooks/useThemeColors'

import { getVersionLifestage } from 'graphQL/Queries'

import {
  LuCalendarHeart,
  LuCalendarMinus,
  LuCog,
  LuInbox,
  LuPencilRuler,
  LuRocket
} from 'react-icons/lu'

const VersionLifestages = () => {
  const navigate = useNavigate()
  const { organization, envName } = useGlobalState()
  const { grayBorderColor, primaryBlueText } = useThemeColor([
    'grayBorderColor',
    'primaryBlueText'
  ])

  const { data, loading } = useQuery(getVersionLifestage, {
    skip: !organization,
    variables: { env: envName }
  })
  const { versionLifecycleStage } = data?.organizationMetric || {}

  const noneCount = versionLifecycleStage?.none || 0
  const designCount = versionLifecycleStage?.design || 0
  const developmentCount = versionLifecycleStage?.development || 0
  const releasedCount = versionLifecycleStage?.released || 0
  const maintenanceCount = versionLifecycleStage?.maintenance || 0
  const endOfSupportCount = versionLifecycleStage?.end_of_support || 0
  const endOfLifeCount = versionLifecycleStage?.end_of_life || 0

  const lifeStages = [
    {
      id: 0,
      color: 'gray',
      label: 'none',
      count: noneCount || 0,
      icon: <LuPencilRuler size={20} />
    },
    {
      id: 1,
      color: 'orange',
      label: 'design',
      count: designCount || 0,
      icon: <LuPencilRuler size={20} />
    },
    {
      id: 2,
      color: 'blue',
      label: 'development',
      count: developmentCount || 0,
      icon: <LuInbox size={20} />
    },
    {
      id: 3,
      color: 'green',
      label: 'released',
      count: releasedCount || 0,
      icon: <LuRocket size={20} />
    },
    {
      id: 4,
      color: 'purple',
      label: 'maintenance',
      count: maintenanceCount || 0,
      icon: <LuCog size={20} />
    },
    {
      id: 5,
      color: 'cyan',
      label: 'end_of_support',
      count: endOfSupportCount || 0,
      icon: <LuCalendarHeart size={20} />
    },
    {
      id: 6,
      color: 'pink',
      label: 'end_of_life',
      count: endOfLifeCount || 0,
      icon: <LuCalendarMinus size={20} />
    }
  ]

  const total = lifeStages?.reduce((sum, stage) => sum + stage.count, 0)

  const handleFilter = (value) =>
    navigate(`/vendor/products?lifestage=${value}`)

  if (loading) return <LynkLoader />

  return (
    <Grid w={'100%'} templateColumns='repeat(12, 1fr)' gap={6}>
      <GridItem colSpan={4}>
        <StatGroup
          pr={4}
          h={'100%'}
          alignItems={'center'}
          borderRight={`1px solid ${grayBorderColor}`}
        >
          <Stat textAlign={'right'}>
            <StatNumber fontWeight={'normal'} fontSize={['4xl', '5xl', '6xl']}>
              {total || 0}
            </StatNumber>
          </Stat>
        </StatGroup>
      </GridItem>
      <GridItem colSpan={8}>
        <Stack>
          {lifeStages?.map((item, index) => (
            <SimpleGrid w={'100%'} key={index} columns={2} spacing={2}>
              <Text
                fontSize={'sm'}
                cursor={'pointer'}
                textTransform={'capitalize'}
                _hover={{ color: primaryBlueText }}
                onClick={() => handleFilter(item?.label)}
              >
                {item?.label?.replaceAll('_', ' ')}
              </Text>
              <Tag
                cursor={'pointer'}
                colorScheme={item?.color}
                onClick={() => handleFilter(item?.label)}
              >
                <TagLabel mx={'auto'} fontSize={'sm'}>
                  {item?.count}
                </TagLabel>
              </Tag>
            </SimpleGrid>
          ))}
        </Stack>
      </GridItem>
    </Grid>
  )
}

export default VersionLifestages
