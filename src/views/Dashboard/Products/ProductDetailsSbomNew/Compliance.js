/* eslint-disable no-unused-vars */
import { useQuery } from '@apollo/client'
import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { isSbomArchived, truncatedValue } from 'utils'
import { COMPLIANCES } from 'variables/general'
import ComplianceChecks from 'views/Sbom/components/ComplianceChecks'

import {
  Box,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Flex,
  Img,
  Link,
  SimpleGrid,
  SkeletonCircle,
  SkeletonText,
  Spinner,
  Text,
  chakra,
  useDisclosure
} from '@chakra-ui/react'

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

  const { activeCompliances } = compliances?.organization || {}
  const { nodes: ntiaData } = ntiaResult?.complianceReports || {}
  const { nodes: fdaData } = fdaResult?.complianceReports || {}
  const fda = fdaData?.length > 0 ? fdaData[0] : []
  const ntia = ntiaData?.length > 0 ? ntiaData[0] : []

  const onCheck = (index) => {
    setActiveTab(index)
    onOpen()
  }

  // const filterData = activeCompliances?.filter(
  //   (item) => item?.complianceType !== 'unspecified'
  // )

  // const getTitle = (type) =>
  //   COMPLIANCES?.find((item) => item?.slug === type)?.title

  // const getDesc = (type) =>
  //   COMPLIANCES?.find((item) => item?.slug === type)?.desc

  // const getIcon = (type) =>
  //   COMPLIANCES?.find((item) => item?.slug === type)?.logo

  const getScore = (type) => {
    switch (type) {
      case 'FDA Cybersecurity Compliance':
        return fdaLoading ? (
          <Spinner size='xs' />
        ) : (
          `${fda?.score === '0 %' || fda?.score === 'NaN %' ? 'N/A' : Math.round(fda?.score)} %`
        )
      case 'NTIA Minimum Elements':
        return ntiaLoading ? (
          <Spinner size='xs' />
        ) : (
          `${ntia?.score === '0 %' || ntia?.score === 'NaN %' ? 'N/A' : Math.round(ntia?.score)} %`
        )
      case 'bsi':
        return 'N/A'
      default:
        return 'N/A'
    }
  }

  const active = ['NTIA Minimum Elements', 'FDA Cybersecurity Compliance']

  if (loading) {
    return (
      <SimpleGrid columns={3} spacing={5} mt={2}>
        {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
          <Card key={item} border={`1px solid ${grayBorderColor}`}>
            <CardBody>
              <SkeletonCircle size='10' />
              <SkeletonText
                mt='4'
                noOfLines={4}
                spacing='4'
                skeletonHeight='2'
              />
            </CardBody>
          </Card>
        ))}
      </SimpleGrid>
    )
  }

  return (
    <>
      <SimpleGrid columns={4} spacing={5} mt={2}>
        {COMPLIANCES?.map((item, index) => (
          <Card
            size={'sm'}
            key={index}
            variant={'filled'}
            border={`1px solid ${grayBorderColor}`}
          >
            <CardHeader
              pb={2}
              gap={4}
              as={Flex}
              alignItems={'center'}
              justifyContent={'flex-start'}
            >
              <Box>
                <Img
                  alt='NTIA'
                  mr={'auto'}
                  height={10}
                  objectFit={'contain'}
                  src={item?.logo}
                  // filter={'invert(1) brightness(1.2);'}
                  // height={item?.complianceType ? '44px' : '46px'}
                />
              </Box>
              <Text
                fontSize={'16px'}
                cursor={'pointer'}
                fontWeight={'medium'}
                _hover={{ color: primaryBlueText }}
              >
                {item?.title}
              </Text>
            </CardHeader>
            <CardBody>
              <Text fontSize={'14px'} color={headingTextColor}>
                {truncatedValue(item?.desc, 150)}
                <chakra.span fontSize={'14px'} color={headingTextColor}>
                  <Link isExternal href={item?.link} color={primaryBlueText}>
                    {' '}
                    Read more
                  </Link>{' '}
                </chakra.span>
              </Text>
            </CardBody>
            <CardFooter
              as={Flex}
              alignItems={'center'}
              justifyContent={'space-between'}
            >
              <Text fontSize={'sm'} fontWeight={'medium'}>
                {active?.includes(item?.title) ? 'Score' : 'Coming soon...'}
              </Text>
              <Button
                size='sm'
                fontSize={'xs'}
                colorScheme='blue'
                variant={'outline'}
                isDisabled={isArchived}
                title='Compliance score'
                onClick={() => onCheck(index)}
                hidden={item?.complianceType === 'bsi'}
              >
                {getScore(item?.title)}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </SimpleGrid>

      {isOpen && (
        <ComplianceChecks
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
