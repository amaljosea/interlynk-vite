import { useMutation } from '@apollo/client'
import React from 'react'

import { CheckCircleIcon, CloseIcon } from '@chakra-ui/icons'
import { Icon } from '@chakra-ui/react'
import {
  Box,
  Button,
  Flex,
  Grid,
  GridItem,
  SimpleGrid,
  Text,
  useDisclosure
} from '@chakra-ui/react'
import { useColorModeValue } from '@chakra-ui/react'

import LynkModal from 'components/LynkModal'

import useCustomToast from 'hooks/useCustomToast'
import { useGlobalQueryContext } from 'hooks/useGlobalQueryContext'
import { useThemeColor } from 'hooks/useThemeColors'

import { EnterpriseUpgradeRequest } from 'graphQL/Mutation'

import { GiScales } from 'react-icons/gi'

const BalanceIconComponent = () => {
  return <Icon as={GiScales} boxSize={6} color='gray.500' />
}

const PlanTable = () => {
  const { showToast } = useCustomToast()
  const { isFreeTier } = useGlobalQueryContext()
  const { isOpen, onOpen, onClose } = useDisclosure()

  const [sendRequest, { loading }] = useMutation(EnterpriseUpgradeRequest)
  const {
    primaryBgColor,
    primaryErrorColor,
    primarySuccessColor,
    primaryBlueText
  } = useThemeColor([
    'primaryBgColor',
    'primaryErrorColor',
    'primarySuccessColor',
    'primaryBlueText'
  ])
  const usageData = {
    title: 'Usage',
    features: [
      { feature: 'Users', val1: '2', val2: 'Custom' },
      { feature: 'Products', val1: '5', val2: 'Unlimited' }
    ]
  }

  const sbomFeatures = {
    title: 'SBOM Features',
    features: [
      { feature: 'SBOM Management', val1: true, val2: true },
      { feature: 'SBOM Manual Build', val1: true, val2: true },
      { feature: 'SBOM Editor', val1: true, val2: true },
      { feature: 'SBOM Quality Scoring', val1: true, val2: true },
      { feature: 'SBOM Compliance Assessment', val1: true, val2: true },
      { feature: 'SBOM ShareLynk', val1: true, val2: true },
      { feature: 'SBOM Automation Rules', val1: false, val2: true },
      { feature: 'SBOM Parts Composition', val1: false, val2: true },
      { feature: 'SBOM In-Place Signing', val1: false, val2: true },
      { feature: 'SBOM Component Privacy', val1: false, val2: true }
    ]
  }

  const riskManagementFeatures = {
    title: 'Risk Management Features',
    features: [
      { feature: 'Vulnerability Management', val1: true, val2: true },
      { feature: 'Exploitability Editor (VEX)', val1: true, val2: true },
      {
        feature: 'End-of-life / End-of-service Detection',
        val1: false,
        val2: true
      },
      { feature: 'Open Source Risk Scoring', val1: false, val2: true },
      { feature: 'OpenSSF Scorecard Risk Scoring', val1: false, val2: true }
    ]
  }

  const managementAndReportingFeatures = {
    title: 'Management & Reporting Features',
    features: [
      { feature: 'Policy Management', val1: true, val2: true },
      { feature: 'Role Based Access Control (RBAC)', val1: false, val2: true },
      { feature: 'Custom Roles', val1: false, val2: true },
      { feature: 'Integrated License Manager', val1: false, val2: true },
      { feature: 'Analytics', val1: false, val2: true }
    ]
  }

  const supportFeatures = {
    title: 'Support Features',
    features: [
      { feature: 'Product Support', val1: 'Email', val2: 'Chat, Slack, Email' }
    ]
  }

  const integrationsFeatures = {
    title: 'Integrations Features',
    features: [
      {
        feature: 'Workflow Integrations',
        val1: false,
        val2: 'JIRA, Teams, Slack, GitHub'
      }
    ]
  }

  const boxShadow = useColorModeValue(
    '0px 4px 16px rgba(0, 0, 0, 0.1)',
    '0px 4px 16px rgba(255, 255, 255, 0.1)'
  )

  const handleContact = () => {
    sendRequest().then((res) => {
      if (res?.data?.enterpriseUpgradeRequest?.success) {
        showToast({
          description:
            'A support request has been created for you. We will contact you within 2-business days.',
          status: 'success'
        })
        onClose()
      }
    })
  }

  // Combine all feature objects into one array
  const allFeatures = [
    usageData,
    sbomFeatures,
    riskManagementFeatures,
    managementAndReportingFeatures,
    supportFeatures,
    integrationsFeatures
  ]

  return (
    <Box>
      {/* Plan Overview Section */}
      <Grid templateColumns='repeat(4, 1fr)' gap={8} mb={6}>
        <GridItem>
          <Text fontWeight='bold'>Plan</Text>
          <Text>{isFreeTier ? 'Free' : 'Enterprise'}</Text>
        </GridItem>
        <GridItem>
          <Text fontWeight='bold'>Products</Text>
          <Text>{isFreeTier ? '5' : 'Unlimited'}</Text>
        </GridItem>
        <GridItem>
          <Text fontWeight='bold'>Users</Text>
          <Text>{isFreeTier ? '2' : 'Unlimited'}</Text>
        </GridItem>
        <GridItem>
          <Text fontWeight='bold'>Renewal Date</Text>
          <Text>N/A</Text>
        </GridItem>
      </Grid>

      {/* Upgrade Modal Button */}
      {isFreeTier && (
        <Flex justify='left' marginTop={'40px'}>
          <Button colorScheme='blue' onClick={onOpen}>
            Upgrade Plan
          </Button>
        </Flex>
      )}

      {/* Replace the existing modal implementation with LynkModal */}
      <LynkModal
        isOpen={isOpen}
        onClose={onClose}
        isLoading={loading}
        onSubmit={handleContact}
        title='Upgrade to Enterprise Plan'
        buttonText='Contact Us'
        buttonColor='blue'
        maxW='800px'
        maxH='700px'
        Icon={BalanceIconComponent}
      >
        {/* Main Grid Layout with Three Columns */}
        <SimpleGrid
          columns={3}
          spacing={4}
          maxH={'500px'}
          overflowY={'scroll'}
          css={{
            '&::-webkit-scrollbar': {
              display: 'none' // Hides the scrollbar in WebKit browsers (Chrome, Safari)
            },
            scrollbarWidth: 'none' // Hides the scrollbar in Firefox
          }}
          paddingTop={'10px'}
          paddingBottom={'20px'}
        >
          {/* Left Column: Feature Names and Titles */}
          <Box p={4} w={'400px'}>
            <Text
              fontSize='md'
              fontWeight='semibold'
              mb={2}
              h='30px'
              color={'gray.500'}
              textTransform={'uppercase'}
            >
              {''}
            </Text>
            {allFeatures.map((featureSet, featureIndex) => (
              <React.Fragment key={featureIndex}>
                {/* Feature Set Title */}
                <Text
                  fontSize='md'
                  fontWeight='semibold'
                  mb={1}
                  mt={'20px'}
                  h='30px'
                  color={primaryBlueText}
                >
                  {featureSet.title}
                </Text>

                {/* Feature Names */}
                {featureSet.features.map((item, index) => (
                  <Text
                    key={index}
                    mb={2}
                    display='flex'
                    alignItems='center'
                    h='30px'
                    fontSize='sm'
                    fontWeight='normal'
                  >
                    {item.feature}
                  </Text>
                ))}
              </React.Fragment>
            ))}
          </Box>

          {/* Center Column: Free Plan Values */}
          <Box
            p={4}
            display='flex'
            flexDirection={'column'}
            alignItems={'center'}
          >
            <Text
              fontSize='md'
              fontWeight='normal'
              mb={2}
              h='30px'
              color={'gray.500'}
              textTransform={'uppercase'}
            >
              {'Free'}
            </Text>
            {allFeatures.map((featureSet, featureIndex) => (
              <React.Fragment key={featureIndex}>
                <Text
                  fontSize='md'
                  fontWeight='semibold'
                  mb={'5px'}
                  mt={'10px'}
                  h='30px'
                >
                  {' '}
                </Text>
                {featureSet.features.map((item, index) => (
                  <Text
                    key={index}
                    mb={2}
                    textAlign='center'
                    display='flex'
                    alignItems='center'
                    h='30px'
                    color={
                      typeof item.val1 === 'boolean'
                        ? item.val1
                          ? primarySuccessColor
                          : primaryErrorColor
                        : 'inherit'
                    }
                  >
                    {typeof item.val1 === 'boolean' ? (
                      item.val1 ? (
                        <CheckCircleIcon />
                      ) : (
                        <Box
                          display='flex'
                          alignItems='center'
                          justifyContent='center'
                          bg={primaryErrorColor}
                          borderRadius='full'
                          width='16px'
                          height='16px'
                        >
                          <CloseIcon color={primaryBgColor} boxSize='8px' />
                        </Box>
                      )
                    ) : (
                      item.val1
                    )}
                  </Text>
                ))}
              </React.Fragment>
            ))}
          </Box>

          {/* Right Column: Enterprise Plan Values */}
          <Box
            borderRadius={'10px'}
            p={4}
            w={'240px'}
            display='flex'
            flexDirection={'column'}
            alignItems={'center'}
            boxShadow={boxShadow}
          >
            <Text
              fontSize='md'
              fontWeight='semibold'
              mb={2}
              h='30px'
              color={primaryBlueText}
              textTransform={'uppercase'}
            >
              {'Enterprise'}
            </Text>
            {allFeatures.map((featureSet, featureIndex) => (
              <React.Fragment key={featureIndex}>
                <Text
                  fontSize='md'
                  fontWeight='semibold'
                  mb={'5px'}
                  mt={'9px'}
                  h='30px'
                >
                  {''}
                </Text>
                {featureSet.features.map((item, index) => (
                  <Text
                    key={index}
                    mb={2}
                    textAlign='center'
                    display='flex'
                    alignItems='center'
                    h='30px'
                    color={
                      typeof item.val2 === 'boolean'
                        ? item.val2
                          ? primarySuccessColor
                          : primaryErrorColor
                        : 'inherit'
                    }
                  >
                    {typeof item.val2 === 'boolean' ? (
                      item.val2 ? (
                        <CheckCircleIcon />
                      ) : (
                        <Box
                          display='flex'
                          alignItems='center'
                          justifyContent='center'
                          bg={primaryErrorColor}
                          borderRadius='full'
                          width='16px'
                          height='16px'
                        >
                          <CloseIcon color={primaryBgColor} boxSize='8px' />
                        </Box>
                      )
                    ) : (
                      item.val2
                    )}
                  </Text>
                ))}
              </React.Fragment>
            ))}
          </Box>
        </SimpleGrid>
      </LynkModal>
    </Box>
  )
}

export default PlanTable
