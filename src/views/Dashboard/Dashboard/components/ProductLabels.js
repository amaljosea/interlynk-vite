import { useQuery } from '@apollo/client'
import { hexToRGBA } from 'utils/styleUtils'

import { SimpleGrid } from '@chakra-ui/react'
import { Tag, TagLabel } from '@chakra-ui/react'
import { Box, Flex, Text } from '@chakra-ui/react'
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

import { getProductsByLabels } from 'graphQL/Queries'

const ProductLabels = () => {
  const { organization } = useGlobalState()
  const { grayBorderColor } = useThemeColor(['grayBorderColor'])

  const { data: prodByLabels, loading } = useQuery(getProductsByLabels, {
    skip: organization ? false : true,
    variables: { stage: null }
  })

  const projectGroups = prodByLabels?.organization?.projectGroups?.nodes
  const labelCounts = {}
  projectGroups?.forEach((group) => {
    group.labels.forEach((label) => {
      const labelName = label.name
      const labelColor = label.color

      if (labelCounts[labelName]) {
        labelCounts[labelName].count++
      } else {
        labelCounts[labelName] = { count: 1, color: labelColor }
      }
    })
  })

  const topLabels = Object.entries(labelCounts)
    ?.slice(0, 6)
    ?.sort((a, b) => b[1].count - a[1].count)
    ?.map(([label, data]) => ({ label, count: data.count, color: data.color }))

  const otherLabels = Object.entries(labelCounts)?.slice(6)
  const result = []
  if (otherLabels?.length > 0) {
    const otherCount = otherLabels.reduce(
      (acc, [, { count }]) => acc + count,
      0
    )
    // eslint-disable-next-line no-restricted-syntax
    result.push({ label: 'Others', count: otherCount, color: '#718096' })
  }

  const filterLabels = [...topLabels, ...result]

  const total = filterLabels?.reduce((sum, stage) => sum + stage.count, 0)

  if (loading) return <LynkLoader />

  return (
    <Card textAlign='center' maxH='100%' overflowY='auto'>
      {/* HEADING */}
      <Text fontWeight={'semibold'}>Products by Label</Text>
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
            h={'full'}
            borderRight={`1px solid ${grayBorderColor}`}
          />
          <SimpleGrid w={'100%'} columns={1} spacing={2}>
            {filterLabels?.map((item) => (
              <Flex
                gap={6}
                key={item?.id}
                alignItems={'center'}
                justifyContent={'space-between'}
              >
                <Text fontSize={'sm'} color={item?.color}>
                  {item?.label}
                </Text>
                <Tag
                  w={'80px'}
                  bg={hexToRGBA(item?.color, 0.1)}
                  borderColor={hexToRGBA(item?.color, 0.4)}
                >
                  <TagLabel
                    mx={'auto'}
                    fontSize={'sm'}
                    color={item?.color}
                    borderColor={hexToRGBA(item?.color, 0.4)}
                  >
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

export default ProductLabels
