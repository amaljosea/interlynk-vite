/* eslint-disable no-restricted-syntax */
import { useNavigate } from 'react-router-dom'
import { Cell, Pie, PieChart } from 'recharts'

import { Box, Flex, SimpleGrid, Text, VStack } from '@chakra-ui/react'

import LynkLoader from 'components/Misc/LynkLoader'

import { useGlobalState } from 'hooks/useGlobalState'
import { useThemeColor } from 'hooks/useThemeColors'

const LynkPieChart = ({ title, data, loading }) => {
  const navigate = useNavigate()
  const { dispatch } = useGlobalState()
  const { globalVulnDispatch } = dispatch
  const { grayBorderColor, primaryBlueText } = useThemeColor([
    'grayBorderColor',
    'primaryBlueText'
  ])

  const total = data?.reduce((acc, item) => acc + item.value, 0)

  const handleReview = (value) => {
    if (title === 'All Vulnerabilities by Severity') {
      globalVulnDispatch({ type: 'ALL_VULN_BY_SEVERITY', payload: [value] })
      navigate('/vendor/vulnerabilities?tab=productVulnerabilities')
    } else if (title === 'All Vulnerabilities by Status') {
      globalVulnDispatch({ type: 'ALL_VULN_BY_STATUS', payload: [value] })
      navigate('/vendor/vulnerabilities?tab=productVulnerabilities')
    } else if (title === 'Critical Vulnerabilities by Status') {
      globalVulnDispatch({ type: 'CRITICAL_VULN_BY_STATUS', payload: [value] })
      navigate('/vendor/vulnerabilities?tab=productVulnerabilities')
    } else if (title === 'High Vulnerabilities by Status') {
      globalVulnDispatch({ type: 'HIGH_VULN_BY_STATUS', payload: [value] })
      navigate('/vendor/vulnerabilities?tab=productVulnerabilities')
    } else if (title === 'KEV Vulnerabilties by Status') {
      globalVulnDispatch({ type: 'KEV_VULN_BY_STATUS', payload: [value] })
      navigate('/vendor/vulnerabilities?tab=productVulnerabilities')
    } else {
      return null
    }
  }

  if (loading) return <LynkLoader />

  return (
    <SimpleGrid w={'100%'} columns={2} alignItems={'center'}>
      <Flex justify='center' align='center' position='relative'>
        <PieChart hart width={180} height={180}>
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
          <Text fontSize='sm' color='gray'>
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
            justifyContent={'space-between'}
            borderBottom={`1px solid ${grayBorderColor}`}
          >
            <Flex align='center' w={'130px'}>
              <Box
                mr='2'
                w='10px'
                h='10px'
                bg={item.color}
                borderRadius='full'
              />
              <Text
                fontSize={'sm'}
                cursor={'pointer'}
                textTransform={'capitalize'}
                _hover={{ color: primaryBlueText }}
                onClick={() => handleReview(item?.name)}
              >
                {item.name}
              </Text>
            </Flex>
            <Text fontSize={'md'} fontWeight='semibold'>
              {item.value}
            </Text>
          </Flex>
        ))}
      </VStack>
    </SimpleGrid>
  )
}

export default LynkPieChart
