import { useQuery } from '@apollo/client'
import { useParams } from 'react-router-dom'
import { getFullDate } from 'utils'

import { Box, Flex, Icon, SkeletonText, Stack, Text } from '@chakra-ui/react'

import Card from 'components/Card/Card'
import CardBody from 'components/Card/CardBody'
import { CustomText } from 'components/Misc/CustomText'
import PolicyResultsTable from 'components/Tables/PolicyResultsTable'

import { useThemeColor } from 'hooks/useThemeColors'

import { GetPolicy } from 'graphQL/Queries'

import { MdPolicy } from 'react-icons/md'

const PolicyDetails = () => {
  const params = useParams()
  const policyId = params.policyid

  const { secondaryBlueText } = useThemeColor(['secondaryBlueText'])

  const { data, loading } = useQuery(GetPolicy, {
    skip: policyId ? false : true,
    variables: { id: policyId }
  })

  const { policy } = data || {}

  if (loading)
    return (
      <Card>
        <SkeletonText mx='2' noOfLines={4} spacing='4' skeletonHeight='4' />
      </Card>
    )

  return (
    <Stack spacing={4}>
      <Card>
        <CardBody>
          <Flex
            gap={5}
            width={'100%'}
            direction={'row'}
            alignItems={'flex-start'}
          >
            <Icon
              h={'64px'}
              w={'64px'}
              as={MdPolicy}
              color={secondaryBlueText}
            />
            <Box>
              <Text fontSize={22} fontWeight={'semibold'}>
                {policy?.name}
              </Text>
              <Text fontSize={'sm'} my={0.5}>
                {policy?.description || ''}
              </Text>
              <Flex
                mt={8}
                w={'100%'}
                rowGap={4}
                columnGap={20}
                flexWrap='wrap'
                alignItems={'flex-start'}
              >
                <Stack spacing={1} fontSize={'sm'}>
                  <CustomText>Result Type</CustomText>
                  <Text textTransform={'capitalize'}>{policy?.resultType}</Text>
                </Stack>
                <Stack spacing={1} fontSize={'sm'}>
                  <CustomText>Operator :</CustomText>
                  <Text textTransform={'capitalize'}>{policy?.operator}</Text>
                </Stack>
                <Stack spacing={1} fontSize={'sm'}>
                  <CustomText>Exclude Internal :</CustomText>
                  <Text>{policy?.excludeInternalComponent ? 'Yes' : 'No'}</Text>
                </Stack>
                <Stack spacing={1} fontSize={'sm'}>
                  <CustomText>Exclude Primary :</CustomText>
                  <Text>{policy?.excludePrimaryComponent ? 'Yes' : 'No'}</Text>
                </Stack>
                <Stack spacing={1} fontSize={'sm'}>
                  <CustomText>Created At :</CustomText>
                  <Text>{getFullDate(policy?.createdAt)}</Text>
                </Stack>
                <Stack spacing={1} fontSize={'sm'}>
                  <CustomText>Updated At :</CustomText>
                  <Text>{getFullDate(policy?.updatedAt)}</Text>
                </Stack>
              </Flex>
            </Box>
          </Flex>
        </CardBody>
      </Card>
      <Card>
        <CardBody>
          <PolicyResultsTable />
        </CardBody>
      </Card>
    </Stack>
  )
}

export default PolicyDetails
