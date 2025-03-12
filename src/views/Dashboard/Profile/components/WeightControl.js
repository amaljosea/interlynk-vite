import { useMutation, useQuery } from '@apollo/client'
import { useEffect, useState } from 'react'
import { validScore } from 'utils/formValidationUtils'

import { InfoIcon } from '@chakra-ui/icons'
import {
  Box,
  Button,
  Flex,
  Input,
  SimpleGrid,
  SkeletonText,
  Stack,
  Text,
  Tooltip
} from '@chakra-ui/react'
import { FormControl, FormErrorMessage, FormLabel } from '@chakra-ui/react'
import {
  RangeSlider,
  RangeSliderFilledTrack,
  RangeSliderMark,
  RangeSliderThumb,
  RangeSliderTrack
} from '@chakra-ui/react'

import Card from 'components/Card/Card'
import CardBody from 'components/Card/CardBody'
import CardHeader from 'components/Card/CardHeader'

import useCustomToast from 'hooks/useCustomToast'
import useQueryParam from 'hooks/useQueryParam'
import { useThemeColor } from 'hooks/useThemeColors'

import { UpdateScoreSetting } from 'graphQL/Mutation'
import { GetScoreSetting } from 'graphQL/Queries'

import { MdGraphicEq } from 'react-icons/md'

