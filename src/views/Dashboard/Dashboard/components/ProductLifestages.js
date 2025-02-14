import { useQuery } from '@apollo/client'
import { useNavigate } from 'react-router-dom'

import { Grid, GridItem, SimpleGrid, Stack, Text } from '@chakra-ui/react'
import { Tag, TagLabel } from '@chakra-ui/react'
import { Stat, StatGroup, StatNumber } from '@chakra-ui/react'

import Card from 'components/Card/Card'
import CardBody from 'components/Card/CardBody'
import LynkLoader from 'components/Misc/LynkLoader'

import { useGlobalState } from 'hooks/useGlobalState'
import { useThemeColor } from 'hooks/useThemeColors'

import { getProductsByStage } from 'graphQL/Queries'

import {
  LuCalendarHeart,
  LuCalendarMinus,
  LuCog,
  LuInbox,
  LuPencilRuler,
  LuRocket
} from 'react-icons/lu'

const ProductLifestages = () => {
  const navigate = useNavigate()
  const { organization, dispatch } = useGlobalState()
  const { primaryBlueText, grayBorderColor } = useThemeColor([
    'primaryBlueText',
    'grayBorderColor'
  ])

  const { prodDispatch } = dispatch

  const { data, loading } = useQuery(getProductsByStage, {
    skip: !organization
  })

  const noneCount = data?.organization?.none?.totalCount || 0
  const designCount = data?.organization?.design?.totalCount || 0
  const developmentCount = data?.organization?.development?.totalCount || 0
  const releasedCount = data?.organization?.released?.totalCount || 0
  const maintenanceCount = data?.organization?.maintenance?.totalCount || 0
  const endOfSupportCount = data?.organization?.endOfSupport?.totalCount || 0
  const endOfLifeCount = data?.organization?.endOfLife?.totalCount || 0

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

  const handleFilter = (value) => {
    prodDispatch({
      type: 'PRODUCT_BY_LIFESTAGE',
      payload: [value]
    })
    navigate('/vendor/products')
  }

  if (loading) return <LynkLoader />

  return (
    <Card maxH='100%' height='320px' overflowY='auto'>
      {/* HEADING */}
      <Text fontWeight='semibold'>Products by Lifestages</Text>
      <CardBody mt={6} h='100%'>
        <Grid w={'100%'} templateColumns='repeat(12, 1fr)' gap={6}>
          <GridItem colSpan={4}>
            <StatGroup
              pr={4}
              h={'100%'}
              alignItems={'center'}
              borderRight={`1px solid ${grayBorderColor}`}
            >
              <Stat textAlign={'right'}>
                <StatNumber
                  fontWeight={'normal'}
                  fontSize={['4xl', '5xl', '6xl']}
                >
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
      </CardBody>
    </Card>
  )
}

export default ProductLifestages
