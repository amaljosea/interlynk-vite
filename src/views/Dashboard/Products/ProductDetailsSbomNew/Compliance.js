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
  Link,
  SimpleGrid,
  Skeleton,
  Spinner,
  Text,
  chakra,
  useDisclosure
} from '@chakra-ui/react'

import Card from 'components/Card/Card'

import useQueryParam from 'hooks/useQueryParam'
import { useThemeColor } from 'hooks/useThemeColors'

import { GetSbomQualityScores } from 'graphQL/Queries'
import { ActiveCompliances } from 'graphQL/Queries'

const Compliance = ({ sbomData }) => {
  const params = useParams()
  const tab = useQueryParam('tab')

  const { grayBorderColor, primaryBlueText, headingTextColor } = useThemeColor([
    'grayBorderColor',
    'primaryBlueText',
    'headingTextColor'
  ])

  const isArchived = sbomData?.lifecycle === 'archived'

  const { isOpen, onOpen, onClose } = useDisclosure()

  const [activeTab, setActiveTab] = useState(0)

  const { data: compliances, loading } = useQuery(ActiveCompliances, {
    skip: tab === 'compliance' ? false : true
  })
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

  const { activeCompliances } = compliances?.organization || ''
  const { nodes: ntiaData } = ntiaResult?.complianceReports || ''
  const { nodes: fdaData } = fdaResult?.complianceReports || ''
  const fda = fdaData?.length > 0 ? fdaData[0] : []
  const ntia = ntiaData?.length > 0 ? ntiaData[0] : []

  const data = [
    {
      id: 1,
      type: 'ntia',
      icon: (
        <Img
          alt='NTIA'
          src={NTIA}
          mr={'auto'}
          height={'46px'}
          objectFit={'contain'}
        />
      ),
      title: 'NTIA Minimum Elements',
      description: `The NTIA (National Telecommunications and Information Administration) Minimum Elements for a Software Bill of Materials (SBOM) are a set of guidelines and recommendations that define the essential information an SBOM should contain.`,
      url: 'https://www.ntia.doc.gov/files/ntia/publications/sbom_minimum_elements_report.pdf',
      score: ntiaLoading ? (
        <Spinner size='xs' />
      ) : (
        `${Math.round(ntia?.score)} %`
      )
    },
    {
      id: 2,
      type: 'fda',
      icon: (
        <Img
          alt='FDA'
          src={FDA}
          mr={'auto'}
          height={'44px'}
          objectFit={'contain'}
        />
      ),
      title: 'FDA Cybersecurity Compliance',
      description:
        'SBOM requirements from FDA issued the final guidance Cybersecurity in Medical Devices: Quality System Considerations and Content of Premarket Submissions.',
      url: 'https://www.fda.gov/media/119933/download',
      score: fdaLoading ? <Spinner size='xs' /> : `${Math.round(fda?.score)} %`
    },
    {
      id: 3,
      type: 'bsi',
      icon: (
        <Img
          alt='BSI'
          src={BSI}
          mr={'auto'}
          height={'46px'}
          objectFit={'contain'}
        />
      ),
      title: 'BSI TR-03183',
      description:
        'The Technical Guideline TR-03183: Cyber Resilience Requirements for Manufacturers and Products aims to provide manufacturers with advance access to the type of requirements that will be imposed on them by the future Cyber Resilience Act (CRA) of the EU.',
      url: 'https://www.bsi.bund.de/SharedDocs/Downloads/EN/BSI/Publications/TechGuidelines/TR03183/BSI-TR-03183-2.pdf?__blob=publicationFile&v=5',
      score: ''
    }
  ]

  const onCheck = (index) => {
    setActiveTab(index)
    onOpen()
  }

  const filterData = activeCompliances?.map((item) => {
    const activeItems = data?.find((row) => row?.type === item?.complianceType)
    return activeItems
  })
  const tabs = filterData?.map((item) => item?.type)

  if (loading) {
    return (
      <SimpleGrid columns={3} spacing={5} mt={2}>
        {[1, 2, 3].map((item) => (
          <Skeleton key={item} w={'full'} h={64} />
        ))}
      </SimpleGrid>
    )
  }

  return (
    <>
      <SimpleGrid columns={3} spacing={5} mt={2}>
        {filterData?.map((item, index) => (
          <Card key={item?.id} gap={6} border={`1px solid ${grayBorderColor}`}>
            <Flex gap={4} alignItems={'center'} justifyContent={'flex-start'}>
              <Box>{item?.icon}</Box>
              <Text
                fontSize={'16px'}
                cursor={'pointer'}
                fontWeight={'medium'}
                _hover={{ color: primaryBlueText }}
              >
                {item?.title}
              </Text>
            </Flex>
            <Text
              height={28}
              color={headingTextColor}
              fontSize={'14px'}
              fontWeight={'light'}
              pt={item?.description === 'Coming soon...' ? 5 : 0}
            >
              {item?.description}
              <chakra.span
                color={headingTextColor}
                fontSize={'14px'}
                fontWeight={'light'}
              >
                <Link href={item?.url} isExternal color={primaryBlueText}>
                  {' '}
                  Read more
                </Link>{' '}
              </chakra.span>
            </Text>
            <Flex alignItems={'center'} justifyContent={'space-between'}>
              <Text fontSize={'sm'} fontWeight={'medium'}>
                {!item?.score ? 'Coming soon...' : 'Score'}
              </Text>
              <Button
                size='sm'
                fontSize={'xs'}
                hidden={!item?.score}
                isDisabled={isArchived}
                title='Compliance score'
                onClick={() => onCheck(index)}
              >
                {item?.score === '0 %' ? 'N/A' : item?.score}
              </Button>
            </Flex>
          </Card>
        ))}
      </SimpleGrid>

      {isOpen && (
        <ComplianceChecks
          tabs={tabs}
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
