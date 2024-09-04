import { useQuery } from '@apollo/client'
import BSI from 'assets/img/bsi.jpg'
import FDA from 'assets/img/fda.jpg'
import NTIA from 'assets/img/ntia.jpg'
import { useState } from 'react'
import { useParams } from 'react-router-dom'
import ComplianceChecks from 'views/Sbom/components/ComplianceChecks'

import {
  Box,
  Button,
  Flex,
  Img,
  SimpleGrid,
  Spinner,
  Stack,
  Text,
  useColorModeValue,
  useDisclosure
} from '@chakra-ui/react'

import Card from 'components/Card/Card'

import useQueryParam from 'hooks/useQueryParam'

import { GetSbomQualityScores } from 'graphQL/Queries'

const Compliance = () => {
  const params = useParams()
  const tab = useQueryParam('tab')
  const borderColor = useColorModeValue('#E2E8F0', '#ffffff29')
  const textColor = useColorModeValue('gray.600', 'gray.200')

  const { isOpen, onOpen, onClose } = useDisclosure()

  const [activeTab, setActiveTab] = useState(0)

  const { data: ntiaResult, loading: ntiaLoading } = useQuery(
    GetSbomQualityScores,
    {
      skip: tab === 'compliance' ? false : true,
      variables: { sbomIds: [params?.sbomid], reportFormat: 'NTIA' }
    }
  )
  const { data: fdaResult, loading: fdaLoading } = useQuery(
    GetSbomQualityScores,
    {
      skip: tab === 'compliance' ? false : true,
      variables: { sbomIds: [params?.sbomid], reportFormat: 'FDA' }
    }
  )

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
      score: ntiaLoading ? (
        <Spinner size='xs' />
      ) : (
        `${Math.round(ntia?.score)} %`
      )
    },
    {
      id: 2,
      icon: <Img src={FDA} mr={'auto'} objectFit={'contain'} height={'44px'} />,
      title: 'FDA 510(K)',
      description:
        'This  requires an SBOM to ensure software transparency, security, and regulatory adherence in devices.',
      score: fdaLoading ? <Spinner size='xs' /> : `${Math.round(fda?.score)} %`
    },
    {
      id: 3,
      icon: <Img src={BSI} mr={'auto'} objectFit={'contain'} height={'46px'} />,
      title: 'BSI TR-03183',
      description: 'Coming soon...',
      score: ''
    }
  ]

  const onCheck = (index) => {
    setActiveTab(index)
    onOpen()
  }

  return (
    <>
      <SimpleGrid columns={4} spacing={5} mt={2}>
        {data?.map((item, index) => (
          <Card key={item?.id} gap={6} border={`1px solid ${borderColor}`}>
            <Flex gap={4} alignItems={'center'} justifyContent={'flex-start'}>
              <Box>{item?.icon}</Box>
              <Text
                fontSize={'16px'}
                cursor={'pointer'}
                fontWeight={'medium'}
                onClick={() => onCheck(index)}
                _hover={{ color: 'blue.500' }}
              >
                {item?.title}
              </Text>
            </Flex>
            <Text
              color={textColor}
              fontSize={'14px'}
              fontWeight={'light'}
              pt={item?.description === 'Coming soon...' ? 5 : 0}
            >
              {item?.description}
            </Text>
            <Flex
              alignItems={'center'}
              justifyContent={'space-between'}
              hidden={!item?.score}
            >
              <Text fontSize={'sm'} fontWeight={'medium'}>
                Score
              </Text>
              <Button size='sm' fontSize={'xs'} onClick={() => onCheck(index)}>
                {item?.score === '0 %' ? 'N/A' : item?.score}
              </Button>
            </Flex>
          </Card>
        ))}
      </SimpleGrid>

      {isOpen && (
        <ComplianceChecks
          fileName={null}
          isOpen={isOpen}
          onClose={onClose}
          activeTab={activeTab}
          fdaLoading={fdaLoading}
          ntiaLoading={ntiaLoading}
          fda={fdaData?.length > 0 ? fdaData[0] : []}
          ntia={ntiaData?.length > 0 ? ntiaData[0] : []}
        />
      )}
    </>
  )
}

export default Compliance
