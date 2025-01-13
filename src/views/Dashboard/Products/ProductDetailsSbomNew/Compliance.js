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

import { ActiveCompliances, GetSbomQualityScores } from 'graphQL/Queries'

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

  const onCheck = (index) => {
    setActiveTab(index)
    onOpen()
  }

  const filterData = activeCompliances?.filter(
    (item) => item?.complianceType !== 'unspecified'
  )

  const tabs = filterData?.map((item) => item?.type)

  const getScore = (type) => {
    switch (type) {
      case 'fda':
        return fdaLoading ? (
          <Spinner size='xs' />
        ) : (
          `${fda?.score === '0 %' || fda?.score === 'NaN %' ? 'N/A' : Math.round(fda?.score)} %`
        )
      case 'ntia':
        return ntiaLoading ? (
          <Spinner size='xs' />
        ) : (
          `${ntia?.score === '0 %' || ntia?.score === 'NaN %' ? 'N/A' : Math.round(ntia?.score)} %`
        )
      case 'bsi':
        return ''
    }
  }

  const getTitle = (type) => {
    switch (type) {
      case 'fda':
        return 'FDA Cybersecurity Compliance'
      case 'ntia':
        return 'NTIA Minimum Elements'
      case 'bsi':
        return 'BSI TR-03183'
    }
  }

  const getDesc = (type) => {
    switch (type) {
      case 'fda':
        return 'SBOM requirements from FDA issued the final guidance Cybersecurity in Medical Devices: Quality System Considerations and Content of Premarket Submissions.'
      case 'ntia':
        return 'The NTIA (National Telecommunications and Information Administration) Minimum Elements for a Software Bill of Materials (SBOM) are a set of guidelines and recommendations that define the essential information an SBOM should contain.'
      case 'bsi':
        return 'The Technical Guideline TR-03183: Cyber Resilience Requirements for Manufacturers and Products aims to provide manufacturers with advance access to the type of requirements that will be imposed on them by the future Cyber Resilience Act (CRA) of the EU.'
    }
  }

  const getIcon = (type) => {
    switch (type) {
      case 'fda':
        return FDA
      case 'ntia':
        return NTIA
      case 'bsi':
        return BSI
    }
  }

  const getLink = (type) => {
    switch (type) {
      case 'fda':
        return 'https://www.fda.gov/media/119933/download'
      case 'ntia':
        return 'https://www.ntia.doc.gov/files/ntia/publications/sbom_minimum_elements_report.pdf'
      case 'bsi':
        return 'https://www.bsi.bund.de/SharedDocs/Downloads/EN/BSI/Publications/TechGuidelines/TR03183/BSI-TR-03183-2.pdf?__blob=publicationFile&v=5'
      default:
        return '#'
    }
  }

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
          <Card key={index} gap={6} border={`1px solid ${grayBorderColor}`}>
            <Flex gap={4} alignItems={'center'} justifyContent={'flex-start'}>
              <Box>
                <Img
                  alt='NTIA'
                  mr={'auto'}
                  objectFit={'contain'}
                  src={getIcon(item?.complianceType)}
                  height={item?.complianceType ? '44px' : '46px'}
                />
              </Box>
              <Text
                fontSize={'16px'}
                cursor={'pointer'}
                fontWeight={'medium'}
                _hover={{ color: primaryBlueText }}
              >
                {getTitle(item?.complianceType) || ''}
              </Text>
            </Flex>
            <Text
              height={28}
              fontSize={'14px'}
              fontWeight={'light'}
              color={headingTextColor}
              pt={item?.complianceType === 'bsi' ? 5 : 0}
            >
              {getDesc(item?.complianceType) || ''}
              <chakra.span
                fontSize={'14px'}
                fontWeight={'light'}
                color={headingTextColor}
              >
                <Link
                  href={getLink(item?.complianceType)}
                  isExternal
                  color={primaryBlueText}
                >
                  {' '}
                  Read more
                </Link>{' '}
              </chakra.span>
            </Text>
            <Flex alignItems={'center'} justifyContent={'space-between'}>
              <Text fontSize={'sm'} fontWeight={'medium'}>
                {item?.complianceType === 'bsi' ? 'Coming soon...' : 'Score'}
              </Text>
              <Button
                size='sm'
                fontSize={'xs'}
                isDisabled={isArchived}
                title='Compliance score'
                onClick={() => onCheck(index)}
                hidden={item?.complianceType === 'bsi'}
              >
                {getScore(item?.complianceType)}
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
