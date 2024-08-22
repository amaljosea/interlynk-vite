import { useQuery } from '@apollo/client'
import BSI from 'assets/img/bsi.jpg'
import FDA from 'assets/img/fda.jpg'
import NTIA from 'assets/img/ntia.jpg'
import { useParams } from 'react-router-dom'

import {
  Button,
  Flex,
  Heading,
  Img,
  SimpleGrid,
  Stack,
  Text,
  useColorModeValue
} from '@chakra-ui/react'

import Card from 'components/Card/Card'

import useQueryParam from 'hooks/useQueryParam'

import { GetSbomQualityScores } from 'graphQL/Queries'

const Compliance = () => {
  const params = useParams()
  const tab = useQueryParam('tab')
  const borderColor = useColorModeValue('#E2E8F0', '#ffffff29')
  const textColor = useColorModeValue('gray.600', 'gray.200')

  const { data: ntiaResult } = useQuery(GetSbomQualityScores, {
    skip: tab === 'compliance' ? false : true,
    variables: { sbomIds: [params?.sbomid], reportFormat: 'NTIA' }
  })
  const { data: fdaResult } = useQuery(GetSbomQualityScores, {
    skip: tab === 'compliance' ? false : true,
    variables: { sbomIds: [params?.sbomid], reportFormat: 'FDA' }
  })

  const { nodes: ntiaData } = ntiaResult?.complianceReports || ''
  const { nodes: fdaData } = fdaResult?.complianceReports || ''
  const fda = fdaData?.length > 0 ? fdaData[0] : []
  const ntia = ntiaData?.length > 0 ? ntiaData[0] : []

  const data = [
    {
      id: 1,
      icon: (
        <Img src={NTIA} mr={'auto'} objectFit={'contain'} height={'46px'} />
      ),
      title: 'NTIA Minimum Elements',
      description:
        'This include essential data fields, automation, regular updates, detailed depth, and secure delivery.',
      score: `${Math.round(ntia?.score)} %`
    },
    {
      id: 2,
      icon: <Img src={FDA} mr={'auto'} objectFit={'contain'} height={'44px'} />,
      title: 'FDA 510(K)',
      description:
        'This  requires an SBOM to ensure software transparency, security, and regulatory adherence in devices.',
      score: `${Math.round(fda?.score)} %`
    },
    {
      id: 3,
      icon: <Img src={BSI} mr={'auto'} objectFit={'contain'} height={'46px'} />,
      title: 'BSI TR-03183',
      description: 'Coming soon...',
      score: ''
    }
  ]
  return (
    <SimpleGrid columns={4} spacing={5} mt={2}>
      {data?.map((item) => (
        <Card key={item?.id} gap={6} border={`1px solid ${borderColor}`}>
          {item?.icon}
          <Stack alignItems={'flex-start'}>
            <Text fontSize={'16px'} fontWeight={'medium'}>
              {item?.title}
            </Text>
            <Text
              color={textColor}
              fontSize={'14px'}
              fontWeight={'light'}
              pt={item?.description === 'Coming soon...' ? 5 : 0}
            >
              {item?.description}
            </Text>
          </Stack>
          <Flex
            alignItems={'center'}
            justifyContent={'space-between'}
            hidden={!item?.score}
          >
            <Text fontSize={'sm'} fontWeight={'medium'}>
              Score
            </Text>
            <Button fontSize={'xs'} size='sm' cursor={'default'}>
              {item?.score}
            </Button>
          </Flex>
        </Card>
      ))}
    </SimpleGrid>
  )
}

export default Compliance
