import { useQuery } from '@apollo/client'
import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { isSbomArchived } from 'utils'
import { complianceList } from 'variables/general'
import ComplianceChecks from 'views/Sbom/components/ComplianceChecks'

import {
  Box,
  Button,
  Flex,
  Img,
  Link,
  SimpleGrid,
  Spinner,
  Text,
  chakra,
  useDisclosure
} from '@chakra-ui/react'

import Card from 'components/Card/Card'
import LynkLoader from 'components/Misc/LynkLoader'

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

  const isArchived = isSbomArchived(sbomData)

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

  const getTitle = (type) =>
    complianceList?.find((item) => item?.slug === type)?.title

  const getDesc = (type) =>
    complianceList?.find((item) => item?.slug === type)?.desc

  const getIcon = (type) =>
    complianceList?.find((item) => item?.slug === type)?.img

  const getLink = (type) =>
    complianceList?.find((item) => item?.slug === type)?.url

  if (loading) {
    return (
      <SimpleGrid columns={3} spacing={5} mt={2}>
        {[1, 2, 3].map((item) => (
          <Card p={0} key={item} border={`1px solid ${grayBorderColor}`}>
            <LynkLoader />
          </Card>
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
