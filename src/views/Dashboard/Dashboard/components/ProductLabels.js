import { Heading, SimpleGrid } from '@chakra-ui/react'
import { Stat, StatLabel, StatNumber } from '@chakra-ui/react'

import Card from 'components/Card/Card'
import CardBody from 'components/Card/CardBody'

import { useThemeColor } from 'hooks/useThemeColors'

const ProductLabels = () => {
  const { secondaryTextColor } = useThemeColor(['secondaryTextColor'])
  const lifeStages = [
    {
      id: 1,
      label: 'Documentation',
      count: 21
    },
    {
      id: 2,
      label: 'Feature',
      count: 12
    },
    {
      id: 3,
      label: 'External',
      count: 4
    },
    {
      id: 4,
      label: 'Bug',
      count: 8
    },
    {
      id: 5,
      label: 'Enhancement',
      count: 23
    },
    {
      id: 6,
      label: 'Next Release',
      count: 6
    },
    {
      id: 7,
      label: 'Design',
      count: 16
    }
  ]

  return (
    <Card maxH='100%'>
      <Heading fontSize={'lg'}>Products by Label</Heading>
      <CardBody mt={6}>
        <SimpleGrid w={'100%'} columns={4} spacing={5}>
          {lifeStages?.map((item) => (
            <Stat key={item?.id}>
              <StatNumber lineHeight={6} fontSize={'lg'} fontWeight={'normal'}>
                {item?.count}
              </StatNumber>
              <StatLabel color={secondaryTextColor}>{item?.label}</StatLabel>
            </Stat>
          ))}
        </SimpleGrid>
      </CardBody>
    </Card>
  )
}

export default ProductLabels