const WeightControl = () => {
  const { primaryTextColor, primaryBlueText } = useThemeColor([
    'primaryTextColor',
    'primaryBlueText'
  ])
  const infoWeights = `Relative weights of factors contributing to the component health score (must add up to 100).`
  const infoAge = `Factors contributing to the age score. For example, number of days of inactivity before component is declared abondoned.`
  const infoCommunity = `Factors contrinbuting to the community score. For example, minimum number of contributors that is considered a community and maximum number of contributors beyond which component is considered widely supported`
  const tab = useQueryParam('tab')
  const { showToast } = useCustomToast()
  const { inverseSecondaryBgColor } = useThemeColor(['inverseSecondaryBgColor'])

  const [updateScore, { loading: updateLoading }] =
    useMutation(UpdateScoreSetting)

  const { data, loading } = useQuery(GetScoreSetting, {
    skip: tab === 'health' ? false : true
  })
  const { scoreSetting } = data?.organization || ''

  const [threshold, setThreshold] = useState(365)
  const [communityScore, setCommunityScore] = useState([5, 20])
  const [ageWeight, setAgeWeight] = useState(30)
  const [communityWeight, setCommunityWeight] = useState(30)
  const [securityWeight, setSecurityWeight] = useState(40)

  const [showTooltip, setShowTooltip] = useState(false)

  const labelStyles = {
    mt: '2',
    fontSize: 'sm'
  }

  function isInvalidArray(input) {
    return (
      Array.isArray(input) &&
      input.length === 2 &&
      input[0] === 0 &&
      input[1] === 0
    )
  }

  const totalAge =
    Number(ageWeight) + Number(communityWeight) + Number(securityWeight)

  const handleSubmit = async () => {
    if (totalAge !== 100) {
      showToast({
        description: (
          <Stack spacing={1}>
            <Text> Values must add to 100</Text>
            <Text>e.g: age + security + community = 100</Text>
          </Stack>
        ),
        status: 'error'
      })
    } else {
      await updateScore({
        variables: {
          ageWeight: Number(ageWeight),
          communityWeight: Number(communityWeight),
          securityWeight: Number(securityWeight),
          componentAbandonedThreshold: Number(threshold),
          contributorThresholdMin: communityScore[0],
          contributorThresholdMax: communityScore[1]
        }
      }).then((res) => {
        if (res?.data?.scoreSettingUpdate?.errors?.lenth > 0) {
          showToast({
            description: res?.data?.scoreSettingUpdate?.errors[0],
            status: 'error'
          })
        } else {
          showToast({
            description: 'Scores updated successfully',
            status: 'success'
          })
        }
      })
    }
  }

  const disabled =
    !validScore(ageWeight) ||
    !validScore(communityWeight) ||
    !validScore(securityWeight) ||
    !threshold ||
    threshold > 365 ||
    isInvalidArray(communityScore)

  useEffect(() => {
    if (scoreSetting) {
      setAgeWeight(scoreSetting?.ageWeight * 100 || 0)
      setCommunityWeight(scoreSetting?.communityWeight * 100 || 0)
      setSecurityWeight(scoreSetting?.securityWeight * 100 || 0)
      setThreshold(scoreSetting?.componentAbandonedThreshold || '')
      setCommunityScore([
        scoreSetting?.contributorThresholdMin,
        scoreSetting?.contributorThresholdMax
      ])
    }
  }, [scoreSetting])

  if (loading)
    return (
      <SkeletonText
        mx='2'
        mt={4}
        noOfLines={4}
        spacing='4'
        skeletonHeight='4'
      />
    )

  return (
    <Stack spacing={6}>
      <Flex flexDirection={'column'}>
        <Stack direction={'row'} alignItems={'center'}>
          <Text fontSize='lg' color={primaryTextColor} fontWeight='bold'>
            Health Scoring
          </Text>
        </Stack>
        <Text fontSize={'sm'}>
          Platform scores components and versions using its age, community
          engagement and active vulnerabilities.
          <br />
          Use following controls to customize health scoring.
        </Text>
      </Flex>
      <SimpleGrid columns={3}>
        {/* HEALTH WEIGHT AGE */}
        <Card p={0} boxShadow='none'>
          <CardHeader mb='12px'>
            <Stack direction={'row'} alignItems={'center'}>
              <Text
                fontSize='md'
                color={inverseSecondaryBgColor}
                fontWeight='bold'
              >
                Relative Weights
              </Text>
              <Tooltip label={infoWeights}>
                <InfoIcon cursor={'pointer'} color={primaryBlueText} />
              </Tooltip>
            </Stack>
          </CardHeader>
          <CardBody mt={2}>
            <Stack spacing={5}>
              <FormControl
                w={'400px'}
                isRequired
                isInvalid={!validScore(ageWeight)}
              >
                <FormLabel>Age Weight {`(%)`}</FormLabel>
                <Input
                  value={ageWeight}
                  onChange={(e) => setAgeWeight(e.target.value)}
                />
                <FormErrorMessage>Invalid Input</FormErrorMessage>
              </FormControl>
              <FormControl
                w={'400px'}
                isRequired
                isInvalid={!validScore(communityWeight)}
              >
                <FormLabel>Community Weight {`(%)`}</FormLabel>
                <Input
                  value={communityWeight}
                  onChange={(e) => setCommunityWeight(e.target.value)}
                />
                <FormErrorMessage>Invalid Input</FormErrorMessage>
              </FormControl>
              <FormControl
                w={'400px'}
                isRequired
                isInvalid={!validScore(securityWeight)}
              >
                <FormLabel>Security Weight {`(%)`}</FormLabel>
                <Input
                  value={securityWeight}
                  onChange={(e) => setSecurityWeight(e.target.value)}
                />
                <FormErrorMessage>Invalid Input</FormErrorMessage>
              </FormControl>
            </Stack>
          </CardBody>
        </Card>
        {/* AGE CONFIGURATIONS */}
        <Card p={0} boxShadow='none'>
          <CardHeader mb='12px'>
            <Stack direction={'row'} alignItems={'center'}>
              <Text
                fontSize='md'
                color={inverseSecondaryBgColor}
                fontWeight='bold'
              >
                Age Score
              </Text>
              <Tooltip label={infoAge}>
                <InfoIcon cursor={'pointer'} color={primaryBlueText} />
              </Tooltip>
            </Stack>
          </CardHeader>
          <CardBody mt={2}>
            <Stack spacing={5}>
              <FormControl
                w={'400px'}
                isRequired
                isInvalid={!threshold || threshold > 365}
              >
                <FormLabel>
                  Consider Repository Abandoned After Inactive {`(in days)`}
                </FormLabel>
                <Input
                  type='number'
                  value={threshold}
                  onChange={(e) => setThreshold(e.target.value)}
                />
                <FormErrorMessage>
                  Value must be between 1 and 365
                </FormErrorMessage>
              </FormControl>
              <FormControl w={'400px'}>
                <FormLabel>
                  Consider Package Abandoned After Inactive {`(in days)`}
                </FormLabel>
                <Input defaultValue={'365'} />
                <FormErrorMessage>
                  Value must be between 1 and 365
                </FormErrorMessage>
              </FormControl>
            </Stack>
          </CardBody>
        </Card>
        {/* COMMUNITY CONFIGURATIONS */}
        <Card p={0} boxShadow='none'>
          <CardHeader mb='12px'>
            <Stack direction={'row'} alignItems={'center'}>
              <Text
                fontSize='md'
                color={inverseSecondaryBgColor}
                fontWeight='bold'
              >
                Community Score
              </Text>
              <Tooltip label={infoCommunity}>
                <InfoIcon cursor={'pointer'} color={primaryBlueText} />
              </Tooltip>
            </Stack>
          </CardHeader>
          <CardBody mt={2}>
            <FormControl
              w={'400px'}
              isRequired
              isInvalid={isInvalidArray(communityScore)}
            >
              <FormLabel>Community Count Thresholds</FormLabel>
              <RangeSlider
                min={0}
                max={100}
                step={5}
                mb={4}
                value={communityScore}
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                onChange={(value) => setCommunityScore(value)}
              >
                {[0, 50, 100].map((item) => (
                  <RangeSliderMark key={item} value={item} {...labelStyles}>
                    {item}
                  </RangeSliderMark>
                ))}
                <RangeSliderTrack>
                  <RangeSliderFilledTrack />
                </RangeSliderTrack>
                {communityScore?.map((val, index) => (
                  <Tooltip
                    key={index}
                    hasArrow
                    label={val}
                    placement='top'
                    isOpen={showTooltip}
                  >
                    <RangeSliderThumb boxSize={4} index={index}>
                      <Box color={'darkgray'} as={MdGraphicEq} />
                    </RangeSliderThumb>
                  </Tooltip>
                ))}
              </RangeSlider>
              <FormErrorMessage>
                Contributor threshold max must be greater than 0
              </FormErrorMessage>
            </FormControl>
          </CardBody>
        </Card>
      </SimpleGrid>
      {/* ACTION */}
      <Button
        fontSize={'sm'}
        w={'fit-content'}
        colorScheme='blue'
        isDisabled={disabled}
        onClick={handleSubmit}
        isLoading={updateLoading}
      >
        Update
      </Button>
    </Stack>
  )
}

export default WeightControl
