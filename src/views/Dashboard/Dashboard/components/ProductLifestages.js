import { useQuery } from '@apollo/client'

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
  const { organization } = useGlobalState()
  const { grayBorderColor } = useThemeColor(['grayBorderColor'])

  const { data: noStage, loading } = useQuery(getProductsByStage, {
    skip: organization ? false : true,
    variables: { stage: null }
  })

  const { data: design } = useQuery(getProductsByStage, {
    skip: organization ? false : true,
    variables: { stage: ['design'] }
  })
  const { data: development } = useQuery(getProductsByStage, {
    skip: organization ? false : true,
    variables: { stage: ['development'] }
  })
  const { data: maintenance } = useQuery(getProductsByStage, {
    skip: organization ? false : true,
    variables: { stage: ['maintenance'] }
  })
  const { data: released } = useQuery(getProductsByStage, {
    skip: organization ? false : true,
    variables: { stage: ['released'] }
  })
  const { data: endOfSupport } = useQuery(getProductsByStage, {
    skip: organization ? false : true,
    variables: { stage: ['end_of_support'] }
  })

  const { data: endOfLife } = useQuery(getProductsByStage, {
    skip: organization ? false : true,
    variables: { stage: ['end_of_life'] }
  })

  const lifeStages = [
    {
      id: 0,
      color: 'gray',
      label: 'None',
      count: noStage?.organization?.projectGroups?.totalCount || 0,
      icon: <LuCalendarMinus size={20} />
    },
    {
      id: 1,
      color: 'orange',
      label: 'Design',
      count: design?.organization?.projectGroups?.totalCount || 0,
      icon: <LuPencilRuler size={20} />
    },
    {
      id: 2,
      color: 'blue',
      label: 'Development',
      count: development?.organization?.projectGroups?.totalCount || 0,
      icon: <LuInbox size={20} />
    },
    {
      id: 3,
      color: 'green',
      label: 'Release',
      count: released?.organization?.projectGroups?.totalCount || 0,
      icon: <LuRocket size={20} />
    },
    {
      id: 4,
      color: 'red',
      label: 'Maintenance',
      count: maintenance?.organization?.projectGroups?.totalCount || 0,
      icon: <LuCog size={20} />
    },
    {
      id: 5,
      color: 'cyan',
      label: 'End of support',
      count: endOfSupport?.organization?.projectGroups?.totalCount || 0,
      icon: <LuCalendarHeart size={20} />
    },
    {
      id: 6,
      color: 'gray',
      label: 'End of life',
      count: endOfLife?.organization?.projectGroups?.totalCount || 0,
      icon: <LuCalendarMinus size={20} />
    }
  ]

  const total = lifeStages?.reduce((sum, stage) => sum + stage.count, 0)

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
                  <Text fontSize={'sm'}>{item?.label}</Text>
                  <Tag colorScheme={item?.color}>
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
