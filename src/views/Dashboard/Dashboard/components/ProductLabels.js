import { useQuery } from '@apollo/client'
import { useNavigate } from 'react-router-dom'
import { hexToRGBA } from 'utils/styleUtils'

import { Grid, GridItem, SimpleGrid, Stack } from '@chakra-ui/react'
import { Tag, TagLabel, Text } from '@chakra-ui/react'
import { Stat, StatGroup, StatNumber } from '@chakra-ui/react'

import Card from 'components/Card/Card'
import CardBody from 'components/Card/CardBody'
import LynkLoader from 'components/Misc/LynkLoader'

import { useGlobalQueryContext } from 'hooks/useGlobalQueryContext'
import { useGlobalState } from 'hooks/useGlobalState'
import { useThemeColor } from 'hooks/useThemeColors'

import { getProductsByLabels } from 'graphQL/Queries'

const ProductLabels = () => {
  const { isFreeTier } = useGlobalQueryContext()

  const navigate = useNavigate()
  const { organization, dispatch } = useGlobalState()
  const { grayBorderColor, primaryBlueText } = useThemeColor([
    'grayBorderColor',
    'primaryBlueText'
  ])

  const { prodDispatch } = dispatch

  const { data: prodByLabels, loading } = useQuery(getProductsByLabels, {
    skip: organization ? false : true,
    variables: { stage: null }
  })

  const projectGroups = prodByLabels?.organization?.projectGroups?.nodes
  const labelCounts = {}
  projectGroups?.forEach((group) => {
    group.labels.forEach((label) => {
      const labelId = label.id
      const labelName = label.name
      const labelColor = label.color

      if (labelCounts[labelName]) {
        labelCounts[labelName].count++
      } else {
        labelCounts[labelName] = { id: labelId, count: 1, color: labelColor }
      }
    })
  })

  const topLabels = Object.entries(labelCounts)
    ?.slice(0, 6)
    ?.sort((a, b) => b[1].count - a[1].count)
    ?.map(([label, data]) => ({
      label,
      id: data.id,
      count: data.count,
      color: data.color
    }))

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

  if (loading && !isFreeTier) return <LynkLoader />

  const handleFilter = (value) => {
    prodDispatch({
      type: 'PRODUCT_BY_LABEL',
      payload: [value]
    })
    navigate('/vendor/products')
  }

  return (
    <Card hidden={isFreeTier} maxH='100%' overflowY='auto'>
      {/* HEADING */}
      <Text fontWeight={'semibold'}>Products by Label</Text>
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
              {filterLabels?.map((item, index) => (
                <SimpleGrid key={index} w={'100%'} columns={2} spacing={2}>
                  <Text
                    fontSize={'sm'}
                    cursor={'pointer'}
                    // color={item?.color}
                    _hover={{ color: primaryBlueText }}
                    onClick={() => handleFilter(item.id)}
                  >
                    {item?.label}
                  </Text>
                  <Tag
                    cursor={'pointer'}
                    bg={hexToRGBA(item?.color, 0.1)}
                    onClick={() => handleFilter(item.id)}
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
                </SimpleGrid>
              ))}
            </Stack>
          </GridItem>
        </Grid>
      </CardBody>
    </Card>
  )
}

export default ProductLabels
