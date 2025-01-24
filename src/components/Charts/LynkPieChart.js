/* eslint-disable no-restricted-syntax */
import { Cell, Pie, PieChart } from 'recharts'

import {
  Box,
  Flex,
  Heading,
  SimpleGrid,
  SkeletonCircle,
  SkeletonText,
  Text,
  VStack
} from '@chakra-ui/react'

import Card from 'components/Card/Card'
import CardBody from 'components/Card/CardBody'

import { useThemeColor } from 'hooks/useThemeColors'

const LynkPieChart = ({ title, data, loading }) => {
  const { grayBorderColor } = useThemeColor(['grayBorderColor'])

  const total = data?.reduce((acc, item) => acc + item.value, 0)

  if (loading)
    return (
      <Card>
        <Box padding='2'>
          <SkeletonCircle size='10' />
          <SkeletonText mt='4' noOfLines={4} spacing='4' skeletonHeight='2' />
        </Box>
      </Card>
    )

  return (
    <Card maxH='100%'>
      <Heading fontSize={'lg'}>{title}</Heading>
      <CardBody mt={6}>
        <SimpleGrid w={'100%'} columns={2} alignItems={'center'}>
          <Flex justify='center' align='center' position='relative'>
            <PieChart width={160} height={160}>
              <Pie
                cx='50%'
                cy='50%'
                data={data}
                dataKey='value'
                innerRadius={50}
                outerRadius={70}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
            <Box position='absolute' textAlign='center'>
              <Text fontSize='lg' fontWeight='bold'>
                {total || 0}
              </Text>
              <Text fontSize='xs' color='gray'>
                Total
              </Text>
            </Box>
          </Flex>
          <VStack spacing={2} align='start' mt={4}>
            {data.map((item) => (
              <Flex
                gap={4}
                width={'90%'}
                key={item.name}
                align='center'
                borderBottom={`1px solid ${grayBorderColor}`}
              >
                <Flex align='center' w={'130px'}>
                  <Box
                    w='10px'
                    h='10px'
                    bg={item.color}
                    borderRadius='full'
                    mr='2'
                  />
                  <Text fontSize={'sm'}>{item.name}</Text>
                </Flex>
                <Text fontSize={'sm'} fontWeight='semibold'>
                  {item.value}
                </Text>
              </Flex>
            ))}
          </VStack>
        </SimpleGrid>
      </CardBody>
    </Card>
  )
}

export default LynkPieChart
