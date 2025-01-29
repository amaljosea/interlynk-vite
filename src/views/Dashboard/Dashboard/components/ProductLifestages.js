import { useQuery } from '@apollo/client'

import { Box, Flex, SimpleGrid, Text } from '@chakra-ui/react'
import { Tag, TagLabel } from '@chakra-ui/react'
import {
  Stat,
  StatArrow,
  StatGroup,
  StatHelpText,
  StatNumber
} from '@chakra-ui/react'

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
    <Card textAlign='center' maxH='100%' height='320px' overflowY='auto'>
      {/* HEADING */}
      <Text fontWeight='semibold'>Products by Lifestages</Text>
      <CardBody mt={6} h='100%'>
        <Flex
          gap={4}
          w={'100%'}
          alignItems={'center'}
          justifyContent={'space-between'}
        >
          <StatGroup w={'200px'}>
            <Stat textAlign={'right'}>
              <StatNumber
                fontWeight={'normal'}
                fontSize={['4xl', '5xl', '6xl']}
              >
                {total || 0}
              </StatNumber>
              <StatHelpText display={'none'}>
                <StatArrow type='increase' />
                Up from 3 last week
              </StatHelpText>
            </Stat>
          </StatGroup>
          <Box
            w={0.5}
            h={'100%'}
            borderRight={`1px solid ${grayBorderColor}`}
          />
          <SimpleGrid w={'100%'} columns={1} spacing={2}>
            {lifeStages?.map((item) => (
              <Flex
                gap={6}
                key={item?.id}
                alignItems={'center'}
                justifyContent={'space-between'}
              >
                <Text fontSize={'sm'}>{item?.label}</Text>
                <Tag w={'100px'} colorScheme={item?.color}>
                  <TagLabel mx={'auto'} fontSize={'sm'}>
                    {item?.count}
                  </TagLabel>
                </Tag>
              </Flex>
            ))}
          </SimpleGrid>
        </Flex>
      </CardBody>
    </Card>
  )
}

export default ProductLifestages
